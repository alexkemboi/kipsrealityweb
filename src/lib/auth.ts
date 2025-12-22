import jwt from 'jsonwebtoken'


export function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return secret;
}

export function getJwtRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
        throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }
    return secret;
}

interface AccessTokenPayload {
    userId: string
    email: string
    role: string
    organizationId: string
    organizationUserId: string;
}

interface RefreshTokenPayload {
    userId: string
}

export function generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, getJwtSecret(), {
        expiresIn: '1h',
        issuer: 'rentflow360',
        audience: 'rentflow360-web'
    })
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, getJwtRefreshSecret(), {
        expiresIn: '7d',
        issuer: 'rentflow360',
        audience: 'rentflow360-web'
    })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, getJwtSecret(), {
        issuer: 'rentflow360',
        audience: 'rentflow360-web'
    }) as AccessTokenPayload
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, getJwtRefreshSecret(), {
        issuer: 'rentflow360',
        audience: 'rentflow360-web'
    }) as RefreshTokenPayload
}