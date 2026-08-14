import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';
import { authenticate, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { CourseLevel, Role } from '@prisma/client';

const router = Router();

// ==========================================
// PUBLIC INSTRUCTOR ROUTES
// ==========================================

// GET /api/instructors (Public list)
router.get('/', async (_req, res: Response): Promise<void> => {
  try {
    const instructors = await prisma.user.findMany({
      where: {
        role: Role.INSTRUCTOR,
        deletedAt: null,
      },
      include: {
        profile: true,
        authoredCourses: {
          where: { isPublished: true, deletedAt: null },
          include: {
            _count: {
              select: { enrollments: true },
            },
          },
        },
      },
    });

    const result = instructors.map((inst) => {
      const totalStudents = inst.authoredCourses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0);
      return {
        id: inst.id,
        name: inst.profile?.name || inst.email.split('@')[0],
        headline: inst.profile?.headline || 'Senior Instructor',
        bio: inst.profile?.bio || 'Experienced software educator helping students build real-world skills.',
        avatarUrl: inst.profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        courseCount: inst.authoredCourses.length,
        studentCount: totalStudents || 120,
        rating: 4.9,
      };
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Fetch instructors error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch instructors.' });
  }
});

// GET /api/instructors/:id (Public detail)
router.get('/:id', async (req, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Handle special route collision if /me is requested publicly without auth
    if (id === 'me') {
      res.status(401).json({ success: false, message: 'Authentication token required for instructor portal.' });
      return;
    }

    const instructor = await prisma.user.findFirst({
      where: {
        id,
        role: Role.INSTRUCTOR,
        deletedAt: null,
      },
      include: {
        profile: true,
        authoredCourses: {
          where: { isPublished: true, deletedAt: null },
          include: {
            category: true,
            _count: {
              select: { enrollments: true, reviews: true },
            },
          },
        },
      },
    });

    if (!instructor) {
      res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Instructor not found.' });
      return;
    }

    const totalStudents = instructor.authoredCourses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0);

    res.json({
      success: true,
      data: {
        id: instructor.id,
        name: instructor.profile?.name || instructor.email.split('@')[0],
        email: instructor.email,
        headline: instructor.profile?.headline || 'Senior Software Engineer & Tech Educator',
        bio: instructor.profile?.bio || 'Passionately helping thousands of developers upgrade their software engineering skills.',
        avatarUrl: instructor.profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        courseCount: instructor.authoredCourses.length,
        studentCount: totalStudents || 120,
        rating: 4.9,
        reviewCount: 320,
        courses: instructor.authoredCourses.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          shortDescription: c.shortDescription,
          thumbnailUrl: c.thumbnailUrl,
          price: c.price,
          level: c.level,
          categoryName: c.category?.name,
          studentCount: c._count.enrollments,
          rating: 4.8,
        })),
      },
    });
  } catch (error: any) {
    console.error('Fetch instructor detail error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch instructor details.' });
  }
});

// ==========================================
// PRIVATE INSTRUCTOR MANAGEMENT ROUTES
// ==========================================

// Helper function to verify course ownership
async function verifyCourseOwnership(courseId: string, userId: string, role: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, deletedAt: null },
    include: {
      sections: {
        orderBy: { orderIndex: 'asc' },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
      category: true,
      _count: { select: { enrollments: true, reviews: true } },
    },
  });

  if (!course) {
    return { errorStatus: 404, message: 'Course not found.' };
  }

  // Strict ownership check
  if (course.instructorId !== userId && role !== 'ADMIN') {
    return { errorStatus: 403, message: 'Unauthorized: You do not have ownership permission for this course.' };
  }

  return { course };
}

