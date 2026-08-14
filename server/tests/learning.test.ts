import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/auth.js';
import courseRoutes from '../routes/courses.js';
import studentRoutes from '../routes/student.js';
import mediaRoutes from '../routes/media.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { prisma } from '../db/prisma.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/media', mediaRoutes);
app.use(errorHandler);

describe('Learning & Protected Video Access Integration Test Suite', () => {
  let instructorToken: string;
  let instructorId: string;
  let enrolledStudentToken: string;
  let enrolledStudentId: string;
  let nonEnrolledStudentToken: string;
  let nonEnrolledStudentId: string;
  let categoryId: string;
  let courseId: string;
  let lessonId: string;
  let signedStreamToken: string;

  beforeAll(async () => {
    // 1. Create Category
    const cat = await prisma.category.create({
      data: {
        name: `Learn Cat ${Date.now()}`,
        slug: `learn-cat-${Date.now()}`,
        description: 'Learning test category',
      },
    });
    categoryId = cat.id;

    // 2. Instructor
    const instEmail = `learn_inst_${Date.now()}@ednexus.edu`;
    const instPass = 'Password123!';
    const instRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Learn Instructor',
        email: instEmail,
        password: instPass,
      });
    instructorId = instRes.body.data.user.id;
    await prisma.user.update({
      where: { id: instructorId },
      data: { role: 'INSTRUCTOR', isInstructorApproved: true },
    });
    const instLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: instEmail, password: instPass });
    instructorToken = instLogin.body.data.accessToken;

    // 3. Create Course with 1 section and 1 paid lesson
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'Deep Dive Distributed Systems',
        shortDescription: 'Master microservices and distributed consensus.',
        description: 'In-depth guide to building resilient distributed software.',
        price: 149.99,
        level: 'ADVANCED',
        categoryId,
      });

    courseId = courseRes.body.data.id;

    // Publish course and retrieve created lessonIds
    const fetchedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { isPublished: true, isApproved: true },
      include: {
        sections: {
          include: { lessons: true },
        },
      },
    });
    // Lesson 1 is free preview, Lesson 2 is protected/paid
    lessonId = fetchedCourse.sections[0].lessons[1].id;

    // 4. Register Enrolled Student
    const stud1Res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Enrolled Student',
        email: `enrolled_${Date.now()}@ednexus.edu`,
        password: 'Password123!',
        role: 'STUDENT',
      });
    enrolledStudentToken = stud1Res.body.data.accessToken;
    enrolledStudentId = stud1Res.body.data.user.id;

    // Enroll student
    await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${enrolledStudentToken}`);

    // 5. Register Non-Enrolled Student
    const stud2Res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Non Enrolled Student',
        email: `non_enrolled_${Date.now()}@ednexus.edu`,
        password: 'Password123!',
        role: 'STUDENT',
      });
    nonEnrolledStudentToken = stud2Res.body.data.accessToken;
    nonEnrolledStudentId = stud2Res.body.data.user.id;
  });

  afterAll(async () => {
    if (courseId) {
      await prisma.lessonProgress.deleteMany({
        where: { lesson: { section: { courseId } } },
      });
      await prisma.enrollment.deleteMany({ where: { courseId } });
      await prisma.course.deleteMany({ where: { id: courseId } });
    }
    const userIds = [instructorId, enrolledStudentId, nonEnrolledStudentId].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    if (categoryId) {
      await prisma.category.deleteMany({ where: { id: categoryId } });
    }
  });

  it('1. GET /api/courses/:courseId/lessons/:lessonId - Reject non-enrolled user from paid lesson (403 IDOR/Access Guard)', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/lessons/${lessonId}`)
      .set('Authorization', `Bearer ${nonEnrolledStudentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('NO_ENROLLMENT');
  });

  it('2. GET /api/courses/:courseId/lessons/:lessonId - Allow enrolled student and issue signed video token', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/lessons/${lessonId}`)
      .set('Authorization', `Bearer ${enrolledStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lesson.id).toBe(lessonId);
    expect(res.body.data.lesson.streamUrl).toBeDefined();
    expect(res.body.data.lesson.signedToken).toBeDefined();

    signedStreamToken = res.body.data.lesson.signedToken;
  });

  it('3. GET /api/media/stream - Access stream with valid signed token', async () => {
    const res = await request(app)
      .get(`/api/media/stream?token=${signedStreamToken}`);

    // Expect 200 video stream or 302 redirect
    expect([200, 302]).toContain(res.status);
  });

  it('4. POST /api/courses/:courseId/lessons/:lessonId/progress - Track video progress & trigger course completion', async () => {
    // Fetch all lessons for course
    const courseObj = await prisma.course.findUnique({
      where: { id: courseId },
      include: { sections: { include: { lessons: true } } },
    });
    const allLessons = courseObj!.sections.flatMap((s) => s.lessons);

    // Complete first lesson
    await request(app)
      .post(`/api/courses/${courseId}/lessons/${allLessons[0].id}/progress`)
      .set('Authorization', `Bearer ${enrolledStudentToken}`)
      .send({ watchedSeconds: 600, isCompleted: true });

    // Complete second lesson
    const res = await request(app)
      .post(`/api/courses/${courseId}/lessons/${allLessons[1].id}/progress`)
      .set('Authorization', `Bearer ${enrolledStudentToken}`)
      .send({ watchedSeconds: 1080, isCompleted: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isCompleted).toBe(true);
    expect(res.body.data.isCourseCompleted).toBe(true);
  });
});
