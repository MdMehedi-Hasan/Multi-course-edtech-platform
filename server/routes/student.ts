import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/student/dashboard
router.get('/dashboard', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { include: { profile: true } },
            category: true,
            sections: {
              include: {
                lessons: true,
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const totalCourses = enrollments.length;
    const completedEnrollments = enrollments.filter((e) => e.progress >= 100);
    const completedCoursesCount = completedEnrollments.length;

    const overallProgress =
      totalCourses > 0
        ? Math.round(
            (enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses) * 10
          ) / 10
        : 0;

    // Continue learning: first enrollment with 0 < progress < 100, or latest
    const continueLearningEnrollment =
      enrollments.find((e) => e.progress > 0 && e.progress < 100) ||
      enrollments[0] ||
      null;

    let continueLearningData = null;
    if (continueLearningEnrollment) {
      const allLessons = continueLearningEnrollment.course.sections.flatMap((s) => s.lessons);
      const userProgresses = await prisma.lessonProgress.findMany({
        where: {
          userId,
          lessonId: { in: allLessons.map((l) => l.id) },
        },
      });

      const completedSet = new Set(
        userProgresses.filter((p) => p.isCompleted).map((p) => p.lessonId)
      );

      // Find first uncompleted lesson
      const nextLesson = allLessons.find((l) => !completedSet.has(l.id)) || allLessons[0];

      continueLearningData = {
        courseId: continueLearningEnrollment.courseId,
        courseTitle: continueLearningEnrollment.course.title,
        courseSlug: continueLearningEnrollment.course.slug,
        progress: continueLearningEnrollment.progress,
        instructorName:
          continueLearningEnrollment.course.instructor?.profile?.name || 'Instructor',
        nextLessonId: nextLesson?.id,
        nextLessonTitle: nextLesson?.title || 'Lesson 1',
        totalLessons: allLessons.length,
      };
    }

    // Recently accessed
    const recentlyAccessed = enrollments.slice(0, 4).map((e) => ({
      courseId: e.courseId,
      courseTitle: e.course.title,
      courseSlug: e.course.slug,
      progress: e.progress,
      instructorName: e.course.instructor?.profile?.name || 'Instructor',
      level: e.course.level,
      enrolledAt: e.enrolledAt,
    }));

    // Certificates
    const userProfile = await prisma.profile.findUnique({ where: { userId } });
    const studentName = userProfile?.name || req.user!.email.split('@')[0];

    const certificates = completedEnrollments.map((e) => ({
      id: `CERT-${e.id.substring(0, 8).toUpperCase()}`,
      courseId: e.courseId,
      courseTitle: e.course.title,
      completedAt: e.completedAt || e.updatedAt,
      studentName,
      instructorName: e.course.instructor?.profile?.name || 'Instructor',
      categoryName: e.course.category?.name || 'Software Engineering',
    }));

    // Recommended courses (published, user not enrolled in)
    const enrolledCourseIds = enrollments.map((e) => e.courseId);
    const recommendedCoursesRaw = await prisma.course.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        id: { notIn: enrolledCourseIds.length > 0 ? enrolledCourseIds : ['none'] },
      },
      include: {
        instructor: { include: { profile: true } },
        category: true,
      },
      take: 3,
    });

    const recommendedCourses = recommendedCoursesRaw.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      shortDescription: c.shortDescription,
      price: c.price,
      level: c.level,
      categoryName: c.category?.name,
      instructorName: c.instructor?.profile?.name || 'Instructor',
    }));

    res.json({
      success: true,
      data: {
        totalCourses,
        completedCoursesCount,
        overallProgress,
        continueLearning: continueLearningData,
        recentlyAccessed,
        enrolledCourses: enrollments.map((e) => ({
          id: e.id,
          courseId: e.courseId,
          title: e.course.title,
          slug: e.course.slug,
          progress: e.progress,
          level: e.course.level,
          instructorName: e.course.instructor?.profile?.name || 'Instructor',
          enrolledAt: e.enrolledAt,
        })),
        certificates,
        recommendedCourses,
      },
    });
  } catch (error: any) {
    console.error('Fetch student dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student dashboard data.' });
  }
});