// GET /api/instructors/me/dashboard
router.get(
  '/me/dashboard',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const instructorId = req.user!.userId;

      const courses = await prisma.course.findMany({
        where: { instructorId, deletedAt: null },
        include: {
          enrollments: {
            include: {
              user: { include: { profile: true } },
            },
          },
          reviews: true,
          _count: { select: { enrollments: true, reviews: true } },
        },
      });

      const totalCourses = courses.length;
      const publishedCourses = courses.filter((c) => c.isPublished).length;
      const draftCourses = courses.filter((c) => !c.isPublished).length;

      // Unique students & revenue calculation
      const studentSet = new Set<string>();
      let totalRevenue = 0;
      let totalRatingSum = 0;
      let totalRatingCount = 0;

      const recentEnrollments: any[] = [];

      courses.forEach((c) => {
        c.enrollments.forEach((e) => {
          studentSet.add(e.userId);
          totalRevenue += c.price;

          recentEnrollments.push({
            id: e.id,
            studentName: e.user?.profile?.name || e.user?.email.split('@')[0] || 'Student',
            studentEmail: e.user?.email,
            studentAvatar: e.user?.profile?.avatarUrl,
            courseTitle: c.title,
            coursePrice: c.price,
            enrolledAt: e.enrolledAt,
          });
        });

        c.reviews.forEach((r) => {
          totalRatingSum += r.rating;
          totalRatingCount += 1;
        });
      });

      recentEnrollments.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());

      const averageRating = totalRatingCount > 0 ? Number((totalRatingSum / totalRatingCount).toFixed(1)) : 4.9;

      const coursePerformance = courses.map((c) => {
        const studentCount = c._count.enrollments;
        const revenue = studentCount * c.price;
        const ratings = c.reviews.map((r) => r.rating);
        const avg = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '4.8';

        return {
          id: c.id,
          title: c.title,
          price: c.price,
          isPublished: c.isPublished,
          studentCount,
          revenue,
          rating: Number(avg),
          reviewCount: c._count.reviews,
        };
      });

      res.json({
        success: true,
        data: {
          totalCourses,
          publishedCourses,
          draftCourses,
          totalStudents: studentSet.size,
          totalRevenue,
          averageRating,
          recentEnrollments: recentEnrollments.slice(0, 5),
          coursePerformance,
        },
      });
    } catch (error: any) {
      console.error('Fetch instructor dashboard error:', error);
      res.status(500).json({ success: false, message: 'Failed to load instructor dashboard.' });
    }
  }
);

// GET /api/instructors/me/courses
router.get(
  '/me/courses',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const instructorId = req.user!.userId;

      const courses = await prisma.course.findMany({
        where: { instructorId, deletedAt: null },
        include: {
          category: true,
          sections: {
            include: {
              lessons: true,
            },
          },
          _count: { select: { enrollments: true, reviews: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });

      const formatted = courses.map((c) => {
        const lessonCount = c.sections.reduce((sum, s) => sum + s.lessons.length, 0);
        return {
          id: c.id,
          title: c.title,
          slug: c.slug,
          shortDescription: c.shortDescription,
          thumbnailUrl: c.thumbnailUrl,
          price: c.price,
          level: c.level,
          isPublished: c.isPublished,
          categoryId: c.categoryId,
          categoryName: c.category?.name,
          sectionCount: c.sections.length,
          lessonCount,
          studentCount: c._count.enrollments,
          rating: 4.8,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        };
      });

      res.json({ success: true, data: formatted });
    } catch (error: any) {
      console.error('Fetch instructor courses error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch instructor courses.' });
    }
  }
);

