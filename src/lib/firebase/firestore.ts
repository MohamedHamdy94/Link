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
import { db } from './config';
import { Equipment,Driver,OwnerData, UpdateResult } from '@/lib/interface';

// User collections
const DRIVERS_COLLECTION = 'drivers';
const EQUIPMENT_OWNERS_COLLECTION = 'equipmentOwners';
const EQUIPMENT_COLLECTION = 'equipment';

// Driver functions
export const createDriver = async (driverId: string, driverData: Driver) => {
  try {
    await setDoc(doc(db, DRIVERS_COLLECTION, driverId), {
      ...driverData,
      isVerified: false,
      userType:'drivers' ,

      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating driver:', error);
    return { success: false, error };
  }
};

export const getDrivers = async () => {
  try {
    const driversSnapshot = await getDocs(collection(db, DRIVERS_COLLECTION));
    const drivers : object[] = [];
    driversSnapshot.forEach((doc) => {
      drivers.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: drivers };
  } catch (error) {
    console.error('Error getting drivers:', error);
    return { success: false, error:'Error getting drivers:' };
  }
};

export const getDriver = async (driverId: string) => {
  try {
    const driverDoc = await getDoc(doc(db, DRIVERS_COLLECTION, driverId));
    if (driverDoc.exists()) {
      return { success: true, data: driverDoc.data() };
    } else {
      return { success: false, error: 'Driver not found' };
    }
  } catch (error) {
    console.error('Error getting driver:', error);
    return { success: false, error };
  }
};

export const updateDriver = async (driverId: string, driverData: Driver) => {
  try {
    await updateDoc(doc(db, DRIVERS_COLLECTION, driverId), {
      ...driverData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating driver:', error);
    return { success: false, error };
  }
};



// Equipment Owner functions
export const createEquipmentOwner = async (ownerId: string, ownerData: OwnerData) => {
  try {
    await setDoc(doc(db, EQUIPMENT_OWNERS_COLLECTION, ownerId), {
      ...ownerData,
      isVerified: false,
      createdAt: new Date(),
      userType:'equipmentOwners' ,

      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating equipment owner:', error);
    return { success: false, error };
  }
};

export const getEquipmentOwner = async (ownerId: string) => {
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

// في ملف firestore.ts أو wherever the function is defined


export const updateEquipmentOwner = async (
  ownerId: string,
  data: Partial<OwnerData>
): Promise<UpdateResult<OwnerData>> => {
  try {
    const ownerRef = doc(db, 'equipmentOwners', ownerId);
    await updateDoc(ownerRef, data);
    
    // جلب البيانات المحدثة
    const updatedDoc = await getDoc(ownerRef);
    if (!updatedDoc.exists()) {
      return { success: false, error: 'المستخدم غير موجود' };
    }
    
    return {
      success: true,
      data: {
        id: updatedDoc.id,
        name: updatedDoc.data().name,
        photoUrl: updatedDoc.data().photoUrl,
        phoneNumber: updatedDoc.data().phoneNumber,
        isVerified: updatedDoc.data().isVerified,
        userType: updatedDoc.data().userType,
        createdAt: updatedDoc.data().createdAt?.toDate() || new Date(),
        equipmentDetails: updatedDoc.data().equipmentDetails,
        updatedAt: updatedDoc.data().updatedAt?.toDate() || new Date(),

      }
    };
  } catch (error) {
    return { success: false, error };
  }
};


// Equipment functions
export const createEquipment = async (equipmentData: Equipment) => {
  try {
    const equipmentRef = doc(collection(db, EQUIPMENT_COLLECTION));
    await setDoc(equipmentRef, {
      ...equipmentData});
    return { success: true, id: equipmentRef.id };
  } catch (error) {
    console.error('Error creating equipment:', error);
    return { success: false, error };
  }
};

export const getEquipment = async (equipmentId: string) => {
  try {
    const equipmentDoc = await getDoc(doc(db, EQUIPMENT_COLLECTION, equipmentId));
    if (equipmentDoc.exists()) {
      return { success: true, data: equipmentDoc.data() };
    } else {
      return { success: false, error: 'Equipment not found' };
    }
  } catch (error) {
    console.error('Error getting equipment:', error);
    return { success: false, error };
  }
};

export const getEquipments = async () => {
  try {
    const equipmentSnapshot = await getDocs(collection(db, EQUIPMENT_COLLECTION));
    const equipments : object[] = [];
    equipmentSnapshot.forEach((doc) => {
      console.log(doc.id)
      console.log(doc)

      equipments.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: equipments };
  } catch (error) {
    console.error('Error getting equipment:', error);
    return { success: false, error };
  }
};
export const updateEquipment = async (equipmentId: string, equipmentData: Equipment) => {
  try {
    await updateDoc(doc(db, EQUIPMENT_COLLECTION, equipmentId), {
      ...equipmentData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating equipment:', error);
    return { success: false, error };
  }
};

export const getOwnerEquipment = async (ownerId: string) => {
  try {
    const equipmentQuery = query(
      collection(db, EQUIPMENT_COLLECTION),
      where('ownerId', '==', ownerId)
    );
    const equipmentSnapshot = await getDocs(equipmentQuery);
    const equipment: DocumentData[] = [];
    equipmentSnapshot.forEach((doc) => {
      equipment.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: equipment };
  } catch (error) {
    console.error('Error getting owner equipment:', error);
    return { success: false, error };
  }
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
