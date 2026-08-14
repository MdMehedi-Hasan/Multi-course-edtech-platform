import { prisma } from '../db/prisma.js';
import { EnrollmentStatus } from '@prisma/client';

/**
 * Handles course completion workflow when all lessons are completed.
 * Triggers:
 * 1. Enrollment status update to COMPLETED
 * 2. Certificate generation
 * 3. Notification dispatch
 */
export async function processCourseCompletion(userId: string, courseId: string) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) return null;

    // Verify all lessons in course are completed
    const allLessons = await prisma.lesson.findMany({
      where: { section: { courseId }, deletedAt: null },
      select: { id: true },
    });

    const totalLessons = allLessons.length;
    if (totalLessons === 0) return null;

    const completedCount = await prisma.lessonProgress.count({
      where: {
        userId,
        lessonId: { in: allLessons.map((l) => l.id) },
        isCompleted: true,
      },
    });

    const percentComplete = Math.round((completedCount / totalLessons) * 100 * 10) / 10;
    const is100Percent = completedCount >= totalLessons;

    // Update Enrollment
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: percentComplete,
        ...(is100Percent && {
          status: EnrollmentStatus.COMPLETED,
          completedAt: enrollment.completedAt || new Date(),
        }),
      },
    });

    let certificate = null;

    if (is100Percent) {
      // Fetch user profile and course details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { instructor: { include: { profile: true } } },
      });

      if (user && course) {
        const studentName = user.profile?.name || user.email.split('@')[0];
        const instructorName = course.instructor?.profile?.name || 'EduNexus Instructor';

        // Upsert Certificate
        const certCode = `CERT-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        certificate = await prisma.certificate.upsert({
          where: { userId_courseId: { userId, courseId } },
          update: {},
          create: {
            certificateCode: certCode,
            userId,
            courseId,
            studentName,
            courseTitle: course.title,
            instructorName,
            issuedAt: new Date(),
          },
        });

        // Trigger in-app notification if newly completed
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId,
            title: { contains: 'Course Completed' },
            linkUrl: `/student/certificates/${certificate.id}`,
          },
        });

        if (!existingNotification) {
          await prisma.notification.create({
            data: {
              userId,
              title: 'Course Completed! 🎉',
              message: `Congratulations ${studentName}! You completed "${course.title}". Your official certificate of completion is now ready.`,
              linkUrl: `/student/certificates/${certificate.id}`,
            },
          });
        }
      }
    }

    return {
      enrollment: updatedEnrollment,
      isCompleted: is100Percent,
      certificate,
    };
  } catch (error) {
    console.error('Process course completion error:', error);
    throw error;
  }
}
