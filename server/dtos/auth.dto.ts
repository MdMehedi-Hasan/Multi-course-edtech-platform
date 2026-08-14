import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email({ message: 'Invalid email address format' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(100, { message: 'Password cannot exceed 100 characters' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
});

export const GoogleAuthSchema = z.object({
  email: z.string().email({ message: 'Invalid email address format' }),
  name: z.string().min(1, { message: 'Name is required' }),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  googleId: z.string().optional(),
});

export const SubmitInstructorApplicationSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email format' }),
  bio: z.string().min(10, { message: 'Bio must be at least 10 characters' }),
  expertise: z.string().min(2, { message: 'Expertise is required' }),
  experienceYears: z.number().int().min(0).max(50).optional().default(1),
  headline: z.string().max(200).optional(),
  website: z.string().url().optional().or(z.literal('')),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  message: z.string().min(10, { message: 'Application message/proposal must be at least 10 characters' }),
});

export const ReviewInstructorApplicationSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address format' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address format' }),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required' }),
  newPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, { message: 'Verification token is required' }),
});
