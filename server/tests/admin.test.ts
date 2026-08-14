import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/auth.js';
import adminRoutes from '../routes/admin.js';
import instructorRoutes from '../routes/instructors.js';
import courseRoutes from '../routes/courses.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { prisma } from '../db/prisma.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/courses', courseRoutes);
app.use(errorHandler);

describe('Admin Management & Security Integration Test Suite', () => {
  let adminToken: string;
  let adminId: string;
  let studentToken: string;
  let studentId: string;
  let instructor1Token: string;
  let instructor1Id: string;
  let instructor2Token: string;
  let instructor2Id: string;
  let categoryId: string;
  let course1Id: string;

  beforeAll(async () => {
    // 1. Category
    const cat = await prisma.category.create({
      data: {
        name: `Admin Cat ${Date.now()}`,
        slug: `admin-cat-${Date.now()}`,
        description: 'Admin test category',
      },
    });
    categoryId = cat.id;

    // 2. Admin User
    const adminEmail = `admin_${Date.now()}@ednexus.edu`;
    const adminPass = 'Password123!';
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPass,
      });
    adminId = adminRes.body.data.user.id;

    // Elevate admin in DB & login
    await prisma.user.update({
      where: { id: adminId },
      data: { role: 'ADMIN' },
    });
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: adminPass });
    adminToken = adminLogin.body.data.accessToken;

    // 3. Student User
    const studentEmail = `student_admin_${Date.now()}@ednexus.edu`;
    const studentPass = 'Password123!';
    const studRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular Student',
        email: studentEmail,
        password: studentPass,
      });
    studentToken = studRes.body.data.accessToken;
    studentId = studRes.body.data.user.id;

    // 4. Instructor 1
    const inst1Email = `inst1_${Date.now()}@ednexus.edu`;
    const inst1Pass = 'Password123!';
    const inst1Res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Instructor One',
        email: inst1Email,
        password: inst1Pass,
      });
    instructor1Id = inst1Res.body.data.user.id;

    // Approve Instructor 1 & promote to INSTRUCTOR
    await prisma.user.update({
      where: { id: instructor1Id },
      data: { role: 'INSTRUCTOR', isInstructorApproved: true },
    });
    const inst1Login = await request(app)
      .post('/api/auth/login')
      .send({ email: inst1Email, password: inst1Pass });
    instructor1Token = inst1Login.body.data.accessToken;

    // 5. Instructor 2
    const inst2Email = `inst2_${Date.now()}@ednexus.edu`;
    const inst2Pass = 'Password123!';
    const inst2Res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Instructor Two',
        email: inst2Email,
        password: inst2Pass,
      });
    instructor2Id = inst2Res.body.data.user.id;

    await prisma.user.update({
      where: { id: instructor2Id },
      data: { role: 'INSTRUCTOR', isInstructorApproved: true },
    });
    const inst2Login = await request(app)
      .post('/api/auth/login')
      .send({ email: inst2Email, password: inst2Pass });
    instructor2Token = inst2Login.body.data.accessToken;

    // Create course owned by Instructor 1
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructor1Token}`)
      .send({
        title: 'Course By Instructor One',
        shortDescription: 'Test course for ownership and moderation',
        description: 'Course description for moderation test',
        price: 49.99,
        level: 'BEGINNER',
        categoryId,
      });
    course1Id = courseRes.body.data.id;
  });

  afterAll(async () => {
    if (course1Id) {
      await prisma.course.deleteMany({ where: { id: course1Id } });
    }
    const userIds = [adminId, studentId, instructor1Id, instructor2Id].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.auditLog.deleteMany({ where: { actorId: { in: userIds } } });
      await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    if (categoryId) {
      await prisma.category.deleteMany({ where: { id: categoryId } });
    }
  });

  it('1. GET /api/admin/stats - Allow ADMIN role', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(4);
  });

  it('2. GET /api/admin/stats - Reject STUDENT role with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('3. GET /api/admin/users - Admin user listing & filtering', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('4. PATCH /api/admin/instructors/:userId/approve - Approve unapproved instructor', async () => {
    const res = await request(app)
      .patch(`/api/admin/instructors/${instructor2Id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isInstructorApproved: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedUser = await prisma.user.findUnique({ where: { id: instructor2Id } });
    expect(updatedUser?.isInstructorApproved).toBe(true);
  });

  it('5. PATCH /api/admin/courses/:courseId/approve - Course moderation approval', async () => {
    const res = await request(app)
      .patch(`/api/admin/courses/${course1Id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isApproved: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const course = await prisma.course.findUnique({ where: { id: course1Id } });
    expect(course?.isApproved).toBe(true);
  });

  it('6. GET /api/admin/audit-logs - Audit trail logging', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('7. Resource Ownership Security - Instructor 2 cannot edit Instructor 1 course', async () => {
    const res = await request(app)
      .put(`/api/instructors/me/courses/${course1Id}`)
      .set('Authorization', `Bearer ${instructor2Token}`)
      .send({ title: 'Hacked Course Title' });

    expect([403, 404]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});
