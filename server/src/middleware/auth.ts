import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthenticationError, AuthorizationError } from './errorHandler';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: string;
            };
        }
    }
}

// Authentic JWT token middleware
export const authenticateToken = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            throw new AuthenticationError('No token provided');
        }

        const payload = verifyToken(token);

        if (payload.type !== 'access') {
            throw new AuthenticationError('Invalid token type');
        }

        // Attach user info to request
        req.user = {
            userId: payload.userId,
            role: payload.role
        };

        next();
    } catch (error) {
        next(new AuthenticationError('Invalid or expired token'));
    }
};

// Require specific role(s) middleware
export const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AuthenticationError('User not authenticated'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new AuthorizationError(
                    `Access denied. Required role(s): ${allowedRoles.join(', ')}`
                )
            );
        }

        next();
    };
};

// Optional authentication - attaches user if token is present but doesn't fail if absent
export const optionalAuth = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const payload = verifyToken(token);
            if (payload.type === 'access') {
                req.user = {
                    userId: payload.userId,
                    role: payload.role
                };
            }
        }
    } catch (error) {
        // Silently continue without authentication
    }

    next();
};
