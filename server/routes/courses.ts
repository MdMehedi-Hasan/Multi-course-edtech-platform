import { Router, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { authenticate, requireRoles, AuthenticatedRequest, optionalAuthenticate } from '../middleware/auth.js';
import { CourseLevel, Role, EnrollmentStatus } from '@prisma/client';
import { verifyCourseLessonAccess } from '../lib/courseAccessGuard.js';
import { generateSignedVideoToken } from '../lib/signedUrl.js';
import { processCourseCompletion } from '../lib/completionService.js';

const router = Router();

// GET /api/courses/categories
router.get('/categories', async (_req, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { courses: true } },
      },
    });

    res.json({
      success: true,
      data: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        iconName: c.iconName,
        courseCount: c._count.courses,
      })),
    });
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch categories.' });
  }
});

// GET /api/courses - Public Course Catalog
router.get('/', async (req, res: Response): Promise<void> => {
  try {
    const { categoryId, level, search, instructorId } = req.query;

    const whereClause: any = {
      isPublished: true,
      deletedAt: null,
    };

    if (categoryId) whereClause.categoryId = String(categoryId);
    if (level) whereClause.level = level as CourseLevel;
    if (instructorId) whereClause.instructorId = String(instructorId);
    if (search) {
      const query = String(search).toLowerCase();
      whereClause.OR = [
        { title: { contains: query } },
        { shortDescription: { contains: query } },
      ];
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        instructor: { include: { profile: true } },
        category: true,
        _count: { select: { enrollments: true, reviews: true } },
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
        description: c.description,
        thumbnailUrl: c.thumbnailUrl,
        price: c.price,
        level: c.level,
        isPublished: c.isPublished,
        instructorId: c.instructorId,
        instructorName: c.instructor?.profile?.name || 'Instructor',
        instructorAvatar: c.instructor?.profile?.avatarUrl,
        categoryId: c.categoryId,
        categoryName: c.category?.name,
        studentCount: c._count.enrollments,
        rating: 4.8,
        reviewCount: c._count.reviews,
        createdAt: c.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Fetch courses error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch course catalog.' });
  }
});

// GET /api/courses/:courseId - Public metadata + curriculum outline (NO private video URLs)
router.get('/:courseId', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }],
        deletedAt: null,
      },
      include: {
        instructor: { include: { profile: true } },
        category: true,
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              where: { deletedAt: null },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        _count: { select: { enrollments: true, reviews: true } },
      },
    });

    if (!course) {
      res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Course not found.' });
      return;
    }

    let isEnrolled = false;
    let enrollmentStatus: string | null = null;

    if (req.user) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: req.user.userId,
            courseId: course.id,
          },
        },
      });
      if (enrollment) {
        isEnrolled = true;
        enrollmentStatus = enrollment.status;
      }
    }

    // Public course view: NEVER expose raw protected video URLs!
    const sanitizedSections = course.sections.map((s) => ({
      id: s.id,
      title: s.title,
      orderIndex: s.orderIndex,
      lessons: s.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        durationMinutes: l.durationMinutes,
        isFreePreview: l.isFreePreview,
        orderIndex: l.orderIndex,
        // Protected lessons explicitly hide video URLs
        videoUrl: l.isFreePreview ? l.videoUrl : null,
        externalUrl: l.externalUrl,
      })),
    }));

    res.json({
      success: true,
      data: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        shortDescription: course.shortDescription,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        price: course.price,
        level: course.level,
        isPublished: course.isPublished,
        instructorId: course.instructorId,
        instructorName: course.instructor?.profile?.name || 'Instructor',
        instructorHeadline: course.instructor?.profile?.headline,
        instructorAvatar: course.instructor?.profile?.avatarUrl,
        instructorBio: course.instructor?.profile?.bio,
        categoryId: course.categoryId,
        categoryName: course.category?.name,
        studentCount: course._count.enrollments,
        isEnrolled,
        enrollmentStatus,
        sections: sanitizedSections,
        createdAt: course.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Fetch course detail error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch course details.' });
  }
});

