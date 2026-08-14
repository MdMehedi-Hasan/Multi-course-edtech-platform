import { Router, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { authenticate, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { Role, ApplicationStatus } from '@prisma/client';
import { recordAuditLog } from '../lib/audit.js';

const router = Router();

// Protect ALL admin routes on the server side
router.use(authenticate, requireRoles(Role.ADMIN));

// -------------------------------------------------------------
// 1. DASHBOARD & SYSTEM OVERVIEW STATS
// GET /api/admin/stats
// -------------------------------------------------------------
router.get('/stats', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count({ where: { deletedAt: null } });
    const studentCount = await prisma.user.count({ where: { role: Role.STUDENT, deletedAt: null } });
    const instructorCount = await prisma.user.count({ where: { role: Role.INSTRUCTOR, deletedAt: null } });
    const adminCount = await prisma.user.count({ where: { role: Role.ADMIN, deletedAt: null } });

    const totalCourses = await prisma.course.count({ where: { deletedAt: null } });
    const publishedCourses = await prisma.course.count({ where: { isPublished: true, deletedAt: null } });
    const draftCourses = await prisma.course.count({ where: { isPublished: false, deletedAt: null } });
    const archivedCourses = await prisma.course.count({ where: { isArchived: true } });

    const totalEnrollments = await prisma.enrollment.count();
    const completedEnrollments = await prisma.enrollment.count({ where: { completedAt: { not: null } } });
    const courseCompletionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    // Estimated total revenue from course enrollments (pricing x enrollment)
    const enrollmentsWithCourse = await prisma.enrollment.findMany({
      select: {
        course: { select: { price: true } },
      },
    });
    const grossRevenue = enrollmentsWithCourse.reduce((acc, curr) => acc + (curr.course?.price || 0), 0);

    // Active users in last 30 days or total active users
    const activeUsers = totalUsers;

    // Recent platform activities (recent enrollments, audit logs, new courses)
    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    const recentEnrollments = await prisma.enrollment.findMany({
      take: 5,
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: { include: { profile: true } },
        course: { select: { title: true } },
      },
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        studentCount,
        instructorCount,
        adminCount,
        totalCourses,
        publishedCourses,
        draftCourses,
        archivedCourses,
        totalEnrollments,
        completedEnrollments,
        courseCompletionRate,
        grossRevenue,
        activeUsers,
        recentAuditLogs,
        recentEnrollments: recentEnrollments.map((e) => ({
          id: e.id,
          studentName: e.user.profile?.name || e.user.email.split('@')[0],
          studentEmail: e.user.email,
          courseTitle: e.course.title,
          enrolledAt: e.enrolledAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Fetch admin stats error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch admin stats.' });
  }
});

// -------------------------------------------------------------
// 2. USER MANAGEMENT
// GET /api/admin/users
// -------------------------------------------------------------
router.get('/users', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role, search, status } = req.query;

    const whereClause: any = {};

    if (status === 'deleted') {
      whereClause.deletedAt = { not: null };
    } else {
      whereClause.deletedAt = null;
    }

    if (role && Object.values(Role).includes(role as Role)) {
      whereClause.role = role as Role;
    }

    if (search) {
      const q = String(search).toLowerCase();
      whereClause.OR = [
        { email: { contains: q } },
        { profile: { name: { contains: q } } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        profile: true,
        _count: {
          select: {
            enrollments: true,
            authoredCourses: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        isVerified: u.isVerified,
        isInstructorApproved: u.isInstructorApproved,
        isSuspended: u.isSuspended,
        suspensionReason: u.suspensionReason,
        name: u.profile?.name || u.email.split('@')[0],
        headline: u.profile?.headline,
        avatarUrl: u.profile?.avatarUrl,
        enrollmentCount: u._count.enrollments,
        courseCount: u._count.authoredCourses,
        reviewCount: u._count.reviews,
        createdAt: u.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Fetch admin users error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch users list.' });
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        enrollments: {
          include: {
            course: {
              select: { id: true, title: true, slug: true, thumbnailUrl: true, price: true },
            },
          },
          orderBy: { enrolledAt: 'desc' },
        },
        authoredCourses: {
          select: { id: true, title: true, isPublished: true, isApproved: true, price: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          include: {
            course: { select: { title: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
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
        isSuspended: user.isSuspended,
        suspensionReason: user.suspensionReason,
        name: user.profile?.name || user.email.split('@')[0],
        headline: user.profile?.headline,
        bio: user.profile?.bio,
        avatarUrl: user.profile?.avatarUrl,
        website: user.profile?.website,
        github: user.profile?.github,
        linkedin: user.profile?.linkedin,
        createdAt: user.createdAt,
        enrollments: user.enrollments,
        authoredCourses: user.authoredCourses,
        reviews: user.reviews,
      },
    });
  } catch (error: any) {
    console.error('Fetch user detail error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch user details.' });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !Object.values(Role).includes(role as Role)) {
      res.status(400).json({ success: false, message: 'Invalid role parameter.' });
      return;
    }

    // Prevent admin self-demotion
    if (id === req.user!.userId && role !== Role.ADMIN) {
      res.status(400).json({ success: false, message: 'Admins cannot demote their own account role.' });
      return;
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Target user not found.' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: role as Role },
      include: { profile: true },
    });

    // Audit Log
    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: 'ROLE_CHANGE',
      target: `User:${targetUser.id} (${targetUser.email})`,
      metadata: { previousRole: targetUser.role, newRole: role },
    });

    res.json({
      success: true,
      message: `User role updated to ${role}.`,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to update user role.' });
  }
});

// PATCH /api/admin/users/:id/status (Suspend / Activate)
router.patch('/users/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isSuspended, suspensionReason } = req.body;

    if (id === req.user!.userId) {
      res.status(400).json({ success: false, message: 'Admins cannot suspend their own active account.' });
      return;
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        isSuspended: Boolean(isSuspended),
        suspensionReason: isSuspended ? (suspensionReason || 'Administrative suspension') : null,
      },
    });

    // Record Audit
    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: isSuspended ? 'USER_SUSPEND' : 'USER_ACTIVATE',
      target: `User:${targetUser.id} (${targetUser.email})`,
      metadata: { isSuspended, suspensionReason },
    });

    res.json({
      success: true,
      message: isSuspended ? 'User account suspended.' : 'User account reactivated.',
      data: {
        id: updated.id,
        isSuspended: updated.isSuspended,
        suspensionReason: updated.suspensionReason,
      },
    });
  } catch (error: any) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to update user status.' });
  }
});