// GET /api/instructors/me/courses/:id
router.get(
  '/me/courses/:id',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const ownership = await verifyCourseOwnership(id, req.user!.userId, req.user!.role);

      if (ownership.errorStatus) {
        res.status(ownership.errorStatus).json({ success: false, message: ownership.message });
        return;
      }

      const course = ownership.course!;

      // Validate publish criteria
      const validationErrors: string[] = [];
      if (!course.title || course.title.trim() === '') validationErrors.push('Course title is required.');
      if (!course.shortDescription || course.shortDescription.trim() === '') validationErrors.push('Short description is required.');
      if (!course.description || course.description.trim() === '') validationErrors.push('Detailed description is required.');
      if (!course.thumbnailUrl || course.thumbnailUrl.trim() === '') validationErrors.push('Thumbnail image URL is required.');
      if (!course.categoryId) validationErrors.push('Category selection is required.');
      if (!course.instructorId) validationErrors.push('Instructor association is required.');
      if (!course.sections || course.sections.length === 0) {
        validationErrors.push('Course must have at least one section.');
      } else {
        const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
        if (totalLessons === 0) {
          validationErrors.push('Course must contain at least one lesson.');
        }

        // Validate content in lessons
        let emptyContentLessonFound = false;
        course.sections.forEach((s) => {
          s.lessons.forEach((l) => {
            if (!l.videoUrl && !l.content && !l.downloadableUrl && !l.externalUrl) {
              emptyContentLessonFound = true;
            }
          });
        });
        if (emptyContentLessonFound) {
          validationErrors.push('All lessons must contain video or textual/resource content.');
        }
      }
      if (course.price === undefined || course.price < 0) validationErrors.push('Price must be valid non-negative number.');

      res.json({
        success: true,
        data: {
          ...course,
          canPublish: validationErrors.length === 0,
          validationErrors,
        },
      });
    } catch (error: any) {
      console.error('Fetch instructor course detail error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch course details.' });
    }
  }
);

// POST /api/instructors/me/courses (Create Course Draft)
router.post(
  '/me/courses',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { title, shortDescription, description, price, level, categoryId, thumbnailUrl } = req.body;

      if (!title || !shortDescription || !categoryId) {
        res.status(400).json({ success: false, message: 'Title, short description, and category are required.' });
        return;
      }

      const slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

      const course = await prisma.course.create({
        data: {
          title: title.trim(),
          slug,
          shortDescription: shortDescription.trim(),
          description: (description || shortDescription).trim(),
          price: Number(price) >= 0 ? Number(price) : 0,
          level: (level as CourseLevel) || CourseLevel.BEGINNER,
          thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
          isPublished: false, // Default to draft
          instructorId: req.user!.userId,
          categoryId,
          sections: {
            create: [
              {
                title: 'Section 1: Course Overview',
                orderIndex: 0,
                lessons: {
                  create: [
                    {
                      title: '1. Welcome & Course Introduction',
                      durationMinutes: 10,
                      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                      content: 'Welcome to the course! In this introductory lesson, we outline our learning goals.',
                      isFreePreview: true,
                      orderIndex: 0,
                    },
                  ],
                },
              },
            ],
          },
        },
        include: {
          sections: { include: { lessons: true } },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Course draft created successfully.',
        data: course,
      });
    } catch (error: any) {
      console.error('Create instructor course error:', error);
      res.status(500).json({ success: false, message: 'Failed to create course.' });
    }
  }
);

// PUT /api/instructors/me/courses/:id (Edit Course Details)
router.put(
  '/me/courses/:id',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const ownership = await verifyCourseOwnership(id, req.user!.userId, req.user!.role);

      if (ownership.errorStatus) {
        res.status(ownership.errorStatus).json({ success: false, message: ownership.message });
        return;
      }

      const { title, shortDescription, description, price, level, categoryId, thumbnailUrl } = req.body;

      const updated = await prisma.course.update({
        where: { id },
        data: {
          ...(title && { title: title.trim() }),
          ...(shortDescription && { shortDescription: shortDescription.trim() }),
          ...(description && { description: description.trim() }),
          ...(price !== undefined && { price: Number(price) }),
          ...(level && { level: level as CourseLevel }),
          ...(categoryId && { categoryId }),
          ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        },
      });

      res.json({ success: true, message: 'Course details updated successfully.', data: updated });
    } catch (error: any) {
      console.error('Update course error:', error);
      res.status(500).json({ success: false, message: 'Failed to update course.' });
    }
  }
);

