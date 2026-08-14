import { prisma } from '../db/prisma.js';
import { EnrollmentStatus, Role } from '@prisma/client';

export interface AccessCheckResult {
  allowed: boolean;
  statusCode: number;
  errorCode?: string;
  errorMessage?: string;
  course?: any;
  lesson?: any;
  enrollment?: any;
}

/**
 * Enforces strict backend access verification for protected course lessons.
 *
 * Rules:
 * 1. User authenticated
 * 2. User role permitted (Student / Author Instructor / Admin / Enrolled Instructor)
 * 3. Enrollment exists (unless Free Preview or Author/Admin)
 * 4. Enrollment status is ACTIVE or COMPLETED (not EXPIRED, not CANCELLED)
 * 5. Course is accessible (is published, not deleted)
 * 6. Lesson belongs to that course
 */
export async function verifyCourseLessonAccess(
  userId: string | null,
  userRole: Role | null,
  courseIdOrSlug: string,
  lessonId: string
): Promise<AccessCheckResult> {
  // 1. Fetch course with sections and lessons
  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id: courseIdOrSlug }, { slug: courseIdOrSlug }],
    },
    include: {
      sections: {
        include: {
          lessons: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });

  if (!course || course.deletedAt) {
    return {
      allowed: false,
      statusCode: 404,
      errorCode: 'COURSE_NOT_FOUND',
      errorMessage: 'The requested course does not exist or has been removed.',
    };
  }

  // Find target lesson
  const allLessons = course.sections.flatMap((sec) => sec.lessons);
  const lesson = allLessons.find((l) => l.id === lessonId);

  if (!lesson) {
    // 6. Lesson does not belong to this course or doesn't exist
    return {
      allowed: false,
      statusCode: 404,
      errorCode: 'LESSON_NOT_FOUND',
      errorMessage: 'The requested lesson does not exist in this course curriculum.',
    };
  }

  // Check if course is published (non-authors/non-admins cannot access draft courses)
  const isAuthor = userId ? course.instructorId === userId : false;
  const isAdmin = userRole === 'ADMIN';

  if (!course.isPublished && !isAuthor && !isAdmin) {
    return {
      allowed: false,
      statusCode: 403,
      errorCode: 'COURSE_UNPUBLISHED',
      errorMessage: 'This course is currently in draft mode and not available for access.',
    };
  }

  // If lesson is a Free Preview, grant access (if course is published/accessible)
  if (lesson.isFreePreview) {
    return {
      allowed: true,
      statusCode: 200,
      course,
      lesson,
    };
  }

  // 1. Authentication Check for protected content
  if (!userId || !userRole) {
    return {
      allowed: false,
      statusCode: 401,
      errorCode: 'UNAUTHENTICATED',
      errorMessage: 'Authentication required. Please log in to access protected course lessons.',
    };
  }

  // Admin Override
  if (isAdmin) {
    return {
      allowed: true,
      statusCode: 200,
      course,
      lesson,
    };
  }

  // Author Instructor Override
  if (isAuthor) {
    return {
      allowed: true,
      statusCode: 200,
      course,
      lesson,
    };
  }

  // 3. Enrollment Check
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  });

  if (!enrollment) {
    // 2 & 3. Non-enrolled student or instructor attempting to access another instructor's course
    return {
      allowed: false,
      statusCode: 403,
      errorCode: 'NO_ENROLLMENT',
      errorMessage: 'Access Denied: You must be actively enrolled in this course to access protected lessons.',
    };
  }

  // 4. Enrollment Status Check
  if (enrollment.status === EnrollmentStatus.CANCELLED) {
    return {
      allowed: false,
      statusCode: 403,
      errorCode: 'ENROLLMENT_CANCELLED',
      errorMessage: 'Access Denied: Your enrollment for this course has been cancelled.',
    };
  }

  if (enrollment.status === EnrollmentStatus.EXPIRED) {
    return {
      allowed: false,
      statusCode: 403,
      errorCode: 'ENROLLMENT_EXPIRED',
      errorMessage: 'Access Denied: Your enrollment access period for this course has expired.',
    };
  }

  // Check expiresAt date if set
  if (enrollment.expiresAt && new Date() > new Date(enrollment.expiresAt)) {
    // Auto-update enrollment status in background
    prisma.enrollment
      .update({
        where: { id: enrollment.id },
        data: { status: EnrollmentStatus.EXPIRED },
      })
      .catch((e) => console.error('Failed to mark expired enrollment:', e));

    return {
      allowed: false,
      statusCode: 403,
      errorCode: 'ENROLLMENT_EXPIRED',
      errorMessage: 'Access Denied: Your access period for this course expired on ' + new Date(enrollment.expiresAt).toLocaleDateString() + '.',
    };
  }

  // Access Granted!
  return {
    allowed: true,
    statusCode: 200,
    course,
    lesson,
    enrollment,
  };
}
