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

    const driversSnapshot = collection(db, DRIVERS_COLLECTION);
    const q = query(driversSnapshot, where('isVerified', '==', true));
    const querySnapshot = await getDocs(q);

    const drivers: Driver[] = [];
    querySnapshot.forEach((doc) => {
      const { password, ...rest } = doc.data();
      drivers.push({
        ...rest
      } as Driver);
    });


    console.log(drivers)
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
    return {data:driverData, success: true };
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


export const getOwnerEquipments = async (ownerId: string) => {

  
  try {
    const equipmentsRef = collection(db, EQUIPMENT_COLLECTION);
    const q = query(equipmentsRef, where('ownerId', '==', ownerId));
    const querySnapshot = await getDocs(q);

    const equipments: Equipment[] = [];
    querySnapshot.forEach((doc) => {
      equipments.push({
        fbId: doc.id,
        ...doc.data()
      } as Equipment);
    });
    return { 
      success: true, 
      data: equipments 
    };
  } catch (error) {
    console.error('Error getting owner equipments:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get equipments' 
    };
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



export const getEquipmentById = async (id: string): Promise<{ success: boolean; data?: Equipment; error?: string }> => {
  try {
    const docRef = doc(db, EQUIPMENT_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Equipment not found' };
    }

    const data = docSnap.data();

    return {
      success: true,
      data: {
        fbId: docSnap.id,
        id: docSnap.id,
        name: data.name,
        description: data.description || '',
        price: data.price,
        status: data.status,
        equipmentType: data.equipmentType,
        photoUrl: data.photoUrl || '',
        ownerId: data.ownerId,
        ownerPhone: data.ownerPhone || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      }
    };
  } catch (error) {
    console.error('Error getting Equipment:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب البيانات' };
  }
};









export const getEquipments = async () => {
  
  try {
    const equipmentsRef = collection(db, EQUIPMENT_COLLECTION);
    const q = query(equipmentsRef, where('status', '!=', 'work'));
    const querySnapshot = await getDocs(q);

    const equipments: Equipment[] = [];
    querySnapshot.forEach((doc) => {
      equipments.push({
        fbId: doc.id,
        ...doc.data()
      } as Equipment);
    });
    return { 
      success: true, 
      data: equipments 
    };
  } catch (error) {
    console.error('Error getting owner equipments:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get equipments' 
    };
  }
};


export const updateEquipment = async (equipmentId: string, equipmentData: Equipment) => {
  try {
      await updateDoc(doc(db, EQUIPMENT_COLLECTION, equipmentId), {
      ...equipmentData,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Update error:", error);
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