// PUT /api/instructors/me/courses/:id/publish (Publish or Unpublish Course)
router.put(
  '/me/courses/:id/publish',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { isPublished } = req.body;

      const ownership = await verifyCourseOwnership(id, req.user!.userId, req.user!.role);
      if (ownership.errorStatus) {
        res.status(ownership.errorStatus).json({ success: false, message: ownership.message });
        return;
      }

      const course = ownership.course!;

      // If user is trying to publish, strictly validate rules
      if (isPublished) {
        const errors: string[] = [];

        if (!course.title || course.title.trim() === '') errors.push('Title cannot be empty.');
        if (!course.shortDescription || course.shortDescription.trim() === '') errors.push('Short description cannot be empty.');
        if (!course.description || course.description.trim() === '') errors.push('Description cannot be empty.');
        if (!course.thumbnailUrl || course.thumbnailUrl.trim() === '') errors.push('Thumbnail image URL is required.');
        if (!course.categoryId) errors.push('Category selection is required.');
        if (!course.instructorId) errors.push('Instructor association is missing.');
        if (!course.sections || course.sections.length === 0) {
          errors.push('Course must have at least one section.');
        } else {
          const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
          if (totalLessons === 0) {
            errors.push('Course must contain at least one lesson.');
          }

          let missingContent = false;
          course.sections.forEach((s) => {
            s.lessons.forEach((l) => {
              if (!l.videoUrl && !l.content && !l.downloadableUrl && !l.externalUrl) {
                missingContent = true;
              }
            });
          });
          if (missingContent) {
            errors.push('All lessons must contain video or textual/resource content.');
          }
        }
        if (course.price === undefined || course.price < 0) errors.push('Price must be non-negative.');

        if (errors.length > 0) {
          res.status(400).json({
            success: false,
            message: 'Course cannot be published until all validation requirements are met.',
            errors,
          });
          return;
        }
      }

      const updated = await prisma.course.update({
        where: { id },
        data: { isPublished: Boolean(isPublished) },
      });

      res.json({
        success: true,
        message: isPublished ? 'Course published successfully!' : 'Course set to draft mode.',
        data: updated,
      });
    } catch (error: any) {
      console.error('Publish course error:', error);
      res.status(500).json({ success: false, message: 'Failed to update publishing status.' });
    }
  }
);

// DELETE /api/instructors/me/courses/:id (Delete Course)
router.delete(
  '/me/courses/:id',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const ownership = await verifyCourseOwnership(id, req.user!.userId, req.user!.role);

      if (ownership.errorStatus) {
        res.status(ownership.errorStatus).json({ success: false, message: ownership.message });
        return;
      }

      await prisma.course.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      res.json({ success: true, message: 'Course deleted successfully.' });
    } catch (error: any) {
      console.error('Delete course error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete course.' });
    }
  }
);

// ==========================================
// SECTIONS MANAGEMENT
// ==========================================

// POST /api/instructors/me/courses/:id/sections (Add Section)
router.post(
  '/me/courses/:id/sections',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title } = req.body;

      const ownership = await verifyCourseOwnership(id, req.user!.userId, req.user!.role);
      if (ownership.errorStatus) {
        res.status(ownership.errorStatus).json({ success: false, message: ownership.message });
        return;
      }

      if (!title || title.trim() === '') {
        res.status(400).json({ success: false, message: 'Section title is required.' });
        return;
      }

      const orderIndex = ownership.course!.sections.length;

      const section = await prisma.courseSection.create({
        data: {
          courseId: id,
          title: title.trim(),
          orderIndex,
        },
        include: { lessons: true },
      });

      res.status(201).json({ success: true, message: 'Section created.', data: section });
    } catch (error: any) {
      console.error('Create section error:', error);
      res.status(500).json({ success: false, message: 'Failed to create section.' });
    }
  }
);

// PUT /api/instructors/me/courses/:id/sections/:sectionId (Edit Section)
router.put(
  '/me/courses/:id/sections/:sectionId',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id, sectionId } = req.params;
      const { title } = req.body;

      const ownership = await verifyCourseOwnership(id, req.user!.userId, req.user!.role);
      if (ownership.errorStatus) {
        res.status(ownership.errorStatus).json({ success: false, message: ownership.message });
        return;
      }

      const updated = await prisma.courseSection.update({
        where: { id: sectionId },
        data: { title: title.trim() },
      });

      res.json({ success: true, message: 'Section updated.', data: updated });
    } catch (error: any) {
      console.error('Update section error:', error);
      res.status(500).json({ success: false, message: 'Failed to update section.' });
    }
  }
);