// GET /api/student/courses
router.get('/courses', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { include: { profile: true } },
            category: true,
            sections: {
              include: {
                lessons: {
                  where: { deletedAt: null },
                  orderBy: { orderIndex: 'asc' },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const result = await Promise.all(
      enrollments.map(async (e) => {
        const allLessons = e.course.sections.flatMap((s) => s.lessons);
        const totalLessons = allLessons.length;

        const progresses = await prisma.lessonProgress.findMany({
          where: {
            userId,
            lessonId: { in: allLessons.map((l) => l.id) },
          },
          orderBy: { updatedAt: 'desc' },
        });

        const completedCount = progresses.filter((p) => p.isCompleted).length;
        const lastProgress = progresses[0];
        const lastAccessedLesson = lastProgress
          ? allLessons.find((l) => l.id === lastProgress.lessonId)
          : allLessons[0];

        return {
          id: e.id,
          courseId: e.courseId,
          courseTitle: e.course.title,
          courseSlug: e.course.slug,
          shortDescription: e.course.shortDescription,
          level: e.course.level,
          categoryName: e.course.category?.name,
          instructorName: e.course.instructor?.profile?.name || 'Instructor',
          progress: e.progress,
          completedLessonsCount: completedCount,
          totalLessonsCount: totalLessons,
          lastAccessedLesson: lastAccessedLesson
            ? {
                id: lastAccessedLesson.id,
                title: lastAccessedLesson.title,
              }
            : null,
          enrolledAt: e.enrolledAt,
        };
      })
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Fetch student courses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch enrolled courses.' });
  }
});

// GET /api/student/courses/:courseId
router.get('/courses/:courseId', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      res.status(403).json({
        success: false,
        error: 'NOT_ENROLLED',
        message: 'Access Denied: You are not enrolled in this course.',
      });
      return;
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        instructor: { include: { profile: true } },
        sections: {
          include: {
            lessons: {
              where: { deletedAt: null },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!course || course.deletedAt) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const allLessons = course.sections.flatMap((s) => s.lessons);
    const progresses = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: { in: allLessons.map((l) => l.id) },
      },
    });

    const completedSet = new Set(
      progresses.filter((p) => p.isCompleted).map((p) => p.lessonId)
    );

    const sectionsWithProgress = course.sections.map((section) => ({
      id: section.id,
      title: section.title,
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        durationMinutes: lesson.durationMinutes,
        videoUrl: lesson.videoUrl,
        isFreePreview: lesson.isFreePreview,
        isCompleted: completedSet.has(lesson.id),
      })),
    }));

    res.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          shortDescription: course.shortDescription,
          description: course.description,
          level: course.level,
          instructorName: course.instructor?.profile?.name || 'Instructor',
          categoryName: course.category?.name,
        },
        enrollment: {
          id: enrollment.id,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
        },
        sections: sectionsWithProgress,
      },
    });
  } catch (error: any) {
    console.error('Fetch student course detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course details.' });
  }
});