// GET /api/courses/:courseId/curriculum - Curriculum outline with user progress flags
router.get('/:courseId/curriculum', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }], deletedAt: null },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              where: { deletedAt: null },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!course) {
      res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Course not found.' });
      return;
    }

    let completedLessonSet = new Set<string>();
    if (req.user) {
      const allLessons = course.sections.flatMap((s) => s.lessons);
      const userProgresses = await prisma.lessonProgress.findMany({
        where: {
          userId: req.user.userId,
          lessonId: { in: allLessons.map((l) => l.id) },
        },
      });
      completedLessonSet = new Set(userProgresses.filter((p) => p.isCompleted).map((p) => p.lessonId));
    }

    const curriculum = course.sections.map((section) => ({
      id: section.id,
      title: section.title,
      orderIndex: section.orderIndex,
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        durationMinutes: lesson.durationMinutes,
        isFreePreview: lesson.isFreePreview,
        orderIndex: lesson.orderIndex,
        isCompleted: completedLessonSet.has(lesson.id),
        // Strip private video URL
        hasVideo: !!lesson.videoUrl,
      })),
    }));

    res.json({
      success: true,
      data: {
        courseId: course.id,
        courseTitle: course.title,
        curriculum,
      },
    });
  } catch (error: any) {
    console.error('Fetch curriculum error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch curriculum.' });
  }
});

// GET /api/courses/:courseId/lessons/:lessonId - STRICT PROTECTED LESSON ACCESS GUARD
router.get('/:courseId/lessons/:lessonId', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user?.userId || null;
    const userRole = req.user?.role || null;

    // Enforce backend access guard
    const access = await verifyCourseLessonAccess(userId, userRole, courseId, lessonId);

    if (!access.allowed) {
      res.status(access.statusCode).json({
        success: false,
        error: access.errorCode,
        message: access.errorMessage,
      });
      return;
    }

    const { course, lesson } = access;

    // Fetch user progress if authenticated
    let watchedSeconds = 0;
    let isCompleted = false;
    let lastAccessedAt = new Date().toISOString();

    if (userId) {
      const progressRecord = await prisma.lessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId: lesson.id } },
      });
      if (progressRecord) {
        watchedSeconds = progressRecord.watchedSeconds || 0;
        isCompleted = progressRecord.isCompleted || false;
        lastAccessedAt = progressRecord.lastAccessedAt ? progressRecord.lastAccessedAt.toISOString() : new Date().toISOString();
      }
    }

    // Generate short-lived signed video URL / token for playback
    const rawVideoUrl = lesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const signedTokenData = generateSignedVideoToken(
      userId || 'anonymous_preview',
      course.id,
      lesson.id,
      rawVideoUrl,
      30 // 30 minutes expiration
    );

    // Calculate next and previous lesson IDs
    const allLessons = course.sections.flatMap((s: any) => s.lessons);
    const lessonIndex = allLessons.findIndex((l: any) => l.id === lesson.id);
    const prevLessonId = lessonIndex > 0 ? allLessons[lessonIndex - 1].id : null;
    const nextLessonId = lessonIndex >= 0 && lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1].id : null;

    res.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          instructorId: course.instructorId,
        },
        lesson: {
          id: lesson.id,
          title: lesson.title,
          durationMinutes: lesson.durationMinutes,
          content: lesson.content,
          downloadableUrl: lesson.downloadableUrl,
          isFreePreview: lesson.isFreePreview,
          // Signed Stream URL (does NOT expose private raw storage URL)
          streamUrl: signedTokenData.streamUrl,
          signedToken: signedTokenData.token,
          expiresAt: signedTokenData.expiresAt,
        },
        userProgress: {
          watchedSeconds,
          isCompleted,
          lastAccessedAt,
        },
        prevLessonId,
        nextLessonId,
      },
    });
  } catch (error: any) {
    console.error('Protected lesson access error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to retrieve lesson content.' });
  }
});

