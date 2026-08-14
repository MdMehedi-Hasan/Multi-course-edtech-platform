import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/auth.js';
import adminRoutes from '../routes/admin.js';
import courseRoutes from '../routes/courses.js';
import { prisma } from '../db/prisma.js';
import { errorHandler } from '../middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use(errorHandler);

describe('Phase 2 Authentication & Role-Based Authorization Integration Test Suite', () => {
  const testStudent = {
    name: 'Test Student',
    email: `teststudent_${Date.now()}@ednexus.edu`,
    password: 'Password123!',
    role: 'STUDENT',
  };

  const testAdmin = {
    name: 'Test Admin',
    email: `testadmin_${Date.now()}@ednexus.edu`,
    password: 'Password123!',
    role: 'ADMIN',
  };

  let studentAccessToken: string;
  let studentRefreshToken: string;
  let adminAccessToken: string;

  beforeAll(async () => {
    // Ensure clean state for test users
  });

  afterAll(async () => {
    // Cleanup test users
    await prisma.user.deleteMany({
      where: {
        email: { in: [testStudent.email, testAdmin.email] },
      },
    });
  });

  it('1. POST /api/auth/register - Should successfully register a new Student', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testStudent);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testStudent.email.toLowerCase());
    expect(res.body.data.user.role).toBe('STUDENT');
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Never expose password hash!
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    studentAccessToken = res.body.data.accessToken;
    studentRefreshToken = res.body.data.refreshToken;
  });

  it('2. POST /api/auth/register - Should reject duplicate email registration with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testStudent);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('USER_EXISTS');
  });

  it('3. POST /api/auth/login - Should reject invalid password credentials with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testStudent.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('INVALID_CREDENTIALS');
  });

  it('4. POST /api/auth/login - Should successfully authenticate Student with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testStudent.email, password: testStudent.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.role).toBe('STUDENT');

    studentAccessToken = res.body.data.accessToken;
    studentRefreshToken = res.body.data.refreshToken;
  });

  it('5. GET /api/auth/me - Should return current user profile with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testStudent.email.toLowerCase());
  });

  it('6. GET /api/auth/me - Should reject unauthenticated request without token with 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('UNAUTHORIZED');
  });

  it('7. GET /api/admin/stats - Should block Student from accessing Admin endpoints with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${studentAccessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('FORBIDDEN');
  });

  it('8. ADMIN Access - Promoted Admin should access Admin stats endpoint', async () => {
    // Register user (which creates STUDENT)
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(testAdmin);

    expect(regRes.status).toBe(201);
    expect(regRes.body.data.user.role).toBe('STUDENT'); // Public registration is strictly STUDENT

    // Upgrade user to ADMIN directly in database (authoritative source)
    await prisma.user.update({
      where: { email: testAdmin.email.toLowerCase() },
      data: { role: 'ADMIN' },
    });

    // Login as upgraded Admin to get fresh token with ADMIN role
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testAdmin.email, password: testAdmin.password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.user.role).toBe('ADMIN');
    adminAccessToken = loginRes.body.data.accessToken;

    const statsRes = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.success).toBe(true);
    expect(statsRes.body.data.totalUsers).toBeGreaterThan(0);
  });

  it('9. POST /api/auth/google - Should authenticate Google signup as STUDENT by default', async () => {
    const googleEmail = `googlestudent_${Date.now()}@gmail.com`;
    const googleRes = await request(app)
      .post('/api/auth/google')
      .send({
        email: googleEmail,
        name: 'Google Student',
      });

    expect(googleRes.status).toBe(201);
    expect(googleRes.body.success).toBe(true);
    expect(googleRes.body.data.user.role).toBe('STUDENT');
    expect(googleRes.body.data.accessToken).toBeDefined();

    // Subsequent login for existing Google account should return 200
    const googleLoginRes = await request(app)
      .post('/api/auth/google')
      .send({
        email: googleEmail,
        name: 'Google Student',
      });

    expect(googleLoginRes.status).toBe(200);
    expect(googleLoginRes.body.data.user.role).toBe('STUDENT');

    // Clean up
    await prisma.user.delete({ where: { email: googleEmail.toLowerCase() } });
  });

  it('10. POST /api/auth/instructor-application - Should allow student to submit an instructor application', async () => {
    const appRes = await request(app)
      .post('/api/auth/instructor-application')
      .set('Authorization', `Bearer ${studentAccessToken}`)
      .send({
        name: 'Test Student',
        email: testStudent.email,
        bio: 'Experienced full stack educator and mentor.',
        expertise: 'Distributed Systems & TypeScript',
        experienceYears: 5,
        headline: 'Staff Software Architect',
        message: 'I would like to teach advanced backend scalability.',
      });

    expect(appRes.status).toBe(201);
    expect(appRes.body.success).toBe(true);
    expect(appRes.body.data.status).toBe('PENDING');

    const meAppRes = await request(app)
      .get('/api/auth/instructor-application/me')
      .set('Authorization', `Bearer ${studentAccessToken}`);

    expect(meAppRes.status).toBe(200);
    expect(meAppRes.body.success).toBe(true);
    expect(meAppRes.body.data.status).toBe('PENDING');
  });

  it('11. POST /api/auth/refresh - Should issue new access & refresh tokens on refresh token rotation', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: studentRefreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.refreshToken).not.toBe(studentRefreshToken); // Rotated token
  });

  it('12. POST /api/auth/logout - Should successfully revoke refresh token and log out', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken: studentRefreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
