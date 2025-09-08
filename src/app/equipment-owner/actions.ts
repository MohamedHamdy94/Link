'use server';

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { OwnerData, UpdateResult } from '@/lib/interface';
import { isPhoneTaken } from '@/lib/firebase/firestore/utils';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { getAdminAuth } from '@/lib/firebase/admin';
import { deleteEquipment, updateEquipmentOwnerDetailsInEquipments } from '@/lib/firebase/firestore/equipments';

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
  console.log('createEquipmentOwnerAction: ownerId', ownerId);
  console.log('createEquipmentOwnerAction: ownerData', ownerData);
  try {
    const isTaken = await isPhoneTaken(ownerData.phoneNumber);
    console.log('createEquipmentOwnerAction: isPhoneTaken result', isTaken);
    if (isTaken) {
      return { success: false, error: 'رقم الجوال مستخدم من قبل' };
    }

    const hashedPassword = await hashPassword(ownerData.password);

    const dataToSave = {
      ...ownerData,
      password: hashedPassword,
      isVerified: true,
      userType: 'equipmentOwners',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('createEquipmentOwnerAction: Saving data', dataToSave);
    await setDoc(doc(db, EQUIPMENT_OWNERS_COLLECTION, ownerId), dataToSave);
    console.log('createEquipmentOwnerAction: setDoc successful');

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
    const ownerDoc = await getDoc(ownerRef); // Get the document first

    if (!ownerDoc.exists()) { // Check if it exists
      return { success: false, error: 'بيانات المالك غير موجودة. يرجى إكمال ملفك الشخصي.' };
    }

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

    // Propagate owner name and photo changes to their equipment
        const detailsToPropagate: { ownerName?: string; ownerPhotoUrl?: string; ownerAddress?: string } = {};
    if (data.name) {
      detailsToPropagate.ownerName = data.name;
    }
    if (data.photoUrl) {
      detailsToPropagate.ownerPhotoUrl = data.photoUrl;
    }
    if (data.address) {
      detailsToPropagate.ownerAddress = data.address;
    }

    if (Object.keys(detailsToPropagate).length > 0) {
      await updateEquipmentOwnerDetailsInEquipments(ownerId, detailsToPropagate);
    }

    const updatedDoc = await getDoc(ownerRef); // Re-fetch to get updated data
    if (!updatedDoc.exists()) { // This check might be redundant if the first one passes, but good for safety
      return { success: false, error: 'المستخدم غير موجود بعد التحديث (خطأ غير متوقع)' };
    }

    const updatedData = updatedDoc.data();

    return {
      success: true,
      data: {
        id: updatedDoc.id,
        name: updatedData.name,
        address: updatedData.address,
        phoneNumber: updatedData.phoneNumber,
        photoUrl: updatedData.photoUrl,
        isVerified: updatedData.isVerified,
        userType: updatedData.userType,
        createdAt: updatedData.createdAt && typeof updatedData.createdAt.toDate === 'function'
          ? updatedData.createdAt.toDate().toISOString()
          : (updatedData.createdAt || new Date().toISOString()),
        updatedAt: updatedData.updatedAt && typeof updatedData.updatedAt.toDate === 'function'
          ? updatedData.updatedAt.toDate().toISOString()
          : (updatedData.updatedAt || new Date().toISOString()),
        equipmentDetails: updatedData.equipmentDetails,
      },
    };
  } catch (error) {
    console.error('Error updating equipment owner:', error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع' };
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

// ✅ حذف معدة
export const deleteEquipmentAction = async (equipmentId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await deleteEquipment(equipmentId);
    if (!result.success) {
      throw new Error(result.error as string);
    }
    
    // Revalidate the profile page to show the updated list of equipment
    revalidatePath('/equipment-owner/profile');
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteEquipmentAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل في حذف المعدة',
    };
  }
};

// ✅ تغيير كلمة مرور مالك معدات
export const changeEquipmentOwnerPasswordAction = async (
  ownerId: string,
  oldPassword: string,
  newPassword: string
): Promise<UpdateResult<null>> => {
  console.log('Changing password for owner:', ownerId);
  console.log('Old password provided:', oldPassword);
  console.log('New password provided:', newPassword);
  try {
    const ownerRef = doc(db, EQUIPMENT_OWNERS_COLLECTION, ownerId);
    const ownerDoc = await getDoc(ownerRef);

    if (!ownerDoc.exists()) {
      return { success: false, error: 'المستخدم غير موجود' };
    }

    const ownerData = ownerDoc.data();
    console.log('Password hash stored in DB:', ownerData.password);
    const isMatch = await bcrypt.compare(oldPassword, ownerData.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      return { success: false, error: 'كلمة المرور القديمة غير صحيحة' };
    }

    // Update password in Firebase Auth
    const adminAuth = getAdminAuth();
    await adminAuth.updateUser(ownerData.uid, {
      password: newPassword,
    });

    const hashedNewPassword = await hashPassword(newPassword);
    console.log('New password hashed:', hashedNewPassword);

    console.log('Updating document with new password...');
    await updateDoc(ownerRef, {
      password: hashedNewPassword,
      updatedAt: new Date().toISOString(),
    });
    console.log('Password updated successfully.');

    return { success: true };
  } catch (error) {
    console.error('Error changing equipment owner password:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
    };
  }
};