// DELETE /api/admin/users/:id (Soft delete)
router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id === req.user!.userId) {
      res.status(400).json({ success: false, message: 'Admins cannot delete their own active account.' });
      return;
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: 'USER_DELETE',
      target: `User:${targetUser.id} (${targetUser.email})`,
    });

    res.json({
      success: true,
      message: 'User account deactivated (soft-deleted).',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to delete user.' });
  }
});

// -------------------------------------------------------------
// 3. INSTRUCTOR MANAGEMENT
// GET /api/admin/instructors
// -------------------------------------------------------------
router.get('/instructors', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const instructors = await prisma.user.findMany({
      where: {
        role: Role.INSTRUCTOR,
        deletedAt: null,
      },
      include: {
        profile: true,
        authoredCourses: {
          select: {
            id: true,
            title: true,
            isPublished: true,
            isApproved: true,
            price: true,
            enrollments: { select: { id: true } },
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = instructors.map((inst) => {
      let totalStudents = 0;
      let totalRevenue = 0;
      let allRatings: number[] = [];

      inst.authoredCourses.forEach((c) => {
        const studentCount = c.enrollments.length;
        totalStudents += studentCount;
        totalRevenue += studentCount * c.price;
        c.reviews.forEach((r) => allRatings.push(r.rating));
      });

      const avgRating = allRatings.length > 0
        ? Number((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1))
        : 0;

      return {
        id: inst.id,
        email: inst.email,
        name: inst.profile?.name || inst.email.split('@')[0],
        headline: inst.profile?.headline,
        avatarUrl: inst.profile?.avatarUrl,
        isInstructorApproved: inst.isInstructorApproved,
        isSuspended: inst.isSuspended,
        suspensionReason: inst.suspensionReason,
        courseCount: inst.authoredCourses.length,
        totalStudents,
        totalRevenue,
        avgRating,
        createdAt: inst.createdAt,
      };
    });

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Fetch instructors list error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch instructors.' });
  }
});

// PATCH /api/admin/instructors/:id/approve
router.patch('/instructors/:id/approve', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isInstructorApproved } = req.body;

    const instructor = await prisma.user.findUnique({ where: { id } });
    if (!instructor) {
      res.status(404).json({ success: false, message: 'Instructor not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isInstructorApproved: Boolean(isInstructorApproved) },
    });

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: isInstructorApproved ? 'INSTRUCTOR_APPROVED' : 'INSTRUCTOR_DISAPPROVED',
      target: `Instructor:${instructor.id} (${instructor.email})`,
      metadata: { isInstructorApproved },
    });

    res.json({
      success: true,
      message: isInstructorApproved ? 'Instructor status approved.' : 'Instructor status unapproved.',
      data: {
        id: updated.id,
        isInstructorApproved: updated.isInstructorApproved,
      },
    });
  } catch (error: any) {
    console.error('Approve instructor error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to update instructor approval.' });
  }
});

