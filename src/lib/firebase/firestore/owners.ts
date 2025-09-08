// Firestore utility functions
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc, // Import updateDoc
  where,
} from 'firebase/firestore';
import { db } from '../config';
import { Equipment, OwnerData, UpdateResult } from '@/lib/interface'; // Import OwnerData

const EQUIPMENT_OWNERS_COLLECTION = 'equipmentOwners';
const EQUIPMENT_COLLECTION = 'equipment';

// ✅ جلب المعدات المرتبطة بمالك معين
export const getEquipmentsByOwner = async (
  ownerId: string
): Promise<UpdateResult<Equipment[]>> => {
  try {
    const q = query(collection(db, EQUIPMENT_COLLECTION), where('ownerId', '==', ownerId));
    const querySnapshot = await getDocs(q);

    const equipmentList: Equipment[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      fbId: doc.id,
      ...doc.data(),
    })) as Equipment[];

    return { success: true, data: equipmentList };
  } catch (error) {
    console.error('Error getting equipments by owner:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
    };
  }
};

export const getEquipmentOwner = async (ownerId: string): Promise<{ success: boolean; data?: OwnerData; error?: string }> => {
  console.log('getEquipmentOwner: ownerId', ownerId);
  try {
    const ownerDoc = await getDoc(doc(db, EQUIPMENT_OWNERS_COLLECTION, ownerId));
    console.log('getEquipmentOwner: ownerDoc.exists()', ownerDoc.exists());
    if (ownerDoc.exists()) {
      const data = ownerDoc.data();
      console.log('getEquipmentOwner: ownerData from Firestore', data);
      // Map the generic data to the specific OwnerData interface
      const ownerData: OwnerData = {
        id: ownerDoc.id,
        name: data.name || '',
        photoUrl: data.photoUrl || undefined,
        phoneNumber: data.phoneNumber || '',
        isVerified: data.isVerified || false,
        userType: data.userType || 'equipmentOwners',
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate().toISOString()
          : (data.createdAt || new Date().toISOString()),
        updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function'
          ? data.updatedAt.toDate().toISOString()
          : (data.updatedAt || new Date().toISOString()),
        equipmentDetails: data.equipmentDetails || '',
      };
      console.log('getEquipmentOwner: mapped ownerData', ownerData);
      return { success: true, data: ownerData };
    } else {
      return { success: false, error: 'Equipment owner not found' };
    }
  } catch (error) {
    console.error('Error getting equipment owner:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// ✅ تحديث بيانات مالك المعدة
export const updateEquipmentOwner = async (
  ownerId: string,
  dataToUpdate: Partial<OwnerData>
): Promise<UpdateResult<OwnerData>> => {
  try {
    const ownerRef = doc(db, EQUIPMENT_OWNERS_COLLECTION, ownerId);
    await updateDoc(ownerRef, dataToUpdate);
    return { success: true };
  } catch (error) {
    console.error('Error updating equipment owner:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
    };
  }
};