// GET /api/student/learn/:courseId/lessons/:lessonId - PROTECTED LESSON ACCESS API
router.get(
  '/learn/:courseId/lessons/:lessonId',
  authenticate,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { courseId, lessonId } = req.params;
      const userId = req.user!.userId;

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          instructor: { include: { profile: true } },
          sections: {
            include: {
              lessons: {
                where: { deletedAt: null },
                orderBy: { orderIndex: 'asc' },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      if (!course || course.deletedAt) {
        res.status(404).json({ success: false, message: 'Course not found.' });
        return;
      }

      // Check enrollment & permissions
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });

      const isInstructor = course.instructorId === userId;
      const isAdmin = req.user!.role === 'ADMIN';

      // Find the lesson
      const allLessons = course.sections.flatMap((s) => s.lessons);
      const lesson = allLessons.find((l) => l.id === lessonId);

      if (!lesson) {
        res.status(404).json({ success: false, message: 'Lesson not found in this course.' });
        return;
      }

      // ACCESS CONTROL CHECK: Must be enrolled OR lesson is free preview OR instructor/admin
      if (!enrollment && !lesson.isFreePreview && !isInstructor && !isAdmin) {
        res.status(403).json({
          success: false,
          error: 'ACCESS_DENIED',
          message: 'Access Denied: You must be enrolled in this course to access this lesson.',
        });
        return;
      }

      // Fetch user's saved lesson progress
      const progressRecord = await prisma.lessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
      });

      // All user progresses for lesson completed flags in sidebar
      const allProgresses = await prisma.lessonProgress.findMany({
        where: {
          userId,
          lessonId: { in: allLessons.map((l) => l.id) },
        },
      });

      const completedSet = new Set(
        allProgresses.filter((p) => p.isCompleted).map((p) => p.lessonId)
      );

      // Determine next and previous lesson IDs
      const lessonIndex = allLessons.findIndex((l) => l.id === lessonId);
      const prevLessonId = lessonIndex > 0 ? allLessons[lessonIndex - 1].id : null;
      const nextLessonId =
        lessonIndex >= 0 && lessonIndex < allLessons.length - 1
          ? allLessons[lessonIndex + 1].id
          : null;

      const sectionsWithOutline = course.sections.map((section) => ({
        id: section.id,
        title: section.title,
        lessons: section.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          durationMinutes: l.durationMinutes,
          isFreePreview: l.isFreePreview,
          isCompleted: completedSet.has(l.id),
        })),
      }));

      res.json({
        success: true,
        data: {
          course: {
            id: course.id,
            title: course.title,
            slug: course.slug,
            instructorName: course.instructor?.profile?.name || 'Instructor',
          },
          lesson: {
            id: lesson.id,
            title: lesson.title,
            durationMinutes: lesson.durationMinutes,
            videoUrl: lesson.videoUrl,
            isFreePreview: lesson.isFreePreview,
          },
          userProgress: {
            watchedSeconds: progressRecord?.watchedSeconds || 0,
            isCompleted: progressRecord?.isCompleted || false,
          },
          nextLessonId,
          prevLessonId,
          sections: sectionsWithOutline,
          isEnrolled: !!enrollment,
          overallCourseProgress: enrollment?.progress || 0,
        },
      });
    } catch (error: any) {
      console.error('Fetch lesson error:', error);
      res.status(500).json({ success: false, message: 'Failed to access lesson.' });
    }
  }
);

// POST /api/student/progress
router.post('/progress', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonId, watchedSeconds, isCompleted } = req.body;
    const userId = req.user!.userId;

    if (!courseId || !lessonId) {
      res.status(400).json({ success: false, message: 'courseId and lessonId are required.' });
      return;
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      res.status(403).json({
        success: false,
        error: 'NOT_ENROLLED',
        message: 'Access Denied: You are not enrolled in this course.',
      });
      return;
    }

    // Upsert LessonProgress
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        ...(watchedSeconds !== undefined && { watchedSeconds: Math.floor(watchedSeconds) }),
        ...(isCompleted !== undefined && { isCompleted }),
        ...(isCompleted === true && { completedAt: new Date() }),
      },
      create: {
        userId,
        lessonId,
        watchedSeconds: watchedSeconds ? Math.floor(watchedSeconds) : 0,
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Recalculate course percentage
    const allLessons = await prisma.lesson.findMany({
      where: { section: { courseId }, deletedAt: null },
      select: { id: true },
    });

    const totalLessons = allLessons.length;
    let newProgressPercentage = 0;

    if (totalLessons > 0) {
      const completedCount = await prisma.lessonProgress.count({
        where: {
          userId,
          lessonId: { in: allLessons.map((l) => l.id) },
          isCompleted: true,
        },
      });

      newProgressPercentage = Math.round((completedCount / totalLessons) * 100 * 10) / 10;
    }

    const isNowCompleted = newProgressPercentage >= 100;

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: newProgressPercentage,
        completedAt: isNowCompleted ? new Date() : null,
      },
    });

    // Also update CourseProgress model
    await prisma.courseProgress.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {
        percentComplete: newProgressPercentage,
        totalLessonsCount: totalLessons,
      },
      create: {
        userId,
        courseId,
        percentComplete: newProgressPercentage,
        totalLessonsCount: totalLessons,
      },
    });

    // Send completion notification if newly completed
    if (isNowCompleted && enrollment.progress < 100) {
      const courseObj = await prisma.course.findUnique({ where: { id: courseId } });
      await prisma.notification.create({
        data: {
          userId,
          title: 'Course Completed! 🎉',
          message: `Congratulations! You have completed all lessons in ${courseObj?.title || 'the course'}. Your completion certificate is ready.`,
          linkUrl: '/student/dashboard',
        },
      });
    }

    res.json({
      success: true,
      data: {
        enrollmentId: updatedEnrollment.id,
        progress: updatedEnrollment.progress,
        isCourseCompleted: isNowCompleted,
      },
    });
  } catch (error: any) {
    console.error('Update student progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to update progress.' });
  }
});