// -------------------------------------------------------------
// 3B. INSTRUCTOR APPLICATIONS REVIEW & ONBOARDING
// GET /api/admin/instructor-applications
// -------------------------------------------------------------
router.get('/instructor-applications', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;

    const whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status as ApplicationStatus;
    }

    if (search) {
      const q = String(search).toLowerCase();
      whereClause.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { expertise: { contains: q } },
      ];
    }

    const applications = await prisma.instructorApplication.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isInstructorApproved: true,
            isSuspended: true,
            createdAt: true,
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: applications,
    });
  } catch (error: any) {
    console.error('Fetch instructor applications error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to fetch instructor applications.',
    });
  }
});

// GET /api/admin/instructor-applications/:id
router.get('/instructor-applications/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const application = await prisma.instructorApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isInstructorApproved: true,
            isSuspended: true,
            createdAt: true,
            profile: true,
          },
        },
      },
    });

    if (!application) {
      res.status(404).json({
        success: false,
        error: 'APPLICATION_NOT_FOUND',
        message: 'Instructor application not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error: any) {
    console.error('Fetch instructor application details error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to fetch instructor application details.',
    });
  }
});

// PATCH /api/admin/instructor-applications/:id/review (Approve or Reject Application)
router.patch('/instructor-applications/:id/review', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      res.status(400).json({
        success: false,
        error: 'INVALID_ACTION',
        message: "Action must be either 'APPROVE' or 'REJECT'.",
      });
      return;
    }

    const application = await prisma.instructorApplication.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!application) {
      res.status(404).json({
        success: false,
        error: 'APPLICATION_NOT_FOUND',
        message: 'Instructor application not found.',
      });
      return;
    }

    const reviewerEmail = req.user!.email;

    if (action === 'APPROVE') {
      // 1. Update application status
      const updatedApp = await prisma.instructorApplication.update({
        where: { id },
        data: {
          status: ApplicationStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedBy: reviewerEmail,
          rejectionReason: null,
        },
      });

      // 2. Upgrade User account to INSTRUCTOR with approval
      const updatedUser = await prisma.user.update({
        where: { id: application.userId },
        data: {
          role: Role.INSTRUCTOR,
          isInstructorApproved: true,
        },
        include: { profile: true },
      });

      // 3. Record Audit Log
      await recordAuditLog({
        actorId: req.user!.userId,
        actorEmail: reviewerEmail,
        action: 'INSTRUCTOR_APPLICATION_APPROVED',
        target: `User:${application.userId} (${application.email})`,
        metadata: {
          applicationId: application.id,
          previousRole: application.user.role,
          newRole: Role.INSTRUCTOR,
        },
      });

      res.json({
        success: true,
        message: `Instructor application approved. User ${application.email} upgraded to INSTRUCTOR.`,
        data: {
          application: updatedApp,
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
            isInstructorApproved: updatedUser.isInstructorApproved,
          },
        },
      });
    } else {
      // REJECT
      const reason = rejectionReason || 'Application does not meet current platform requirements.';
      const updatedApp = await prisma.instructorApplication.update({
        where: { id },
        data: {
          status: ApplicationStatus.REJECTED,
          rejectionReason: reason,
          reviewedAt: new Date(),
          reviewedBy: reviewerEmail,
        },
      });

      // User role remains STUDENT
      await recordAuditLog({
        actorId: req.user!.userId,
        actorEmail: reviewerEmail,
        action: 'INSTRUCTOR_APPLICATION_REJECTED',
        target: `User:${application.userId} (${application.email})`,
        metadata: {
          applicationId: application.id,
          reason,
        },
      });

      res.json({
        success: true,
        message: `Instructor application for ${application.email} has been rejected.`,
        data: {
          application: updatedApp,
        },
      });
    }
  } catch (error: any) {
    console.error('Review instructor application error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to process application review.',
    });
  }
});

