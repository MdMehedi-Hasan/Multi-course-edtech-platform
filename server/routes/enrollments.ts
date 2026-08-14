import { Router, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/enrollments
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      res.status(400).json({ success: false, message: 'courseId parameter is required.' });
      return;
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.deletedAt) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      res.json({
        success: true,
        message: 'Already enrolled in this course.',
        data: existingEnrollment,
      });
      return;
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: req.user!.userId,
        courseId,
        progress: 0.0,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course.',
      data: enrollment,
    });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to enroll in course.' });
  }
});

// GET /api/enrollments/me
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user!.userId },
      include: {
        course: {
          include: {
            instructor: { include: { profile: true } },
            category: true,
            sections: {
              include: { lessons: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.json({
      success: true,
      data: enrollments.map((e) => {
        const totalLessons = e.course.sections.reduce((acc, sec) => acc + sec.lessons.length, 0);
        return {
          id: e.id,
          courseId: e.courseId,
          courseTitle: e.course.title,
          courseSlug: e.course.slug,
          courseLevel: e.course.level,
          instructorName: e.course.instructor?.profile?.name || 'Instructor',
          categoryName: e.course.category?.name,
          progress: e.progress,
          totalLessons,
          enrolledAt: e.enrolledAt,
        };
      }),
    });
  } catch (error: any) {
    console.error('Fetch my enrollments error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch enrolled courses.' });
  }
});

// POST /api/enrollments/progress
router.post('/progress', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonId, isCompleted } = req.body;

    if (!courseId || !lessonId) {
      res.status(400).json({ success: false, message: 'courseId and lessonId are required.' });
      return;
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      res.status(404).json({ success: false, message: 'Enrollment record not found for this user.' });
      return;
    }

    // Upsert LessonProgress
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: req.user!.userId,
          lessonId,
        },
      },
      update: {
        isCompleted: isCompleted ?? true,
      },
      create: {
        userId: req.user!.userId,
        lessonId,
        isCompleted: isCompleted ?? true,
      },
    });

    // Calculate overall course completion percentage
    const allLessons = await prisma.lesson.findMany({
      where: {
        section: {
          courseId,
        },
      },
      select: { id: true },
    });

    const totalLessons = allLessons.length;
    let newProgressPercentage = 0;

    if (totalLessons > 0) {
      const completedLessonsCount = await prisma.lessonProgress.count({
        where: {
          userId: req.user!.userId,
          lessonId: { in: allLessons.map((l) => l.id) },
          isCompleted: true,
        },
      });

      newProgressPercentage = Math.round((completedLessonsCount / totalLessons) * 100 * 10) / 10;
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: newProgressPercentage,
        completedAt: newProgressPercentage >= 100 ? new Date() : null,
      },
    });

    res.json({
      success: true,
      message: 'Lesson progress updated.',
      data: {
        enrollmentId: updatedEnrollment.id,
        progress: updatedEnrollment.progress,
        isCourseCompleted: newProgressPercentage >= 100,
      },
    });
  } catch (error: any) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to update lesson progress.' });
  }
});

export default router;