// GET /api/student/progress
router.get('/progress', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            level: true,
          },
        },
      },
    });

    const allUserProgresses = await prisma.lessonProgress.findMany({
      where: { userId },
    });

    const completedLessonsCount = allUserProgresses.filter((p) => p.isCompleted).length;
    const totalWatchedSeconds = allUserProgresses.reduce((sum, p) => sum + (p.watchedSeconds || 0), 0);
    const totalWatchedHours = Math.round((totalWatchedSeconds / 3600) * 10) / 10;

    const completedCoursesCount = enrollments.filter((e) => e.progress >= 100).length;

    res.json({
      success: true,
      data: {
        totalEnrollments: enrollments.length,
        completedCoursesCount,
        completedLessonsCount,
        totalWatchedHours,
        coursesProgress: enrollments.map((e) => ({
          courseId: e.courseId,
          title: e.course.title,
          slug: e.course.slug,
          level: e.course.level,
          progress: e.progress,
          enrolledAt: e.enrolledAt,
          completedAt: e.completedAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Fetch student progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch progress summary.' });
  }
});

// GET /api/student/wishlist
router.get('/wishlist', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { include: { profile: true } },
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: wishlist.map((item) => ({
        id: item.id,
        courseId: item.courseId,
        createdAt: item.createdAt,
        course: {
          id: item.course.id,
          title: item.course.title,
          slug: item.course.slug,
          shortDescription: item.course.shortDescription,
          price: item.course.price,
          level: item.course.level,
          categoryName: item.course.category?.name,
          instructorName: item.course.instructor?.profile?.name || 'Instructor',
        },
      })),
    });
  } catch (error: any) {
    console.error('Fetch wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
  }
});

// POST /api/student/wishlist
router.post('/wishlist', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.body;
    const userId = req.user!.userId;

    if (!courseId) {
      res.status(400).json({ success: false, message: 'courseId is required.' });
      return;
    }

    const item = await prisma.wishlist.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId },
      include: {
        course: {
          include: {
            instructor: { include: { profile: true } },
            category: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Course added to wishlist.',
      data: {
        id: item.id,
        courseId: item.courseId,
        createdAt: item.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to add course to wishlist.' });
  }
});

// DELETE /api/student/wishlist/:courseId
router.delete('/wishlist/:courseId', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;

    await prisma.wishlist.deleteMany({
      where: { userId, courseId },
    });

    res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (error: any) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove from wishlist.' });
  }
});

// GET /api/student/reviews
router.get('/reviews', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
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
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Fetch student reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student reviews.' });
  }
});

