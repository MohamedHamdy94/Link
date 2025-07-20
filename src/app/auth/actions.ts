'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { getAdminAuth } from '@/lib/firebase/admin';

type UserType = 'drivers' | 'equipmentOwners' | 'admins';

interface AuthResponse {
  success: boolean;
  userType?: UserType;
  error?: string;
}

export const loginUserAction = async (phoneNumber: string, password: string): Promise<AuthResponse> => {
  try {
    const userTypes: UserType[] = ['drivers', 'equipmentOwners', 'admins'];
    
    for (const userType of userTypes) {
      const snapshot = await getDoc(doc(db, userType, phoneNumber));
      
      if (snapshot.exists()) {
        const userData = snapshot.data();
        // Ensure password exists before comparing
        if (userData.password) {
          const isPasswordValid = await bcrypt.compare(password, userData.password);
          if (isPasswordValid) {
            // IMPORTANT: Do not manage session here. 
            // The login logic in the client will handle setting the session after a successful response.
            return { success: true, userType };
          }
        }
      }
    }

    return { success: false, error: 'رقم الهاتف أو كلمة المرور غير صحيحة' };
  } catch (error) {
    console.error('Login action error:', error);
    return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
  }
};

interface ClaimsResult {
  success: boolean;
  error?: string;
  message?: string; // Added message property
}

export const setCustomClaimsForUser = async (uid: string, phoneNumber: string, userType: UserType): Promise<ClaimsResult> => {
  try {
    await getAdminAuth().setCustomUserClaims(uid, { userType, phoneNumber });
    return { success: true };
  } catch (error) {
    console.error('Error setting custom claims:', error);
    return { success: false, error: 'فشل في تعيين المطالبات المخصصة' };
  }
};

export const updatePasswordAction = async (
  uid: string, // إضافة uid مرة أخرى
  phoneNumber: string,
  userType: UserType,
  oldPassword: string,
  newPassword: string
): Promise<ClaimsResult> => {
  try {
    // 1. Get user's current data from Firestore to verify old password
    const userDocRef = doc(db, userType, phoneNumber); // استخدام phoneNumber لجلب المستند من Firestore
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return { success: false, error: 'المستخدم غير موجود' };
    }

    const userData = userDocSnap.data();
    if (!userData || !userData.password) {
      return { success: false, error: 'كلمة المرور القديمة غير موجودة في قاعدة البيانات' };
    }

    // 2. Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, userData.password);
    if (!isOldPasswordValid) {
      return { success: false, error: 'كلمة المرور القديمة غير صحيحة' };
    }

    // 3. Update password in Firebase Auth
    await getAdminAuth().updateUser(uid, { password: newPassword });

    // 4. Update password in Firestore (if stored there)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateDoc(userDocRef, { password: hashedPassword, updatedAt: new Date() });

    return { success: true, message: 'تم تحديث كلمة المرور بنجاح' };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, error: 'فشل في تحديث كلمة المرور' };
  }
};