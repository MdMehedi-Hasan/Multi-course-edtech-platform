import { Router, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../db/prisma.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateAndSaveRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '../lib/auth.js';
import { authenticate, optionalAuthenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import {
  RegisterSchema,
  GoogleAuthSchema,
  SubmitInstructorApplicationSchema,
  LoginSchema,
  RefreshTokenSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
} from '../dtos/auth.dto.js';
import { Role, ApplicationStatus } from '@prisma/client';
import { recordAuditLog } from '../lib/audit.js';

const router = Router();

// 1. POST /api/auth/register (STRICT: Normal public registration ONLY creates a STUDENT account)
router.post(
  '/register',
  authRateLimiter,
  validateBody(RegisterSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, password, name } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'USER_EXISTS',
          message: 'An account with this email address already exists.',
        });
        return;
      }

      const passwordHash = await hashPassword(password);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // STRICT SECURITY RULE: Public registration ALWAYS creates Role.STUDENT
      // Client-supplied role selections (INSTRUCTOR/ADMIN) are strictly forbidden
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: Role.STUDENT,
          isInstructorApproved: false,
          verificationToken,
          profile: {
            create: {
              name,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = await generateAndSaveRefreshToken(user.id);
      setAuthCookies(res, accessToken, refreshToken);

      // Record audit log
      await recordAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        action: 'USER_REGISTER',
        target: `User:${user.id}`,
        metadata: { role: Role.STUDENT },
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            verificationToken: user.verificationToken,
            profile: user.profile,
            createdAt: user.createdAt,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      console.error('Registration error details:', error?.message || error, error?.stack);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to complete registration.',
      });
    }
  }
);

// 2. POST /api/auth/login
router.post(
  '/login',
  authRateLimiter,
  validateBody(LoginSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { profile: true },
      });

      if (!user || user.deletedAt) {
        res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        });
        return;
      }

      if (user.isSuspended) {
        res.status(403).json({
          success: false,
          error: 'ACCOUNT_SUSPENDED',
          message: `Your account has been suspended by an administrator. Reason: ${user.suspensionReason || 'Policy violation'}`,
        });
        return;
      }

      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        });
        return;
      }

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = await generateAndSaveRefreshToken(user.id);
      setAuthCookies(res, accessToken, refreshToken);

      // Record audit log for login
      await recordAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        action: 'USER_LOGIN',
        target: `User:${user.id}`,
        metadata: { role: user.role },
      });

      res.json({
        success: true,
        message: 'Authentication successful.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            profile: user.profile,
            createdAt: user.createdAt,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to authenticate user.',
      });
    }
  }
);

// 3. POST /api/auth/refresh (Token Rotation)
router.post(
  '/refresh',
  validateBody(RefreshTokenSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const tokenString = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!tokenString) {
        res.status(401).json({
          success: false,
          error: 'TOKEN_REQUIRED',
          message: 'Refresh token is required.',
        });
        return;
      }

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: tokenString },
        include: { user: { include: { profile: true } } },
      });

      if (!storedToken) {
        res.status(401).json({
          success: false,
          error: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token not recognized.',
        });
        return;
      }

      // Reuse detection safeguard: If token was already revoked, revoke all tokens for this user!
      if (storedToken.isRevoked) {
        await prisma.refreshToken.updateMany({
          where: { userId: storedToken.userId },
          data: { isRevoked: true },
        });
        clearAuthCookies(res);
        res.status(401).json({
          success: false,
          error: 'TOKEN_REUSE_DETECTED',
          message: 'Security warning: Revoked refresh token reuse attempt. All user sessions invalidated.',
        });
        return;
      }

      if (storedToken.expiresAt < new Date()) {
        res.status(401).json({
          success: false,
          error: 'EXPIRED_REFRESH_TOKEN',
          message: 'Refresh token has expired. Please log in again.',
        });
        return;
      }

      // Rotate Refresh Token
      const newRefreshToken = await generateAndSaveRefreshToken(storedToken.userId, tokenString);
      const newAccessToken = generateAccessToken({
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      });

      setAuthCookies(res, newAccessToken, newRefreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully.',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to refresh access token.',
      });
    }
  }
);

// 4. POST /api/auth/logout
router.post('/logout', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tokenString = req.cookies?.refreshToken || req.body?.refreshToken;

    if (tokenString) {
      await prisma.refreshToken.updateMany({
        where: { token: tokenString },
        data: { isRevoked: true },
      });
    }

    clearAuthCookies(res);

    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to log out.',
    });
  }
});