// POST /api/student/reviews
router.post('/reviews', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId, rating, comment } = req.body;
    const userId = req.user!.userId;

    if (!courseId || !rating || !comment) {
      res.status(400).json({ success: false, message: 'courseId, rating, and comment are required.' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
      return;
    }

    // VERIFY ENROLLMENT: Prevent unauthorized reviews
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      res.status(403).json({
        success: false,
        error: 'NOT_ENROLLED',
        message: 'Unauthorized: You can only review courses you are enrolled in.',
      });
      return;
    }

    const review = await prisma.review.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {
        rating,
        comment,
      },
      create: {
        userId,
        courseId,
        rating,
        comment,
      },
      include: {
        course: { select: { title: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: {
        id: review.id,
        courseId: review.courseId,
        courseTitle: review.course.title,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Create student review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// GET /api/student/profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
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
        name: user.profile?.name || user.email.split('@')[0],
        headline: user.profile?.headline || '',
        bio: user.profile?.bio || '',
        avatarUrl: user.profile?.avatarUrl || '',
        website: user.profile?.website || '',
        github: user.profile?.github || '',
        linkedin: user.profile?.linkedin || '',
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student profile.' });
  }
});

// PUT /api/student/profile
router.put('/profile', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, headline, bio, avatarUrl, website, github, linkedin } = req.body;

    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: {
        ...(name && { name }),
        ...(headline !== undefined && { headline }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(website !== undefined && { website }),
        ...(github !== undefined && { github }),
        ...(linkedin !== undefined && { linkedin }),
      },
      create: {
        userId,
        name: name || req.user!.email.split('@')[0],
        headline: headline || '',
        bio: bio || '',
        avatarUrl: avatarUrl || '',
        website: website || '',
        github: github || '',
        linkedin: linkedin || '',
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// POST /api/student/change-password
router.post('/change-password', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

// GET /api/student/notifications
router.get('/notifications', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    let notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Seed initial notifications if none exist
    if (notifications.length === 0) {
      await prisma.notification.createMany({
        data: [
          {
            userId,
            title: 'Welcome to EduNexus! 🚀',
            message: 'Your student account is active. Explore curriculums and start learning enterprise software engineering.',
            linkUrl: '/courses',
          },
          {
            userId,
            title: 'New Course Added 📚',
            message: 'Check out the newly released "Microservices Architecture with Docker & Kubernetes".',
            linkUrl: '/courses',
          },
        ],
      });

      notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json({ success: true, data: notifications });
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

// PATCH /api/student/notifications/:id/read
router.patch('/notifications/:id/read', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read.' });
  }
});

// POST /api/student/notifications/read-all
router.post('/notifications/read-all', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications as read.' });
  }
});

// GET /api/student/certificates - Get all earned certificates
router.get('/certificates', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const certs = await prisma.certificate.findMany({
      where: { userId },
      include: { course: { include: { category: true } } },
      orderBy: { issuedAt: 'desc' },
    });

    res.json({
      success: true,
      data: certs.map((c) => ({
        id: c.id,
        certificateCode: c.certificateCode,
        courseId: c.courseId,
        courseTitle: c.courseTitle,
        studentName: c.studentName,
        instructorName: c.instructorName,
        categoryName: c.course?.category?.name || 'Software Engineering',
        issuedAt: c.issuedAt,
      })),
    });
  } catch (error: any) {
    console.error('Fetch student certificates error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certificates.' });
  }
});

// GET /api/student/certificates/:id - Get certificate details by ID or Code
router.get('/certificates/:id', async (req, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ id }, { certificateCode: id }],
      },
      include: {
        course: { include: { category: true } },
      },
    });

    if (!cert) {
      res.status(404).json({ success: false, message: 'Certificate not found.' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: cert.id,
        certificateCode: cert.certificateCode,
        courseId: cert.courseId,
        courseTitle: cert.courseTitle,
        studentName: cert.studentName,
        instructorName: cert.instructorName,
        categoryName: cert.course?.category?.name || 'Software Engineering',
        issuedAt: cert.issuedAt,
      },
    });
  } catch (error: any) {
    console.error('Fetch certificate detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certificate detail.' });
  }
});

export default router;
