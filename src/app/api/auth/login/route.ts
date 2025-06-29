import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/firebase/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { phoneNumber, password } = await req.json();

  const result = await loginUser(phoneNumber, password);

  if (!result.success || !result.userType) {
    return NextResponse.json({ success: false, error: result.error }, { status: 401 });
  }

  // ✅ إنشاء الكوكيز
  const sessionData = {
    id,
    phoneNumber,
    userType: result.userType,
  };

  cookies().set('session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 أيام
  });

  return NextResponse.json({ success: true, userType: result.userType });
}
