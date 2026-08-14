import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/auth.js';
import courseRoutes from './server/routes/courses.js';
import enrollmentRoutes from './server/routes/enrollments.js';
import adminRoutes from './server/routes/admin.js';
import instructorRoutes from './server/routes/instructors.js';
import studentRoutes from './server/routes/student.js';
import mediaRoutes from './server/routes/media.js';
import securityRoutes from './server/routes/security.js';
import { prisma } from './server/db/prisma.js';
import { securityHeadersMiddleware, corsHeadersMiddleware } from './server/middleware/securityHeaders.js';
import { generalApiLimiter } from './server/middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './server/middleware/errorHandler.js';
import { logger } from './server/lib/logger.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global Security & Parsing Middlewares
  app.use(securityHeadersMiddleware);
  app.use(corsHeadersMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());
  app.use('/api', generalApiLimiter);

  // Request logger
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`, { ip: req.ip });
    next();
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/enrollments', enrollmentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/instructors', instructorRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/security', securityRoutes);

  // Centralized API Error Handler
  app.use('/api', errorHandler);

  // SEO Endpoints: robots.txt and sitemap.xml
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /student/
Disallow: /instructor/
Disallow: /api/

Sitemap: /sitemap.xml
`);
  });

  app.get('/sitemap.xml', async (_req, res) => {
    res.type('application/xml');
    try {
      const courses = await prisma.course.findMany({
        where: { isPublished: true, deletedAt: null },
        select: { slug: true, updatedAt: true },
      });

      const categories = await prisma.category.findMany({
        select: { slug: true },
      });

      const staticPages = [
        '',
        '/courses',
        '/categories',
        '/instructors',
        '/pricing',
        '/about',
        '/contact',
        '/faq',
        '/terms',
        '/privacy',
      ];

      const baseUrl = 'https://ednexus.edu';

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      staticPages.forEach((p) => {
        xml += `  <url>\n    <loc>${baseUrl}${p}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${p === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
      });

      categories.forEach((c) => {
        xml += `  <url>\n    <loc>${baseUrl}/categories?id=${c.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      });

      courses.forEach((c) => {
        xml += `  <url>\n    <loc>${baseUrl}/courses/${c.slug}</loc>\n    <lastmod>${c.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      });

      xml += `</urlset>`;
      res.send(xml);
    } catch (err) {
      console.error('Sitemap generation error:', err);
      res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Sitemap error</error>');
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite Middleware for development / Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EdTech Platform Backend] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