// -------------------------------------------------------------
// 4. COURSE MANAGEMENT
// GET /api/admin/courses
// -------------------------------------------------------------
router.get('/courses', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, categoryId, isPublished, isApproved, isFeatured, isArchived } = req.query;

    const whereClause: any = {};

    if (search) {
      const q = String(search).toLowerCase();
      whereClause.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (categoryId) whereClause.categoryId = String(categoryId);
    if (isPublished !== undefined) whereClause.isPublished = isPublished === 'true';
    if (isApproved !== undefined) whereClause.isApproved = isApproved === 'true';
    if (isFeatured !== undefined) whereClause.isFeatured = isFeatured === 'true';
    if (isArchived !== undefined) whereClause.isArchived = isArchived === 'true';

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        category: true,
        instructor: { include: { profile: true } },
        _count: { select: { enrollments: true, reviews: true, sections: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: courses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        shortDescription: c.shortDescription,
        thumbnailUrl: c.thumbnailUrl,
        price: c.price,
        level: c.level,
        isPublished: c.isPublished,
        isApproved: c.isApproved,
        isFeatured: c.isFeatured,
        isArchived: c.isArchived,
        categoryId: c.categoryId,
        categoryName: c.category.name,
        instructorId: c.instructorId,
        instructorName: c.instructor.profile?.name || c.instructor.email.split('@')[0],
        instructorEmail: c.instructor.email,
        studentCount: c._count.enrollments,
        reviewCount: c._count.reviews,
        sectionCount: c._count.sections,
        createdAt: c.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Fetch admin courses error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch course inventory.' });
  }
});

// PATCH /api/admin/courses/:id/publish
router.patch('/courses/:id/publish', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const updated = await prisma.course.update({
      where: { id },
      data: { isPublished: Boolean(isPublished) },
    });

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: isPublished ? 'COURSE_PUBLISH' : 'COURSE_UNPUBLISH',
      target: `Course:${course.id} (${course.title})`,
      metadata: { isPublished },
    });

    res.json({
      success: true,
      message: isPublished ? 'Course published.' : 'Course unpublished.',
      data: updated,
    });
  } catch (error: any) {
    console.error('Update course publish error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to update course status.' });
  }
});

// PATCH /api/admin/courses/:id/approve
router.patch('/courses/:id/approve', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const updated = await prisma.course.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) },
    });

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: isApproved ? 'COURSE_APPROVE' : 'COURSE_REJECT',
      target: `Course:${course.id} (${course.title})`,
      metadata: { isApproved },
    });

    res.json({
      success: true,
      message: isApproved ? 'Course approved.' : 'Course unapproved.',
      data: updated,
    });
  } catch (error: any) {
    console.error('Approve course error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to update course approval.' });
  }
});

// PATCH /api/admin/courses/:id/feature
router.patch('/courses/:id/feature', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const updated = await prisma.course.update({
      where: { id },
      data: { isFeatured: Boolean(isFeatured) },
    });

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: isFeatured ? 'COURSE_FEATURE' : 'COURSE_UNFEATURE',
      target: `Course:${course.id} (${course.title})`,
      metadata: { isFeatured },
    });

    res.json({
      success: true,
      message: isFeatured ? 'Course highlighted as featured.' : 'Course removed from featured.',
      data: updated,
    });
  } catch (error: any) {
    console.error('Feature course error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to update featured course flag.' });
  }
});

