import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const _secret = process.env.JWT_SECRET;
if (!_secret) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set');
}
const SECRET = new TextEncoder().encode(_secret);

const SALT_ROUNDS = 12;

export interface JWTPayload {
  sub: string;
  email: string;
  plan: 'free' | 'pro';
  [key: string]: unknown;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function setTokenCookie(token: string): string {
  return `token=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

export function clearTokenCookie(): string {
  return 'token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
