'use server';

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Driver } from '@/lib/interface';
import { isPhoneTaken } from '@/lib/firebase/firestore/utils';
import bcrypt from 'bcryptjs';

const DRIVERS_COLLECTION = 'drivers';

export const createDriverAction = async (driverId: string, driverData: Driver) => {
  try {
    const hashedPassword = driverData.password ? await bcrypt.hash(driverData.password, 10) : null;
    
    if (await isPhoneTaken(driverData.phoneNumber)) {
      return { success: false, error: 'رقم الجوال مستخدم من قبل' };
    }

    await setDoc(doc(db, DRIVERS_COLLECTION, driverId), {
      ...driverData,
      password: hashedPassword,
      isVerified: false,
      userType: 'drivers',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating driver:', error);
    return { success: false, error: 'حدث خطأ أثناء إنشاء حساب السائق' };
  }
};

export const updateDriverAction = async (
  driverId: string,
  driverData: Partial<Driver>,
  currentPassword?: string,
  isChangingPassword?: boolean
) => {
  try {
    const driverRef = doc(db, DRIVERS_COLLECTION, driverId);
    const driverDoc = await getDoc(driverRef);
    if (!driverDoc.exists()) {
      throw new Error('السائق غير موجود');
    }

    const currentDriverData = driverDoc.data() as Driver;

    if (isChangingPassword && currentDriverData.password) {
      if (!currentPassword) {
        throw new Error('يجب إدخال كلمة المرور الحالية');
      }
      const isMatch = await bcrypt.compare(currentPassword, currentDriverData.password);
      if (!isMatch) {
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }
    }

    const updatePayload: Partial<Driver> & { updatedAt: string } = {
      ...driverData,
      updatedAt: new Date().toISOString(), // تحويل إلى string
    };

    if (driverData.password) {
      updatePayload.password = await bcrypt.hash(driverData.password, 10);
    } else {
      delete updatePayload.password;
    }

    await updateDoc(driverRef, updatePayload);
    
    const updatedDoc = await getDoc(driverRef);
    return { success: true, data: updatedDoc.data() };

  } catch (error) {
    console.error('Error updating driver:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    };
  }
};
