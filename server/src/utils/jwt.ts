import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
    userId: string;
    role: string;
    type: 'access' | 'refresh';
}

export const generateAccessToken = (userId: string, role: string): string => {
    return jwt.sign(
        { userId, role, type: 'access' } as TokenPayload,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );
};

export const generateRefreshToken = (userId: string): string => {
    return jwt.sign(
        { userId, type: 'refresh' } as TokenPayload,
        JWT_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    );
};

export const verifyToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

export const decodeToken = (token: string): TokenPayload | null => {
    try {
        return jwt.decode(token) as TokenPayload;
    } catch (error) {
        return null;
    }
};