// PATCH /api/admin/courses/:id/archive
router.patch('/courses/:id/archive', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        isArchived: Boolean(isArchived),
        isPublished: isArchived ? false : course.isPublished,
      },
    });

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: isArchived ? 'COURSE_ARCHIVE' : 'COURSE_UNARCHIVE',
      target: `Course:${course.id} (${course.title})`,
      metadata: { isArchived },
    });

    res.json({
      success: true,
      message: isArchived ? 'Course archived.' : 'Course unarchived.',
      data: updated,
    });
  } catch (error: any) {
    console.error('Archive course error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to archive course.' });
  }
});

// DELETE /api/admin/courses/:id
router.delete('/courses/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    await prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: 'COURSE_DELETE',
      target: `Course:${course.id} (${course.title})`,
    });

    res.json({
      success: true,
      message: 'Course soft-deleted.',
    });
  } catch (error: any) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to delete course.' });
  }
});

// -------------------------------------------------------------
// 5. CATEGORY MANAGEMENT
// GET /api/admin/categories
// -------------------------------------------------------------
router.get('/categories', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { courses: true } },
      },
      orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
    });

    res.json({
      success: true,
      data: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        iconName: c.iconName,
        isActive: c.isActive,
        orderIndex: c.orderIndex,
        courseCount: c._count.courses,
        createdAt: c.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch categories.' });
  }
});

// POST /api/admin/categories
router.post('/categories', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, description, iconName, isActive, orderIndex } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Category name is required.' });
      return;
    }

    const computedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await prisma.category.findUnique({ where: { slug: computedSlug } });
    if (existing) {
      res.status(400).json({ success: false, message: 'A category with this slug already exists.' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: computedSlug,
        description: description || null,
        iconName: iconName || 'BookOpen',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        orderIndex: Number(orderIndex) || 0,
      },
    });

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: 'CATEGORY_CREATE',
      target: `Category:${category.id} (${category.name})`,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to create category.' });
  }
});

// PUT /api/admin/categories/:id
router.put('/categories/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, description, iconName, isActive, orderIndex } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    const updatedSlug = slug
      ? slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : existing.slug;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name ? name.trim() : existing.name,
        slug: updatedSlug,
        description: description !== undefined ? description : existing.description,
        iconName: iconName !== undefined ? iconName : existing.iconName,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : existing.orderIndex,
      },
    });

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: 'CATEGORY_UPDATE',
      target: `Category:${updated.id} (${updated.name})`,
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to update category.' });
  }
});

// DELETE /api/admin/categories/:id (With integrity relationship check)
router.delete('/categories/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { courses: true } },
      },
    });

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    // Integrity constraint check: do not allow deletion if courses exist
    if (category._count.courses > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" because it currently has ${category._count.courses} active course(s). Reassign or remove courses first to protect data integrity.`,
      });
      return;
    }

    await prisma.category.delete({ where: { id } });

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: 'CATEGORY_DELETE',
      target: `Category:${category.id} (${category.name})`,
    });

    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to delete category.' });
  }
});

// PUT /api/admin/categories/reorder
router.put('/categories/reorder', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { categoryOrders } = req.body; // Array of { id, orderIndex }

    if (!Array.isArray(categoryOrders)) {
      res.status(400).json({ success: false, message: 'Invalid categoryOrders array.' });
      return;
    }

    for (const item of categoryOrders) {
      await prisma.category.update({
        where: { id: item.id },
        data: { orderIndex: Number(item.orderIndex) || 0 },
      });
    }

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: 'CATEGORY_REORDER',
      target: 'Categories List',
      metadata: { count: categoryOrders.length },
    });

    res.json({ success: true, message: 'Category order updated successfully.' });
  } catch (error: any) {
    console.error('Reorder categories error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to reorder categories.' });
  }
});

