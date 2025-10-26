import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets must be defined in environment variables')
}

interface AccessTokenPayload {
    userId: string
    email: string
    role: string
    organizationId: string
}

interface RefreshTokenPayload {
    userId: string
}

export function generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '1h',
        issuer: 'rentflow360',
        audience: 'rentflow360-web'
    })
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: '7d',
        issuer: 'rentflow360',
        audience: 'rentflow360-web'
    })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, JWT_SECRET, {
        issuer: 'rentflow360',
        audience: 'rentflow360-web'
    }) as AccessTokenPayload
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'rentflow360',
        audience: 'rentflow360-web'
    }) as RefreshTokenPayload
}