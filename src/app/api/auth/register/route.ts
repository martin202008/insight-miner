import { NextRequest, NextResponse } from 'next/server';
import { getUser, createUser } from '@/lib/storage';
import { signToken, setTokenCookie } from '@/lib/auth';
import { generateId } from '@/lib/utils';
import type { User } from '@/types';

export const runtime = 'nodejs';

const DEFAULT_AVATARS = [
  '/avatars/default-1.png',
  '/avatars/default-2.png',
  '/avatars/default-3.png',
  '/avatars/default-4.png',
  '/avatars/default-5.png',
  '/avatars/default-6.png',
];

export async function POST(req: NextRequest) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existing = await getUser(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = Buffer.from(`${email}:${password}`).toString('base64');
    const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];

    const user: User = {
      id: generateId(),
      email,
      passwordHash,
      username,
      avatar: randomAvatar,
      occupation: '',
      plan: 'free',
      createdAt: new Date().toISOString(),
    };

    await createUser(user);
    const token = await signToken({ sub: user.id, email: user.email, plan: user.plan });

    const response = NextResponse.json({
      token,
      user: { id: user.id, email, username, avatar: user.avatar, occupation: '' },
    });
    response.headers.set('Set-Cookie', setTokenCookie(token));

    return response;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}