// 5. POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  authRateLimiter,
  validateBody(ForgotPasswordSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (user && !user.deletedAt) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires,
          },
        });

        res.json({
          success: true,
          message: 'Password reset token generated.',
          data: {
            email: user.email,
            resetToken, // Returned for development/testing demo execution
          },
        });
        return;
      }

      // Generic response for security to avoid email enumeration
      res.json({
        success: true,
        message: 'If an account exists with that email, a password reset token has been sent.',
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to process forgot password request.',
      });
    }
  }
);

// 6. POST /api/auth/reset-password
router.post(
  '/reset-password',
  authRateLimiter,
  validateBody(ResetPasswordSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            gt: new Date(),
          },
          deletedAt: null,
        },
      });

      if (!user) {
        res.status(400).json({
          success: false,
          error: 'INVALID_TOKEN',
          message: 'Password reset token is invalid or has expired.',
        });
        return;
      }

      const passwordHash = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      // Revoke all refresh tokens for security
      await prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { isRevoked: true },
      });

      clearAuthCookies(res);

      res.json({
        success: true,
        message: 'Password reset successfully. Please log in with your new password.',
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to reset password.',
      });
    }
  }
);

// 7. POST /api/auth/verify-email
router.post(
  '/verify-email',
  validateBody(VerifyEmailSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { token } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          verificationToken: token,
        },
      });

      if (!user) {
        res.status(400).json({
          success: false,
          error: 'INVALID_TOKEN',
          message: 'Email verification token is invalid.',
        });
        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationToken: null,
        },
      });

      res.json({
        success: true,
        message: 'Email verified successfully.',
      });
    } catch (error: any) {
      console.error('Verify email error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to verify email.',
      });
    }
  }
);

// 8. GET /api/auth/me
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        profile: true,
      },
    });

    if (!user || user.deletedAt) {
      res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Authenticated user profile not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isInstructorApproved: user.isInstructorApproved,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to fetch current user profile.',
    });
  }
});

// 9. POST /api/auth/google (Google OAuth Signup & Safe Existing Account Linking)
router.post(
  '/google',
  authRateLimiter,
  validateBody(GoogleAuthSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, name, avatarUrl } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { profile: true },
      });

      if (existingUser) {
        if (existingUser.deletedAt) {
          res.status(403).json({
            success: false,
            error: 'ACCOUNT_DEACTIVATED',
            message: 'This account has been deactivated. Please contact support.',
          });
          return;
        }

        if (existingUser.isSuspended) {
          res.status(403).json({
            success: false,
            error: 'ACCOUNT_SUSPENDED',
            message: `Account suspended: ${existingUser.suspensionReason || 'Policy violation'}`,
          });
          return;
        }

        // CRITICAL SECURITY RULE: Preserve existing user's authoritative backend role.
        // Existing STUDENT remains STUDENT, existing INSTRUCTOR remains INSTRUCTOR, existing ADMIN remains ADMIN.
        // Never upgrade or downgrade role on Google login!
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            isVerified: true, // Google accounts have verified email
          },
          include: { profile: true },
        });

        // Update profile avatar if missing
        if (!existingUser.profile?.avatarUrl && avatarUrl) {
          await prisma.profile.update({
            where: { userId: existingUser.id },
            data: { avatarUrl },
          });
        }

        const accessToken = generateAccessToken({
          userId: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role, // Authoritative role preserved!
        });

        const refreshToken = await generateAndSaveRefreshToken(updatedUser.id);
        setAuthCookies(res, accessToken, refreshToken);

        await recordAuditLog({
          actorId: updatedUser.id,
          actorEmail: updatedUser.email,
          action: 'USER_GOOGLE_LOGIN',
          target: `User:${updatedUser.id}`,
          metadata: { role: updatedUser.role, existingUserLinked: true },
        });

        res.json({
          success: true,
          message: 'Google login successful.',
          data: {
            user: {
              id: updatedUser.id,
              email: updatedUser.email,
              role: updatedUser.role,
              isVerified: true,
              profile: updatedUser.profile,
              createdAt: updatedUser.createdAt,
            },
            accessToken,
            refreshToken,
          },
        });
        return;
      }

      // NEW GOOGLE SIGNUP:
      // CRITICAL RULE: A new Google account MUST automatically become Role.STUDENT.
      // Do NOT allow Google signup to create ADMIN or INSTRUCTOR accounts automatically.
      const secureRandomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await hashPassword(secureRandomPassword);

      const newUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: Role.STUDENT,
          isVerified: true,
          isInstructorApproved: false,
          profile: {
            create: {
              name: name || normalizedEmail.split('@')[0],
              avatarUrl: avatarUrl || undefined,
            },
          },
        },
        include: { profile: true },
      });

      const accessToken = generateAccessToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      const refreshToken = await generateAndSaveRefreshToken(newUser.id);
      setAuthCookies(res, accessToken, refreshToken);

      await recordAuditLog({
        actorId: newUser.id,
        actorEmail: newUser.email,
        action: 'USER_GOOGLE_SIGNUP',
        target: `User:${newUser.id}`,
        metadata: { role: Role.STUDENT },
      });

      res.status(201).json({
        success: true,
        message: 'Google signup successful.',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            isVerified: true,
            profile: newUser.profile,
            createdAt: newUser.createdAt,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      console.error('Google auth error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to process Google authentication.',
      });
    }
  }
);

