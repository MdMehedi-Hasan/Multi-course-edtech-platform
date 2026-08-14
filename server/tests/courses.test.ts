import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/auth.js';
import courseRoutes from '../routes/courses.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { prisma } from '../db/prisma.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use(errorHandler);

describe('Courses Integration Test Suite', () => {
  let instructorToken: string;
  let instructorId: string;
  let studentToken: string;
  let studentId: string;
  let categoryId: string;
  let createdCourseId: string;

  const testInstructor = {
    name: 'Instructor Test User',
    email: `instructor_course_${Date.now()}@ednexus.edu`,
    password: 'Password123!',
    role: 'INSTRUCTOR',
  };

  const testStudent = {
    name: 'Student Course User',
    email: `student_course_${Date.now()}@ednexus.edu`,
    password: 'Password123!',
    role: 'STUDENT',
  };

  beforeAll(async () => {
    // 1. Create category
    const cat = await prisma.category.create({
      data: {
        name: `Test Cat ${Date.now()}`,
        slug: `test-cat-${Date.now()}`,
        description: 'Test category for courses',
      },
    });
    categoryId = cat.id;

    // 2. Register Instructor
    const instRes = await request(app)
      .post('/api/auth/register')
      .send(testInstructor);
    instructorId = instRes.body.data.user.id;

    // Promote & approve instructor for creation
    await prisma.user.update({
      where: { id: instructorId },
      data: { role: 'INSTRUCTOR', isInstructorApproved: true },
    });

    const instLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: testInstructor.email, password: testInstructor.password });
    instructorToken = instLogin.body.data.accessToken;

    // 3. Register Student
    const studRes = await request(app)
      .post('/api/auth/register')
      .send(testStudent);
    studentToken = studRes.body.data.accessToken;
    studentId = studRes.body.data.user.id;
  });

  afterAll(async () => {
    // Clean up created resources
    if (createdCourseId) {
      await prisma.lessonProgress.deleteMany({
        where: { lesson: { section: { courseId: createdCourseId } } },
      });
      await prisma.enrollment.deleteMany({ where: { courseId: createdCourseId } });
      await prisma.course.deleteMany({ where: { id: createdCourseId } });
    }
    if (instructorId) {
      await prisma.refreshToken.deleteMany({ where: { userId: instructorId } });
      await prisma.user.deleteMany({ where: { id: instructorId } });
    }
    if (studentId) {
      await prisma.refreshToken.deleteMany({ where: { userId: studentId } });
      await prisma.user.deleteMany({ where: { id: studentId } });
    }
    if (categoryId) {
      await prisma.category.deleteMany({ where: { id: categoryId } });
    }
  });

  it('1. POST /api/courses - Should allow instructor to create a course', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'Mastering Modern Full-Stack Development',
        shortDescription: 'Learn full-stack web dev with TypeScript and React.',
        description: 'Comprehensive course covering full-stack concepts, security, and state management.',
        price: 99.99,
        level: 'INTERMEDIATE',
        categoryId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Mastering Modern Full-Stack Development');
    createdCourseId = res.body.data.id;
  });

  it('2. GET /api/courses - Should list published/browsable courses', async () => {
    // Make course published for catalog visibility
    await prisma.course.update({
      where: { id: createdCourseId },
      data: { isPublished: true, isApproved: true },
    });

    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.find((c: any) => c.id === createdCourseId);
    expect(found).toBeDefined();
  });

  it('3. GET /api/courses/:id - Should fetch public metadata & curriculum outline', async () => {
    const res = await request(app).get(`/api/courses/${createdCourseId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdCourseId);
    expect(res.body.data.sections).toBeDefined();
  });

  it('4. POST /api/courses/:id/enroll - Should allow student to enroll in course', async () => {
    const res = await request(app)
      .post(`/api/courses/${createdCourseId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.courseId).toBe(createdCourseId);
    expect(res.body.data.userId).toBe(studentId);
  });

  it('5. POST /api/courses/:id/enroll - Should reject double enrollment with friendly response', async () => {
    const res = await request(app)
      .post(`/api/courses/${createdCourseId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Already enrolled');
  });
});
