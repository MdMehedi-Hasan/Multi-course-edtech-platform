import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { verifyCourseLessonAccess } from '../lib/courseAccessGuard.js';
import { EnrollmentStatus, Role } from '@prisma/client';

const router = Router();

export interface SecurityTestCase {
  id: string;
  name: string;
  description: string;
  expectedStatus: number;
  expectedErrorCode?: string;
  passed: boolean;
  actualStatus: number;
  actualResponse: any;
}

// POST /api/security/test-suite - Runs comprehensive security assertions
router.post('/test-suite', async (_req: Request, res: Response): Promise<void> => {
  try {
    const results: SecurityTestCase[] = [];

    // Ensure test fixtures exist
    // 1. Get or create test users
    let student = await prisma.user.findFirst({ where: { email: 'sec_student@example.com' } });
    if (!student) {
      student = await prisma.user.create({
        data: {
          email: 'sec_student@example.com',
          passwordHash: '$2a$10$abcdef',
          role: Role.STUDENT,
          profile: { create: { name: 'Test Student Security' } },
        },
      });
    }

    let nonEnrolledStudent = await prisma.user.findFirst({ where: { email: 'sec_non_enrolled@example.com' } });
    if (!nonEnrolledStudent) {
      nonEnrolledStudent = await prisma.user.create({
        data: {
          email: 'sec_non_enrolled@example.com',
          passwordHash: '$2a$10$abcdef',
          role: Role.STUDENT,
          profile: { create: { name: 'Non Enrolled Student' } },
        },
      });
    }

    let instructorA = await prisma.user.findFirst({ where: { email: 'sec_instructor_a@example.com' } });
    if (!instructorA) {
      instructorA = await prisma.user.create({
        data: {
          email: 'sec_instructor_a@example.com',
          passwordHash: '$2a$10$abcdef',
          role: Role.INSTRUCTOR,
          profile: { create: { name: 'Dr. Instructor A' } },
        },
      });
    }

    let instructorB = await prisma.user.findFirst({ where: { email: 'sec_instructor_b@example.com' } });
    if (!instructorB) {
      instructorB = await prisma.user.create({
        data: {
          email: 'sec_instructor_b@example.com',
          passwordHash: '$2a$10$abcdef',
          role: Role.INSTRUCTOR,
          profile: { create: { name: 'Prof. Instructor B' } },
        },
      });
    }

    let category = await prisma.category.findFirst({ where: { slug: 'web-development' } });
    if (!category) {
      category = await prisma.category.create({
        data: { name: 'Web Dev', slug: 'web-development' },
      });
    }

    // Create Course 1 authored by Instructor A
    let courseA = await prisma.course.findFirst({ where: { slug: 'sec-course-a' } });
    if (!courseA) {
      courseA = await prisma.course.create({
        data: {
          title: 'Security Test Course A',
          slug: 'sec-course-a',
          shortDescription: 'Security test course',
          description: 'Security test course',
          instructorId: instructorA.id,
          categoryId: category.id,
          isPublished: true,
          sections: {
            create: [
              {
                title: 'Section 1',
                orderIndex: 0,
                lessons: {
                  create: [
                    {
                      title: 'Free Preview Lesson',
                      durationMinutes: 5,
                      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                      isFreePreview: true,
                      orderIndex: 0,
                    },
                    {
                      title: 'Protected Lesson A1',
                      durationMinutes: 15,
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
    }

    // Get lessons
    const courseALessons = await prisma.lesson.findMany({
      where: { section: { courseId: courseA.id } },
      orderBy: { orderIndex: 'asc' },
    });

    const freePreviewLesson = courseALessons.find((l) => l.isFreePreview) || courseALessons[0];
    const protectedLessonA = courseALessons.find((l) => !l.isFreePreview) || courseALessons[1];

    // Ensure Active Enrollment for student in courseA
    let activeEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: student.id, courseId: courseA.id } },
    });
    if (!activeEnrollment) {
      activeEnrollment = await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: courseA.id,
          status: EnrollmentStatus.ACTIVE,
          progress: 0,
        },
      });
    } else {
      await prisma.enrollment.update({
        where: { id: activeEnrollment.id },
        data: { status: EnrollmentStatus.ACTIVE },
      });
    }

    // Create Expired Enrollment User & Course B
    let expiredStudent = await prisma.user.findFirst({ where: { email: 'sec_expired_student@example.com' } });
    if (!expiredStudent) {
      expiredStudent = await prisma.user.create({
        data: {
          email: 'sec_expired_student@example.com',
          passwordHash: '$2a$10$abcdef',
          role: Role.STUDENT,
          profile: { create: { name: 'Expired Student' } },
        },
      });
    }

    let expiredEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: expiredStudent.id, courseId: courseA.id } },
    });
    if (!expiredEnrollment) {
      expiredEnrollment = await prisma.enrollment.create({
        data: {
          userId: expiredStudent.id,
          courseId: courseA.id,
          status: EnrollmentStatus.EXPIRED,
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          progress: 10,
        },
      });
    }

    // Create Cancelled Enrollment User
    let cancelledStudent = await prisma.user.findFirst({ where: { email: 'sec_cancelled_student@example.com' } });
    if (!cancelledStudent) {
      cancelledStudent = await prisma.user.create({
        data: {
          email: 'sec_cancelled_student@example.com',
          passwordHash: '$2a$10$abcdef',
          role: Role.STUDENT,
          profile: { create: { name: 'Cancelled Student' } },
        },
      });
    }

    let cancelledEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: cancelledStudent.id, courseId: courseA.id } },
    });
    if (!cancelledEnrollment) {
      cancelledEnrollment = await prisma.enrollment.create({
        data: {
          userId: cancelledStudent.id,
          courseId: courseA.id,
          status: EnrollmentStatus.CANCELLED,
          progress: 5,
        },
      });
    }

    // ------------------------------------------------------------------------
    // TEST CASE 1: Anonymous user accessing protected lesson
    // ------------------------------------------------------------------------
    const res1 = await verifyCourseLessonAccess(null, null, courseA.id, protectedLessonA.id);
    results.push({
      id: 'TC1',
      name: 'Anonymous Access Block',
      description: 'Anonymous user attempts to fetch protected lesson content.',
      expectedStatus: 401,
      expectedErrorCode: 'UNAUTHENTICATED',
      passed: res1.statusCode === 401 && !res1.allowed,
      actualStatus: res1.statusCode,
      actualResponse: res1,
    });

    // ------------------------------------------------------------------------
    // TEST CASE 2: Logged-in non-enrolled student accessing protected lesson
    // ------------------------------------------------------------------------
    const res2 = await verifyCourseLessonAccess(nonEnrolledStudent.id, Role.STUDENT, courseA.id, protectedLessonA.id);
    results.push({
      id: 'TC2',
      name: 'Non-Enrolled Student Block',
      description: 'Logged-in student without enrollment attempts to access protected lesson.',
      expectedStatus: 403,
      expectedErrorCode: 'NO_ENROLLMENT',
      passed: res2.statusCode === 403 && !res2.allowed,
      actualStatus: res2.statusCode,
      actualResponse: res2,
    });

    // ------------------------------------------------------------------------
    // TEST CASE 3: Enrolled student with ACTIVE enrollment
    // ------------------------------------------------------------------------
    const res3 = await verifyCourseLessonAccess(student.id, Role.STUDENT, courseA.id, protectedLessonA.id);
    results.push({
      id: 'TC3',
      name: 'Active Enrolled Student Access',
      description: 'Enrolled student with ACTIVE enrollment requests protected lesson.',
      expectedStatus: 200,
      passed: res3.statusCode === 200 && res3.allowed,
      actualStatus: res3.statusCode,
      actualResponse: { allowed: res3.allowed, lessonId: res3.lesson?.id },
    });

    // ------------------------------------------------------------------------
    // TEST CASE 4: Instructor accessing another instructor's course without enrollment
    // ------------------------------------------------------------------------
    const res4 = await verifyCourseLessonAccess(instructorB.id, Role.INSTRUCTOR, courseA.id, protectedLessonA.id);
    results.push({
      id: 'TC4',
      name: 'Cross-Instructor Access Block',
      description: 'Instructor B attempts to access Instructor A\'s protected lesson without being enrolled.',
      expectedStatus: 403,
      expectedErrorCode: 'NO_ENROLLMENT',
      passed: res4.statusCode === 403 && !res4.allowed,
      actualStatus: res4.statusCode,
      actualResponse: res4,
    });

    // ------------------------------------------------------------------------
    // TEST CASE 5: Manipulated Course ID (lesson belongs to courseA, requested under bogus course ID)
    // ------------------------------------------------------------------------
    const res5 = await verifyCourseLessonAccess(student.id, Role.STUDENT, 'bogus_course_id_999', protectedLessonA.id);
    results.push({
      id: 'TC5',
      name: 'Manipulated Course ID Protection',
      description: 'Valid lesson requested under wrong or spoofed course ID.',
      expectedStatus: 404,
      expectedErrorCode: 'COURSE_NOT_FOUND',
      passed: res5.statusCode === 404 && !res5.allowed,
      actualStatus: res5.statusCode,
      actualResponse: res5,
    });

    // ------------------------------------------------------------------------
    // TEST CASE 6: Manipulated Lesson ID (lesson ID does not exist in course)
    // ------------------------------------------------------------------------
    const res6 = await verifyCourseLessonAccess(student.id, Role.STUDENT, courseA.id, 'fake_lesson_id_000');
    results.push({
      id: 'TC6',
      name: 'Manipulated Lesson ID Protection',
      description: 'Nonexistent or mismatched lesson ID requested.',
      expectedStatus: 404,
      expectedErrorCode: 'LESSON_NOT_FOUND',
      passed: res6.statusCode === 404 && !res6.allowed,
      actualStatus: res6.statusCode,
      actualResponse: res6,
    });

    // ------------------------------------------------------------------------
    // TEST CASE 7: Expired enrollment
    // ------------------------------------------------------------------------
    const res7 = await verifyCourseLessonAccess(expiredStudent.id, Role.STUDENT, courseA.id, protectedLessonA.id);
    results.push({
      id: 'TC7',
      name: 'Expired Enrollment Block',
      description: 'Student with EXPIRED enrollment attempts to access protected lesson.',
      expectedStatus: 403,
      expectedErrorCode: 'ENROLLMENT_EXPIRED',
      passed: res7.statusCode === 403 && !res7.allowed,
      actualStatus: res7.statusCode,
      actualResponse: res7,
    });

    // ------------------------------------------------------------------------
    // TEST CASE 8: Cancelled enrollment
    // ------------------------------------------------------------------------
    const res8 = await verifyCourseLessonAccess(cancelledStudent.id, Role.STUDENT, courseA.id, protectedLessonA.id);
    results.push({
      id: 'TC8',
      name: 'Cancelled Enrollment Block',
      description: 'Student with CANCELLED enrollment attempts to access protected lesson.',
      expectedStatus: 403,
      expectedErrorCode: 'ENROLLMENT_CANCELLED',
      passed: res8.statusCode === 403 && !res8.allowed,
      actualStatus: res8.statusCode,
      actualResponse: res8,
    });

    const allPassed = results.every((r) => r.passed);

    res.json({
      success: true,
      summary: {
        totalTests: results.length,
        passedCount: results.filter((r) => r.passed).length,
        failedCount: results.filter((r) => !r.passed).length,
        status: allPassed ? 'ALL_PASSED_SECURITY_COMPLIANT' : 'FAILURES_DETECTED',
        timestamp: new Date().toISOString(),
      },
      results,
    });
  } catch (error: any) {
    console.error('Security test suite execution error:', error);
    res.status(500).json({ success: false, message: 'Failed to run security test suite.' });
  }
});

export default router;
