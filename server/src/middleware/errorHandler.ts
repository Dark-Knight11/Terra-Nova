import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

// Custom error classes
export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    public errors: any[];

    constructor(message: string, errors: any[] = []) {
        super(message, 400);
        this.errors = errors;
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication failed') {
        super(message, 401);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Resource already exists') {
        super(message, 409);
    }
}

// Global error handler middleware
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Log the error
    Logger.error(err.message, {
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // Operational errors (expected errors)
    if (err instanceof AppError && err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err instanceof ValidationError && { errors: err.errors })
        });
    }

    // Programming or unknown errors
    const statusCode = 'statusCode' in err ? (err as any).statusCode : 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    return res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