// POST /api/courses/:courseId/lessons/:lessonId/progress - Throttled Progress Update
router.post('/:courseId/lessons/:lessonId/progress', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonId } = req.params;
    const { watchedSeconds, isCompleted } = req.body;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Verify access
    const access = await verifyCourseLessonAccess(userId, userRole, courseId, lessonId);
    if (!access.allowed) {
      res.status(access.statusCode).json({
        success: false,
        error: access.errorCode,
        message: access.errorMessage,
      });
      return;
    }

    const { course, lesson } = access;

    // Upsert LessonProgress
    const updatedProgress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
      update: {
        ...(watchedSeconds !== undefined && { watchedSeconds: Math.floor(Number(watchedSeconds)) }),
        ...(isCompleted !== undefined && { isCompleted: Boolean(isCompleted) }),
        ...(isCompleted === true && { completedAt: new Date() }),
        lastAccessedAt: new Date(),
      },
      create: {
        userId,
        lessonId: lesson.id,
        watchedSeconds: watchedSeconds ? Math.floor(Number(watchedSeconds)) : 0,
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null,
        lastAccessedAt: new Date(),
      },
    });

    // Check course completion status
    const completionResult = await processCourseCompletion(userId, course.id);

    res.json({
      success: true,
      message: 'Lesson progress persisted successfully.',
      data: {
        lessonId: lesson.id,
        watchedSeconds: updatedProgress.watchedSeconds,
        isCompleted: updatedProgress.isCompleted,
        lastAccessedAt: updatedProgress.lastAccessedAt,
        courseProgress: completionResult?.enrollment?.progress || 0,
        isCourseCompleted: completionResult?.isCompleted || false,
        certificate: completionResult?.certificate || null,
      },
    });
  } catch (error: any) {
    console.error('Update lesson progress error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to update lesson progress.' });
  }
});

// POST /api/courses/:courseId/enroll - Enroll in course
router.post('/:courseId/enroll', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;

    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }], deletedAt: null },
    });

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });

    if (existingEnrollment) {
      // Re-activate if cancelled/expired
      if (existingEnrollment.status !== EnrollmentStatus.ACTIVE && existingEnrollment.status !== EnrollmentStatus.COMPLETED) {
        const reactivated = await prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: { status: EnrollmentStatus.ACTIVE, expiresAt: null },
        });
        res.json({ success: true, message: 'Enrollment reactivated.', data: reactivated });
        return;
      }

      res.json({ success: true, message: 'Already enrolled in this course.', data: existingEnrollment });
      return;
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: course.id,
        status: EnrollmentStatus.ACTIVE,
        progress: 0,
      },
    });

    // Send confirmation notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'Enrollment Confirmed 🎓',
        message: `You are now enrolled in "${course.title}". Start watching lessons now!`,
        linkUrl: `/student/learn/${course.id}`,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully!',
      data: enrollment,
    });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to process course enrollment.' });
  }
});

// POST /api/courses - Create Course (INSTRUCTOR or ADMIN)
router.post(
  '/',
  authenticate,
  requireRoles(Role.INSTRUCTOR, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { title, shortDescription, description, price, level, categoryId } = req.body;

      if (!title || !shortDescription || !description || !categoryId) {
        res.status(400).json({ success: false, message: 'Missing required course fields.' });
        return;
      }

      const slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') +
        '-' +
        Date.now().toString().slice(-4);

      const course = await prisma.course.create({
        data: {
          title,
          slug,
          shortDescription,
          description,
          price: Number(price) || 0,
          level: (level as CourseLevel) || CourseLevel.BEGINNER,
          instructorId: req.user!.userId,
          categoryId,
          sections: {
            create: [
              {
                title: 'Section 1: Course Overview & Architecture',
                orderIndex: 0,
                lessons: {
                  create: [
                    {
                      title: '1. Welcome & Getting Started',
                      durationMinutes: 10,
                      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                      isFreePreview: true,
                      orderIndex: 0,
                    },
                    {
                      title: '2. Deep Dive Architectural Patterns',
                      durationMinutes: 18,
                      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                      isFreePreview: false,
                      orderIndex: 1,
                    },
                  ],
                },
              },
            ],
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully.',
        data: course,
      });
    } catch (error: any) {
      console.error('Create course error:', error);
      res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to create course.' });
    }
  }
);

export default router;
