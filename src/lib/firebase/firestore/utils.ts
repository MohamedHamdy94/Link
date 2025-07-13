// Firestore utility functions
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config';
import { User } from '@/lib/interface';

// User collections
const DRIVERS_COLLECTION = 'drivers';
const EQUIPMENT_OWNERS_COLLECTION = 'equipmentOwners';


export const isPhoneTaken = async (phoneNumber: string) => {
  // تحقق في مجموعة equipmentOwners
  const ownerQuery = query(
    collection(db, EQUIPMENT_OWNERS_COLLECTION),
    where('phoneNumber', '==', phoneNumber)
  );
  const ownerSnapshot = await getDocs(ownerQuery);
  if (!ownerSnapshot.empty) return true;

  // تحقق في مجموعة drivers
  const driverQuery = query(
    collection(db, DRIVERS_COLLECTION),
    where('phoneNumber', '==', phoneNumber)
  );
  const driverSnapshot = await getDocs(driverQuery);
  if (!driverSnapshot.empty) return true;

  return false;
};

// Authentication functions
export const getUserByPhone = async (phoneNumber: string) => {
  try {
    // Check in drivers collection
    const driverQuery = query(
      collection(db, DRIVERS_COLLECTION),
      where('phoneNumber', '==', phoneNumber)
    );
    const driverSnapshot = await getDocs(driverQuery);
    
    if (!driverSnapshot.empty) {
      const driverDoc = driverSnapshot.docs[0];
      return { 
        success: true, 
        data: { id: driverDoc.id, ...driverDoc.data(), userType: 'driver' } 
      };
    }
    
    // Check in equipment owners collection
    const ownerQuery = query(
      collection(db, EQUIPMENT_OWNERS_COLLECTION),
      where('phoneNumber', '==', phoneNumber)
    );
    const ownerSnapshot = await getDocs(ownerQuery);
    
    if (!ownerSnapshot.empty) {
      const ownerDoc = ownerSnapshot.docs[0];
      return { 
        success: true, 
        data: { id: ownerDoc.id, ...ownerDoc.data(), userType: 'equipmentOwner' } 
      };
    }
    
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error getting user by phone:', error);
    return { success: false, error };
  }
};

export const getUserProfileById = async (docId: string, userType: 'drivers' | 'equipmentOwners') => {
  try {
    const collectionName = userType === 'drivers' ? DRIVERS_COLLECTION : EQUIPMENT_OWNERS_COLLECTION;
    const userDoc = await getDoc(doc(db, collectionName, docId));

    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() as User };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    console.error('Error getting user profile by ID:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get user profile' };
  }
};