// DELETE /api/instructors/me/courses/:id/sections/:sectionId (Delete Section)
router.delete(
  '/me/courses/:id/sections/:sectionId',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id, sectionId } = req.params;

      const ownership = await verifyCourseOwnership(id, req.user!.userId, req.user!.role);
      if (ownership.errorStatus) {
        res.status(ownership.errorStatus).json({ success: false, message: ownership.message });
        return;
      }

      await prisma.courseSection.delete({
        where: { id: sectionId },
      });

      res.json({ success: true, message: 'Section deleted.' });
    } catch (error: any) {
      console.error('Delete section error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete section.' });
    }
  }
);

// PUT /api/instructors/me/courses/:id/sections/reorder (Reorder Sections)
router.put(
  '/me/courses/:id/sections/reorder',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { sectionOrders } = req.body; // Array of { id: string, orderIndex: number }

      const ownership = await verifyCourseOwnership(id, req.user!.userId, req.user!.role);
      if (ownership.errorStatus) {
        res.status(ownership.errorStatus).json({ success: false, message: ownership.message });
        return;
      }

      if (Array.isArray(sectionOrders)) {
        await Promise.all(
          sectionOrders.map((item: { id: string; orderIndex: number }) =>
            prisma.courseSection.update({
              where: { id: item.id },
              data: { orderIndex: item.orderIndex },
            })
          )
        );
      }

      res.json({ success: true, message: 'Sections reordered successfully.' });
    } catch (error: any) {
      console.error('Reorder sections error:', error);
      res.status(500).json({ success: false, message: 'Failed to reorder sections.' });
    }
  }
);

// ==========================================
// LESSONS MANAGEMENT
// ==========================================

// POST /api/instructors/me/courses/:id/sections/:sectionId/lessons (Add Lesson)
router.post(
  '/me/courses/:id/sections/:sectionId/lessons',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id, sectionId } = req.params;
      const { title, durationMinutes, videoUrl, content, downloadableUrl, externalUrl, isFreePreview } = req.body;

      const ownership = await verifyCourseOwnership(id, req.user!.userId, req.user!.role);
      if (ownership.errorStatus) {
        res.status(ownership.errorStatus).json({ success: false, message: ownership.message });
        return;
      }

      if (!title || title.trim() === '') {
        res.status(400).json({ success: false, message: 'Lesson title is required.' });
        return;
      }

      const section = ownership.course!.sections.find((s) => s.id === sectionId);
      const orderIndex = section ? section.lessons.length : 0;

      const lesson = await prisma.lesson.create({
        data: {
          sectionId,
          title: title.trim(),
          durationMinutes: Number(durationMinutes) || 10,
          videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          content: content || null,
          downloadableUrl: downloadableUrl || null,
          externalUrl: externalUrl || null,
          isFreePreview: Boolean(isFreePreview),
          orderIndex,
        },
      });

      res.status(201).json({ success: true, message: 'Lesson created.', data: lesson });
    } catch (error: any) {
      console.error('Create lesson error:', error);
      res.status(500).json({ success: false, message: 'Failed to create lesson.' });
    }
  }
);

// PUT /api/instructors/me/courses/:id/lessons/:lessonId (Edit Lesson)
router.put(
  '/me/courses/:id/lessons/:lessonId',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id, lessonId } = req.params;
      const ownership = await verifyCourseOwnership(id, req.user!.userId, req.user!.role);

      if (ownership.errorStatus) {
        res.status(ownership.errorStatus).json({ success: false, message: ownership.message });
        return;
      }

      const { title, durationMinutes, videoUrl, content, downloadableUrl, externalUrl, isFreePreview } = req.body;

      const updated = await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          ...(title && { title: title.trim() }),
          ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
          ...(videoUrl !== undefined && { videoUrl }),
          ...(content !== undefined && { content }),
          ...(downloadableUrl !== undefined && { downloadableUrl }),
          ...(externalUrl !== undefined && { externalUrl }),
          ...(isFreePreview !== undefined && { isFreePreview: Boolean(isFreePreview) }),
        },
      });

      res.json({ success: true, message: 'Lesson updated.', data: updated });
    } catch (error: any) {
      console.error('Update lesson error:', error);
      res.status(500).json({ success: false, message: 'Failed to update lesson.' });
    }
  }
);

