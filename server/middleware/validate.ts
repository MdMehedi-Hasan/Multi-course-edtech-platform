import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        error.issues.forEach((err) => {
          const path = err.path.join('.') || 'body';
          if (!formattedErrors[path]) formattedErrors[path] = [];
          formattedErrors[path].push(err.message);
        });
        return res.status(400).json({
          message: 'Input validation failed',
          errors: formattedErrors,
        });
      }
      return res.status(400).json({ message: 'Invalid payload' });
    }
  };
}
