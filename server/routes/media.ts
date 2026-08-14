import { Router, Request, Response } from 'express';
import http from 'http';
import https from 'https';
import { verifySignedVideoToken } from '../lib/signedUrl.js';

const router = Router();

// GET /api/media/stream?token=...
router.get('/stream', (req: Request, res: Response): void => {
  const token = req.query.token as string;

  if (!token) {
    res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Missing video stream token.' });
    return;
  }

  const { valid, payload, error } = verifySignedVideoToken(token);

  if (!valid || !payload) {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: `Invalid or expired video stream token: ${error || 'Access denied'}.`,
    });
    return;
  }

  // Set anti-hotlinking headers
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const rawUrl = payload.rawVideoUrl;

  // If rawUrl is an external HTTP/HTTPS video URL (like sample MP4 bucket), stream or redirect securely
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    const client = rawUrl.startsWith('https://') ? https : http;

    client.get(rawUrl, (videoStream) => {
      res.setHeader('Content-Type', videoStream.headers['content-type'] || 'video/mp4');
      if (videoStream.headers['content-length']) {
        res.setHeader('Content-Length', videoStream.headers['content-length']);
      }
      if (videoStream.headers['accept-ranges']) {
        res.setHeader('Accept-Ranges', videoStream.headers['accept-ranges']);
      }

      videoStream.pipe(res);
    }).on('error', (err) => {
      console.error('Video stream error:', err);
      if (!res.headersSent) {
        res.status(502).json({ success: false, message: 'Failed to retrieve media stream.' });
      }
    });
  } else {
    // Local or mock CDN path
    res.redirect(rawUrl);
  }
});

export default router;
