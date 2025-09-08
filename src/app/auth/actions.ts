'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { getAdminAuth } from '@/lib/firebase/admin';

type UserType = 'drivers' | 'equipmentOwners' | 'admins';




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
    return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
  }
};

export const checkUserExistsByPhone = async (phoneNumber: string): Promise<{ exists: boolean }> => {
  try {
    const userTypes: UserType[] = ['drivers', 'equipmentOwners', 'admins'];
    for (const userType of userTypes) {
      const userDoc = await getDoc(doc(db, userType, phoneNumber));
      if (userDoc.exists()) {
        return { exists: true };
      }
    }
    return { exists: false };
  } catch (error) {
    console.error('Error checking user existence:', error);
    return { exists: false }; // Fail safely
  }
};

export const resetPasswordAction = async (phoneNumber: string, newPassword: string): Promise<{ success: boolean; error?: string; }> => {
  try {
    const userTypes: UserType[] = ['drivers', 'equipmentOwners', 'admins'];
    let userDoc = null;
    let userType: UserType | null = null;

    for (const type of userTypes) {
      const docRef = doc(db, type, phoneNumber);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        userDoc = snapshot;
        userType = type;
        break;
      }
    }

    if (!userDoc || !userType) {
      return { success: false, error: 'المستخدم غير موجود.' };
    }

    const userData = userDoc.data();
    const uid = userData.uid;

    if (!uid) {
      return { success: false, error: 'UID للمستخدم غير موجود.' };
    }

    // 1. Update password in Firebase Auth
    await getAdminAuth().updateUser(uid, { password: newPassword });

    // 2. Update password hash in Firestore
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateDoc(userDoc.ref, { password: hashedPassword, updatedAt: new Date().toISOString() });

    return { success: true };

  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور.' };
  }
};