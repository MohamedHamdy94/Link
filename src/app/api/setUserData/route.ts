import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  const { uid, userType, phoneNumber } = await req.json();

  if (!uid || !userType || !phoneNumber) {
    return NextResponse.json(
      { error: 'uid أو userType أو phoneNumber مفقود' },
      { status: 400 }
    );
  }

  try {
    const adminAuth = getAdminAuth();

   await adminAuth.setCustomUserClaims(uid, {
  userType,
  phoneNumber,
  });


    return NextResponse.json({ success: true, requiresTokenRefresh: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'فشل تعيين claims' }, { status: 500 });
  }
}
