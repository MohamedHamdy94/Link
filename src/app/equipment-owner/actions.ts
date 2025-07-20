'use server';

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { OwnerData, UpdateResult } from '@/lib/interface';
import { isPhoneTaken } from '@/lib/firebase/firestore/utils';
import bcrypt from 'bcryptjs';

const EQUIPMENT_OWNERS_COLLECTION = 'equipmentOwners';

// 🔐 هاش كلمة المرور إن وجدت
const hashPassword = async (plainPassword?: string): Promise<string | null> => {
  if (!plainPassword) return null;
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
};

// ✅ إنشاء مالك معدات جديد
export const createEquipmentOwnerAction = async (
  ownerId: string,
  ownerData: OwnerData
): Promise<UpdateResult<null>> => {
  try {
    if (await isPhoneTaken(ownerData.phoneNumber)) {
      return { success: false, error: 'رقم الجوال مستخدم من قبل' };
    }

    const hashedPassword = await hashPassword(ownerData.password);

    const dataToSave: Partial<OwnerData> & { password?: string; createdAt: string; updatedAt: string; } = {
      name: ownerData.name,
      phoneNumber: ownerData.phoneNumber,
      isVerified: false,
      userType: 'equipmentOwners',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (hashedPassword) {
      dataToSave.password = hashedPassword;
    }

    await setDoc(doc(db, EQUIPMENT_OWNERS_COLLECTION, ownerId), dataToSave);

    return { success: true };
  } catch (error) {
    console.error('Error creating equipment owner:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
    };
  }
};

// ✅ تحديث بيانات مالك معدات
export const updateEquipmentOwnerAction = async (
  ownerId: string,
  data: Partial<OwnerData>
): Promise<UpdateResult<OwnerData>> => {
  try {
    const ownerRef = doc(db, EQUIPMENT_OWNERS_COLLECTION, ownerId);

    const updatePayload: Partial<OwnerData> & { updatedAt: string } = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (data.password) {
      const hashed = await hashPassword(data.password);
      if (hashed) updatePayload.password = hashed;
    } else {
      delete updatePayload.password;
    }

    await updateDoc(ownerRef, updatePayload);

    const updatedDoc = await getDoc(ownerRef);
    if (!updatedDoc.exists()) {
      return { success: false, error: 'المستخدم غير موجود' };
    }

    const updatedData = updatedDoc.data();

    return {
      success: true,
      data: {
        id: updatedDoc.id,
        name: updatedData.name,
        phoneNumber: updatedData.phoneNumber,
        photoUrl: updatedData.photoUrl,
        isVerified: updatedData.isVerified,
        userType: updatedData.userType,
        createdAt: updatedData.createdAt?.toDate() || new Date(),
        updatedAt: updatedData.updatedAt?.toDate() || new Date(),
        equipmentDetails: updatedData.equipmentDetails,
      },
    };
  } catch (error) {
    console.error('Error updating equipment owner:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
};

// ✅ التحقق من كلمة المرور وتحديث البيانات
export const verifyAndUpdateEquipmentOwnerAction = async (
  ownerId: string,
  updates: Partial<OwnerData>,
  currentPassword?: string
): Promise<UpdateResult<OwnerData>> => {
  try {
    if (updates.password && currentPassword) {
      const ownerDoc = await getDoc(doc(db, EQUIPMENT_OWNERS_COLLECTION, ownerId));
      if (!ownerDoc.exists()) return { success: false, error: 'المستخدم غير موجود' };

      const storedData = ownerDoc.data();
      const isMatch = await bcrypt.compare(currentPassword, storedData.password);
      if (!isMatch) {
        return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
      }
    }

    return await updateEquipmentOwnerAction(ownerId, updates);
  } catch (error) {
    console.error('Error verifying and updating:', error);
    return { success: false, error: 'حدث خطأ أثناء التحقق والتحديث' };
  }
};