// -------------------------------------------------------------
// 6. ENROLLMENT MANAGEMENT
// GET /api/admin/enrollments
// -------------------------------------------------------------
router.get('/enrollments', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: { include: { profile: true } },
        course: {
          include: {
            instructor: { include: { profile: true } },
            category: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const data = enrollments.map((e) => ({
      id: e.id,
      studentId: e.userId,
      studentName: e.user.profile?.name || e.user.email.split('@')[0],
      studentEmail: e.user.email,
      courseId: e.courseId,
      courseTitle: e.course.title,
      coursePrice: e.course.price,
      instructorName: e.course.instructor.profile?.name || e.course.instructor.email.split('@')[0],
      progress: e.progress,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
    }));

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Fetch admin enrollments error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch platform enrollments.' });
  }
});

// -------------------------------------------------------------
// 7. REVIEWS MODERATION
// GET /api/admin/reviews
// -------------------------------------------------------------
router.get('/reviews', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { filter } = req.query; // 'all', 'reported', 'moderated'

    const whereClause: any = {};
    if (filter === 'reported') whereClause.isReported = true;
    if (filter === 'moderated') whereClause.isModerated = true;

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        user: { include: { profile: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: reviews.map((r) => ({
        id: r.id,
        courseId: r.courseId,
        courseTitle: r.course.title,
        studentId: r.userId,
        studentName: r.user.profile?.name || r.user.email.split('@')[0],
        studentEmail: r.user.email,
        rating: r.rating,
        comment: r.comment,
        isReported: r.isReported,
        reportReason: r.reportReason,
        isModerated: r.isModerated,
        createdAt: r.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Fetch admin reviews error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch reviews.' });
  }
});

// PATCH /api/admin/reviews/:id/flag
router.patch('/reviews/:id/flag', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isReported, isModerated, reportReason } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        isReported: isReported !== undefined ? Boolean(isReported) : review.isReported,
        isModerated: isModerated !== undefined ? Boolean(isModerated) : review.isModerated,
        reportReason: reportReason !== undefined ? reportReason : review.reportReason,
      },
    });

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: 'REVIEW_MODERATE',
      target: `Review:${review.id}`,
      metadata: { isReported, isModerated, reportReason },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Flag review error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to update review status.' });
  }
});

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    await prisma.review.delete({ where: { id } });

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: 'REVIEW_DELETE',
      target: `Review:${review.id}`,
      metadata: { commentSnippet: review.comment.substring(0, 40) },
    });

    res.json({ success: true, message: 'Review deleted.' });
  } catch (error: any) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to delete review.' });
  }
});

// -------------------------------------------------------------
// 8. AUDIT LOGS
// GET /api/admin/audit-logs
// -------------------------------------------------------------
router.get('/audit-logs', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { action, search } = req.query;

    const whereClause: any = {};
    if (action) whereClause.action = String(action);
    if (search) {
      const q = String(search).toLowerCase();
      whereClause.OR = [
        { actorEmail: { contains: q } },
        { target: { contains: q } },
        { action: { contains: q } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: logs });
  } catch (error: any) {
    console.error('Fetch audit logs error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch audit logs.' });
  }
});

// -------------------------------------------------------------
// 9. SYSTEM SETTINGS
// GET /api/admin/settings
// -------------------------------------------------------------
router.get('/settings', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let settings = await prisma.platformSetting.findUnique({ where: { id: 'default' } });

    if (!settings) {
      settings = await prisma.platformSetting.create({
        data: {
          id: 'default',
          siteName: 'EduNexus',
          supportEmail: 'admin@ednexus.edu',
          requireInstructorApproval: false,
          enableRegistrations: true,
          maintenanceMode: false,
          allowCourseSelfPublish: true,
        },
      });
    }

    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch system settings.' });
  }
});

