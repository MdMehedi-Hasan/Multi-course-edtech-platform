import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
  error?: string;
  validationErrors?: Array<{ field: string; message: string }>;
}

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public validationErrors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'SERVER_ERROR',
    validationErrors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.validationErrors = validationErrors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
  pagination?: PaginationMeta
): void {
  const responseBody: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
  };
  res.status(statusCode).json(responseBody);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  errorCode: string = 'SERVER_ERROR',
  validationErrors?: Array<{ field: string; message: string }>
): void {
  const responseBody: ApiResponse = {
    success: false,
    error: errorCode,
    message,
    ...(validationErrors && { validationErrors }),
  };
  res.status(statusCode).json(responseBody);
}

export function calculatePagination(page: number, limit: number, totalItems: number): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentPage = Math.max(1, page);

  return {
    page: currentPage,
    limit,
    totalItems,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}