// 10. POST /api/auth/instructor-application (Submit Instructor Application Workflow)
router.post(
  '/instructor-application',
  optionalAuthenticate,
  validateBody(SubmitInstructorApplicationSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        name,
        email,
        bio,
        expertise,
        experienceYears,
        headline,
        website,
        github,
        linkedin,
        message,
      } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      let targetUserId: string;

      if (req.user) {
        targetUserId = req.user.userId;
      } else {
        // Find or create Student user if not logged in
        let user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          const autoPassword = crypto.randomBytes(16).toString('hex');
          const passwordHash = await hashPassword(autoPassword);
          user = await prisma.user.create({
            data: {
              email: normalizedEmail,
              passwordHash,
              role: Role.STUDENT,
              isVerified: false,
              profile: {
                create: {
                  name,
                  headline,
                  bio,
                  website,
                  github,
                  linkedin,
                },
              },
            },
          });
        }
        targetUserId = user.id;
      }

      // Check if this user is already an approved instructor
      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        include: { profile: true },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User account not found.',
        });
        return;
      }

      if (user.role === Role.INSTRUCTOR) {
        res.status(400).json({
          success: false,
          error: 'ALREADY_INSTRUCTOR',
          message: 'Your account is already an active Instructor.',
        });
        return;
      }

      // Check if user already has a pending application
      const existingPending = await prisma.instructorApplication.findFirst({
        where: {
          userId: targetUserId,
          status: ApplicationStatus.PENDING,
        },
      });

      if (existingPending) {
        res.status(409).json({
          success: false,
          error: 'APPLICATION_PENDING',
          message: 'You already have an instructor application pending administrator review.',
          data: existingPending,
        });
        return;
      }

      // Create new application in PENDING status
      // CRITICAL RULE: User role strictly remains STUDENT until Admin approves!
      const application = await prisma.instructorApplication.create({
        data: {
          userId: targetUserId,
          name,
          email: normalizedEmail,
          bio,
          expertise,
          experienceYears: experienceYears || 1,
          headline,
          website,
          github,
          linkedin,
          message,
          status: ApplicationStatus.PENDING,
        },
      });

      // Update user profile info if provided
      if (user.profile) {
        await prisma.profile.update({
          where: { userId: targetUserId },
          data: {
            name: name || user.profile.name,
            headline: headline || user.profile.headline,
            bio: bio || user.profile.bio,
            website: website || user.profile.website,
            github: github || user.profile.github,
            linkedin: linkedin || user.profile.linkedin,
          },
        });
      }

      await recordAuditLog({
        actorId: targetUserId,
        actorEmail: normalizedEmail,
        action: 'INSTRUCTOR_APPLICATION_SUBMITTED',
        target: `InstructorApplication:${application.id}`,
        metadata: { status: ApplicationStatus.PENDING, expertise },
      });

      res.status(201).json({
        success: true,
        message: 'Instructor application submitted successfully. Platform administrators will review your application.',
        data: application,
      });
    } catch (error: any) {
      console.error('Submit instructor application error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to submit instructor application.',
      });
    }
  }
);

// 11. GET /api/auth/instructor-application/me (Check my application status)
router.get(
  '/instructor-application/me',
  authenticate,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const application = await prisma.instructorApplication.findFirst({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: application,
      });
    } catch (error: any) {
      console.error('Get instructor application error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to fetch instructor application status.',
      });
    }
  }
);

export default router;

