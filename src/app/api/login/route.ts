import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin'; // تأكد من إعداد admin

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ success: false, error: 'Token مفقود' }, { status: 401 });
  }

  const adminAuth = getAdminAuth();

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const { phoneNumber, userType } = decoded;

    if (!phoneNumber || !userType) {
      return NextResponse.json({ success: false, error: 'البيانات ناقصة في التوكن' }, { status: 400 });
    }

    return NextResponse.json({ success: true, userType });
  } catch (error) {
    console.error('API Login: Token verification failed:', error);
    return NextResponse.json({ success: false, error: 'توكن غير صالح' }, { status: 403 });
  }
}