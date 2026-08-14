import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../lib/apiResponse.js';
import { logger } from '../lib/logger.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const ip = req.headers['x-forwarded-for'] as string || req.ip;
  const userId = (req as any).user?.userId;

  // Handle expected AppErrors
  if (err instanceof AppError) {
    logger.warn(`Handled Application Error [${err.errorCode}]: ${err.message}`, {
      userId,
      ip,
      method: req.method,
      path: req.originalUrl,
      statusCode: err.statusCode,
    });

    sendError(
      res,
      err.message,
      err.statusCode,
      err.errorCode,
      err.validationErrors
    );
    return;
  }

  // Handle Syntax Errors (e.g. malformed JSON payloads)
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    logger.security('Malformed JSON payload received', {
      ip,
      method: req.method,
      path: req.originalUrl,
    });

    sendError(res, 'Malformed JSON payload in request body.', 400, 'BAD_REQUEST');
    return;
  }

  // Handle unexpected internal server errors
  logger.error('Unhandled System Exception', err, {
    userId,
    ip,
    method: req.method,
    path: req.originalUrl,
  });

  // Never expose raw internal database stack traces or operational secrets to clients
  sendError(
    res,
    'An unexpected internal server error occurred. Please try again later.',
    500,
    'INTERNAL_SERVER_ERROR'
  );
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    `Route '${req.method} ${req.originalUrl}' not found.`,
    404,
    'NOT_FOUND'
  );
}
