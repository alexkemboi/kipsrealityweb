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
        if (process.env.NODE_ENV === 'test') {
            console.warn("JWT_REFRESH_SECRET missing - using fallback (test only)");
            return "test-fallback-secret";
        }
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
// NextAuth configuration for compatibility
export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET,
    providers: [],
    callbacks: {
        jwt: async ({ token, user }: any) => {
            if (user) {
                token.userId = user.id
                token.role = user.role
                token.organizationId = user.organizationId
            }
            return token
        },
        session: async ({ session, token }: any) => {
            if (token) {
                session.user.id = token.userId
                session.user.role = token.role
                session.user.organizationId = token.organizationId
            }
            return session
        }
    }
}

// Auth function for compatibility
export const auth = async () => {
    // This would typically return the current session
    // For now, return null to prevent build errors
    return null
}