// DELETE /api/instructors/me/courses/:id/lessons/:lessonId (Delete Lesson)
router.delete(
  '/me/courses/:id/lessons/:lessonId',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id, lessonId } = req.params;
      const ownership = await verifyCourseOwnership(id, req.user!.userId, req.user!.role);

      if (ownership.errorStatus) {
        res.status(ownership.errorStatus).json({ success: false, message: ownership.message });
        return;
      }

      await prisma.lesson.delete({
        where: { id: lessonId },
      });

      res.json({ success: true, message: 'Lesson deleted.' });
    } catch (error: any) {
      console.error('Delete lesson error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete lesson.' });
    }
  }
);

// PUT /api/instructors/me/courses/:id/sections/:sectionId/lessons/reorder (Reorder Lessons)
router.put(
  '/me/courses/:id/sections/:sectionId/lessons/reorder',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { lessonOrders } = req.body; // Array of { id: string, orderIndex: number }

      const ownership = await verifyCourseOwnership(id, req.user!.userId, req.user!.role);
      if (ownership.errorStatus) {
        res.status(ownership.errorStatus).json({ success: false, message: ownership.message });
        return;
      }

      if (Array.isArray(lessonOrders)) {
        await Promise.all(
          lessonOrders.map((item: { id: string; orderIndex: number }) =>
            prisma.lesson.update({
              where: { id: item.id },
              data: { orderIndex: item.orderIndex },
            })
          )
        );
      }

      res.json({ success: true, message: 'Lessons reordered successfully.' });
    } catch (error: any) {
      console.error('Reorder lessons error:', error);
      res.status(500).json({ success: false, message: 'Failed to reorder lessons.' });
    }
  }
);

// ==========================================
// INSTRUCTOR STUDENTS & ANALYTICS & REVIEWS
// ==========================================

// GET /api/instructors/me/students
router.get(
  '/me/students',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const instructorId = req.user!.userId;

      const courses = await prisma.course.findMany({
        where: { instructorId, deletedAt: null },
        select: { id: true, title: true, price: true },
      });

      const courseIds = courses.map((c) => c.id);

      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: { in: courseIds } },
        include: {
          user: { include: { profile: true } },
          course: true,
        },
        orderBy: { enrolledAt: 'desc' },
      });

      const formatted = enrollments.map((e) => ({
        id: e.id,
        studentId: e.userId,
        studentName: e.user?.profile?.name || e.user?.email.split('@')[0] || 'Student',
        studentEmail: e.user?.email,
        studentAvatar: e.user?.profile?.avatarUrl,
        courseId: e.courseId,
        courseTitle: e.course.title,
        progress: e.progress || 0,
        enrolledAt: e.enrolledAt,
      }));

      res.json({ success: true, data: formatted });
    } catch (error: any) {
      console.error('Fetch instructor students error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch student directory.' });
    }
  }
);

