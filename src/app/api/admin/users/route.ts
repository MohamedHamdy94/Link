
import { NextResponse } from 'next/server';
import { getAllUsers, updateUserVerificationStatus } from '@/lib/firebase/admin';

export async function GET() {
  const result = await getAllUsers();
  if (result.success) {
    return NextResponse.json(result.data);
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userType, userId, isVerified } = await request.json();
  const result = await updateUserVerificationStatus(userType, userId, isVerified);
  if (result.success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
}
