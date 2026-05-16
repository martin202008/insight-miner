import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/storage';
import { signToken, setTokenCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const user = await getUser(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordHash = Buffer.from(`${email}:${password}`).toString('base64');
    if (user.passwordHash !== passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signToken({ sub: user.id, email: user.email, plan: user.plan });

    const response = NextResponse.json({
      token,
      user: { id: user.id, email, username: user.username, avatar: user.avatar, occupation: user.occupation },
    });
    response.headers.set('Set-Cookie', setTokenCookie(token));

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}