// GET /api/instructors/me/analytics
router.get(
  '/me/analytics',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const instructorId = req.user!.userId;

      const courses = await prisma.course.findMany({
        where: { instructorId, deletedAt: null },
        include: {
          enrollments: true,
          reviews: true,
          sections: { include: { lessons: true } },
          _count: { select: { enrollments: true, reviews: true } },
        },
      });

      const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollments.length, 0);
      const activeStudents = new Set(courses.flatMap((c) => c.enrollments.map((e) => e.userId))).size;

      // Completion rate calculation
      const completedEnrollments = courses.flatMap((c) => c.enrollments.filter((e) => e.progress >= 100)).length;
      const avgCompletionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

      // Ratings sum
      const reviews = courses.flatMap((c) => c.reviews);
      const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '4.9';

      // Monthly Trend mockup / data calculation
      const monthlyData = [
        { month: 'Jan', enrollments: Math.round(totalEnrollments * 0.1) },
        { month: 'Feb', enrollments: Math.round(totalEnrollments * 0.15) },
        { month: 'Mar', enrollments: Math.round(totalEnrollments * 0.2) },
        { month: 'Apr', enrollments: Math.round(totalEnrollments * 0.25) },
        { month: 'May', enrollments: Math.round(totalEnrollments * 0.3) },
        { month: 'Jun', enrollments: totalEnrollments },
      ];

      // Engagement details
      const courseEngagement = courses.map((c) => {
        const totalLessons = c.sections.reduce((s, sec) => s + sec.lessons.length, 0);
        return {
          courseId: c.id,
          title: c.title,
          totalStudents: c.enrollments.length,
          completionRate: c.enrollments.length > 0
            ? Math.round((c.enrollments.filter((e) => e.progress >= 100).length / c.enrollments.length) * 100)
            : 0,
          totalLessons,
          avgRating: c.reviews.length > 0 ? (c.reviews.reduce((a, b) => a + b.rating, 0) / c.reviews.length).toFixed(1) : '4.8',
        };
      });

      res.json({
        success: true,
        data: {
          totalEnrollments,
          activeStudents,
          avgCompletionRate,
          avgRating: Number(avgRating),
          monthlyData,
          courseEngagement,
        },
      });
    } catch (error: any) {
      console.error('Fetch instructor analytics error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch instructor analytics.' });
    }
  }
);

// GET /api/instructors/me/reviews
router.get(
  '/me/reviews',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const instructorId = req.user!.userId;

      const courses = await prisma.course.findMany({
        where: { instructorId, deletedAt: null },
        select: { id: true, title: true },
      });

      const courseIds = courses.map((c) => c.id);

      const reviews = await prisma.review.findMany({
        where: { courseId: { in: courseIds } },
        include: {
          user: { include: { profile: true } },
          course: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = reviews.map((r) => ({
        id: r.id,
        courseTitle: r.course?.title,
        studentName: r.user?.profile?.name || r.user?.email.split('@')[0] || 'Student',
        studentAvatar: r.user?.profile?.avatarUrl,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      }));

      res.json({ success: true, data: formatted });
    } catch (error: any) {
      console.error('Fetch instructor reviews error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
    }
  }
);

// GET /api/instructors/me/profile
router.get(
  '/me/profile',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      res.json({
        success: true,
        data: {
          name: user?.profile?.name || user?.email.split('@')[0],
          email: user?.email,
          headline: user?.profile?.headline || '',
          bio: user?.profile?.bio || '',
          avatarUrl: user?.profile?.avatarUrl || '',
          website: user?.profile?.website || '',
          github: user?.profile?.github || '',
          linkedin: user?.profile?.linkedin || '',
        },
      });
    } catch (error: any) {
      console.error('Fetch instructor profile error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
    }
  }
);

// PUT /api/instructors/me/profile
router.put(
  '/me/profile',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { name, headline, bio, avatarUrl, website, github, linkedin } = req.body;

      await prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          name: name || 'Instructor',
          headline: headline || null,
          bio: bio || null,
          avatarUrl: avatarUrl || null,
          website: website || null,
          github: github || null,
          linkedin: linkedin || null,
        },
        update: {
          ...(name && { name }),
          headline: headline ?? null,
          bio: bio ?? null,
          avatarUrl: avatarUrl ?? null,
          website: website ?? null,
          github: github ?? null,
          linkedin: linkedin ?? null,
        },
      });

      res.json({ success: true, message: 'Profile updated successfully.' });
    } catch (error: any) {
      console.error('Update instructor profile error:', error);
      res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
  }
);

// POST /api/instructors/me/change-password
router.post(
  '/me/change-password',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword || newPassword.length < 8) {
        res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        return;
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
      });

      res.json({ success: true, message: 'Password updated successfully.' });
    } catch (error: any) {
      console.error('Change instructor password error:', error);
      res.status(500).json({ success: false, message: 'Failed to change password.' });
    }
  }
);

export default router;
