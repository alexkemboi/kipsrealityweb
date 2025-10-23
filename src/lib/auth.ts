import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
    userId: string
    email: string
    role: string
}

export function generateJWT(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyJWT(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
}