// PUT /api/admin/settings
router.put('/settings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      siteName,
      supportEmail,
      requireInstructorApproval,
      enableRegistrations,
      maintenanceMode,
      allowCourseSelfPublish,
    } = req.body;

    const settings = await prisma.platformSetting.upsert({
      where: { id: 'default' },
      update: {
        siteName: siteName || 'EduNexus',
        supportEmail: supportEmail || 'admin@ednexus.edu',
        requireInstructorApproval: Boolean(requireInstructorApproval),
        enableRegistrations: Boolean(enableRegistrations),
        maintenanceMode: Boolean(maintenanceMode),
        allowCourseSelfPublish: Boolean(allowCourseSelfPublish),
      },
      create: {
        id: 'default',
        siteName: siteName || 'EduNexus',
        supportEmail: supportEmail || 'admin@ednexus.edu',
        requireInstructorApproval: Boolean(requireInstructorApproval),
        enableRegistrations: Boolean(enableRegistrations),
        maintenanceMode: Boolean(maintenanceMode),
        allowCourseSelfPublish: Boolean(allowCourseSelfPublish),
      },
    });

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: 'SETTINGS_UPDATE',
      target: 'PlatformSettings',
      metadata: req.body,
    });

    res.json({ success: true, data: settings, message: 'Platform settings saved successfully.' });
  } catch (error: any) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to save settings.' });
  }
});

// -------------------------------------------------------------
// 10. BROADCAST NOTIFICATIONS & ANNOUNCEMENTS
// POST /api/admin/notifications/broadcast
// -------------------------------------------------------------
router.post('/notifications/broadcast', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, message, linkUrl, targetRole } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, message: 'Notification title and message are required.' });
      return;
    }

    const whereClause: any = { deletedAt: null };
    if (targetRole && targetRole !== 'ALL' && Object.values(Role).includes(targetRole as Role)) {
      whereClause.role = targetRole as Role;
    }

    const recipientUsers = await prisma.user.findMany({
      where: whereClause,
      select: { id: true },
    });

    const notificationsData = recipientUsers.map((u) => ({
      userId: u.id,
      title: String(title).trim(),
      message: String(message).trim(),
      linkUrl: linkUrl ? String(linkUrl).trim() : null,
    }));

    if (notificationsData.length > 0) {
      await prisma.notification.createMany({
        data: notificationsData,
      });
    }

    await recordAuditLog({
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      action: 'BROADCAST_NOTIFICATION',
      target: `TargetRole:${targetRole || 'ALL'} (${recipientUsers.length} users)`,
      metadata: { title, message },
    });

    res.json({
      success: true,
      message: `Announcement broadcast successfully to ${recipientUsers.length} user(s).`,
      recipientCount: recipientUsers.length,
    });
  } catch (error: any) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to broadcast announcement.' });
  }
});

// -------------------------------------------------------------
// 11. REPORTS & PLATFORM ANALYTICS
// GET /api/admin/reports
// -------------------------------------------------------------
router.get('/reports', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Monthly enrollment velocity
    const enrollments = await prisma.enrollment.findMany({
      select: { enrolledAt: true, course: { select: { price: true, category: { select: { name: true } } } } },
      orderBy: { enrolledAt: 'asc' },
    });

    const monthlyMap: Record<string, { enrollments: number; revenue: number }> = {};
    const categoryMap: Record<string, number> = {};

    enrollments.forEach((e) => {
      const monthKey = new Date(e.enrolledAt).toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { enrollments: 0, revenue: 0 };
      }
      monthlyMap[monthKey].enrollments += 1;
      monthlyMap[monthKey].revenue += e.course?.price || 0;

      const catName = e.course?.category?.name || 'Uncategorized';
      categoryMap[catName] = (categoryMap[catName] || 0) + 1;
    });

    const monthlyTrends = Object.entries(monthlyMap).map(([month, stats]) => ({
      month,
      enrollments: stats.enrollments,
      revenue: stats.revenue,
    }));

    const categoryBreakdown = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count,
    }));

    const topCourses = await prisma.course.findMany({
      take: 5,
      include: {
        instructor: { include: { profile: true } },
        _count: { select: { enrollments: true, reviews: true } },
      },
      orderBy: { enrollments: { _count: 'desc' } },
    });

    res.json({
      success: true,
      data: {
        monthlyTrends,
        categoryBreakdown,
        topCourses: topCourses.map((c) => ({
          id: c.id,
          title: c.title,
          instructorName: c.instructor.profile?.name || c.instructor.email.split('@')[0],
          enrollmentCount: c._count.enrollments,
          grossRevenue: c._count.enrollments * c.price,
        })),
      },
    });
  } catch (error: any) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to generate platform reports.' });
  }
});

export default router;
