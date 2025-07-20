// Firestore utility functions
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config';
import { Equipment, UpdateResult } from '@/lib/interface';


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
      fbId: doc.id, // إضافة fbId هنا
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

export const getEquipmentOwner = async (ownerId: string) => {
  console.log(ownerId)
  try {
    const ownerDoc = await getDoc(doc(db, EQUIPMENT_OWNERS_COLLECTION, ownerId));
    if (ownerDoc.exists()) {
      return { success: true, data: ownerDoc.data() };
    } else {
      return { success: false, error: 'Equipment owner not found' };
    }
  } catch (error) {
    console.error('Error getting equipment owner:', error);
    return { success: false, error };
  }
};
