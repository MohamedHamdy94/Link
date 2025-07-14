import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  const { uid, userType, phoneNumber } = await req.json();

  if (!uid || !userType || !phoneNumber) {
    return NextResponse.json(
      { error: 'uid أو userType أو phoneNumber مفقود' },
      { status: 400 }
    );
  }

  try {
    if (!adminAuth) {
      throw new Error('Authentication service is not initialized.');
    }
    await adminAuth.setCustomUserClaims(uid, {
      userType,
      phoneNumber, // ← إضافة رقم الهاتف هنا
    });

    return NextResponse.json({ success: true, requiresTokenRefresh: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'فشل تعيين claims' }, { status: 500 });
  }
}
