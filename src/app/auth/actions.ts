"use server";

import { loginUser, logout } from '@/lib/firebase/auth';

import { createDriver, createEquipmentOwner, updateDriver, verifyAndUpdateEquipmentOwner } from '@/lib/firebase/firestore';
import { getUserProfileById } from '@/lib/firebase/firestore/utils';
import { Driver, OwnerData } from '@/lib/interface';
import { auth } from '@/lib/firebase/config'; // Import auth to get current user
import { adminAuth } from '@/lib/firebase/admin';

export async function login(prevState: string | undefined, formData: FormData) {
  try {
    await loginUser(formData.get('email') as string, formData.get('password') as string);
    return { success: true, message: 'Login successful' };
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'auth/invalid-credential':
          return { success: false, message: 'Invalid credentials.' };
        default:
          return { success: false, message: 'Something went wrong.' };
      }
    }
    throw error;
  }
}

export async function handleSignOut() {
  try {
    await logout();
    return { success: true, message: 'Signed out successfully' };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, message: 'Failed to sign out' };
  }
}

export async function setCustomClaimsForUser(uid: string, phoneNumber: string, userType: string) {
  try {
    if (!adminAuth) {
      throw new Error('Firebase Admin SDK is not initialized.');
    }
    await adminAuth.setCustomUserClaims(uid, { phoneNumber, userType });
    console.log(`Custom claims set for user ${uid}: phoneNumber=${phoneNumber}, userType=${userType}`);
    return { success: true };
  } catch (error) {
    console.error('Error setting custom claims:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to set custom claims' };
  }
}

export async function registerDriver(prevState: string | undefined, formData: FormData) {
  try {
    const driverData: Driver = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      userType: 'drivers',
      isVerified: false,
    };
    const result = await createDriver(driverData.email, driverData);
    if (!result.success) {
      return { success: false, message: result.error || 'Failed to register driver' };
    }
    return { success: true, message: 'Driver registered successfully' };
  } catch (error) {
    console.error('Error registering driver:', error);
    return { success: false, message: 'Something went wrong during driver registration.' };
  }
}

export async function registerEquipmentOwner(prevState: string | undefined, formData: FormData) {
  try {
    const ownerData: OwnerData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      userType: 'equipmentOwners',
      isVerified: false,
    };
    const result = await createEquipmentOwner(ownerData.email, ownerData);
    if (!result.success) {
      return { success: false, message: result.error || 'Failed to register equipment owner' };
    }
    return { success: true, message: 'Equipment owner registered successfully' };
  } catch (error) {
    console.error('Error registering equipment owner:', error);
    return { success: false, message: 'Something went wrong during equipment owner registration.' };
  }
}

export async function updatePassword(prevState: { message: string; success: boolean }, uid: string, userType: 'drivers' | 'equipmentOwners', formData: FormData) {
  const oldPassword = formData.get('oldPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmNewPassword = formData.get('confirmNewPassword') as string;

  if (!oldPassword || !newPassword || !confirmNewPassword) {
    return { success: false, message: 'جميع الحقول مطلوبة.' };
  }

  if (newPassword !== confirmNewPassword) {
    return { success: false, message: 'كلمة المرور الجديدة وتأكيدها غير متطابقين.' };
  }

  if (newPassword.length < 6) { // Example: minimum password length
    return { success: false, message: 'يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل.' };
  }

  try {

    if (!adminAuth) {
      throw new Error('Firebase Admin SDK is not initialized in updatePassword.');
    }

    const userRecord = await adminAuth.getUser(uid);
    const phoneNumberFromAuth = userRecord.customClaims?.phoneNumber as string;

    if (!phoneNumberFromAuth) {
      return { success: false, message: 'رقم الهاتف غير موجود في المطالبات المخصصة لسجل المستخدم.' };
    }

    const userProfileResult = await getUserProfileById(phoneNumberFromAuth, userType);

    if (!userProfileResult.success || !userProfileResult.data) {
      return { success: false, message: userProfileResult.error || 'لم يتم العثور على ملف تعريف المستخدم.' };
    }

    const userId = phoneNumberFromAuth; // Use phoneNumber as the ID for Firestore operations

    let result;
    if (userType === 'drivers') { // Use the passed userType
      result = await updateDriver(userId, { password: newPassword } as Driver, oldPassword, true);
    } else if (userType === 'equipmentOwners') { // Use the passed userType
      result = await verifyAndUpdateEquipmentOwner(userId, { password: newPassword } as OwnerData, oldPassword);
    } else {
      return { success: false, message: 'نوع المستخدم غير مدعوم لتحديث كلمة المرور.' };
    }

    if (result.success) {
      // تحديث كلمة المرور في Firebase Authentication
      try {
        await adminAuth.updateUser(uid, { password: newPassword });
      } catch (authError) {
        console.error('Error updating Firebase Auth password:', authError);
        return { success: false, message: 'فشل تحديث كلمة المرور في المصادقة.' };
      }
      return { success: true, message: 'تم تحديث كلمة المرور بنجاح.' };
    } else {
      return { success: false, message: result.error || 'فشل تحديث كلمة المرور.' };
    }
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, message: 'حدث خطأ غير متوقع أثناء تحديث كلمة المرور.' };
  }
}
