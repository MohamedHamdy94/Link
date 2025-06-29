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
import bcrypt from 'bcryptjs';

export const createDriver = async (driverId: string, driverData: Driver) => {
  try {
    // تشفير كلمة المرور قبل الحفظ
    const hashedPassword =driverData.password && await bcrypt.hash(driverData.password, 10);
        const phoneTaken = await isPhoneTaken(driverData.phoneNumber);

if (phoneTaken) {
  return { success: false, error: 'رقم الجوال مستخدم من قبل' };
}

    await setDoc(doc(db, DRIVERS_COLLECTION, driverId), {
      ...driverData,
      password: hashedPassword,
      isVerified: false,
      userType: 'drivers',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating driver:', error);
    return { success: false, error };
  }
};
export const updateDriver = async (
  driverId: string,
  driverData: Driver,
  currentPassword?: string, // كلمة المرور الحالية للتأكيد
  isChangingPassword?: boolean // هل يحاول تغيير كلمة المرور؟
) => {
  try {
    // جلب بيانات السائق الحالية
    const driverDoc = await getDoc(doc(db, DRIVERS_COLLECTION, driverId));
    if (!driverDoc.exists()) {
      throw new Error('السائق غير موجود');
    }

    const currentDriverData = driverDoc.data() as Driver;

    // إذا كان يحاول تغيير كلمة المرور
    if (isChangingPassword && currentDriverData.password) {
      if (!currentPassword) {
        throw new Error('يجب إدخال كلمة المرور الحالية');
      }

      // التحقق من تطابق كلمة المرور الحالية
      const isMatch = await bcrypt.compare(
        currentPassword,
        currentDriverData.password
      );
      
      if (!isMatch) {
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }
    }

    const updatedData = { ...driverData };

    // إذا تم توفير كلمة مرور جديدة
    if (driverData.password) {
      const hashedPassword = await bcrypt.hash(driverData.password, 10);
      updatedData.password = hashedPassword;
    } else {
      // الحفاظ على كلمة المرور الحالية إذا لم يتم تغييرها
      updatedData.password = currentDriverData.password;
    }

    await updateDoc(doc(db, DRIVERS_COLLECTION, driverId), {
      ...updatedData,
      updatedAt: new Date()
    });

    return { data: updatedData, success: true };
  } catch (error) {
    console.error('Error updating driver:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    };
  }
};
// export const updateDriver = async (driverId: string, driverData: Driver) => {
//   try {
//     await updateDoc(doc(db, DRIVERS_COLLECTION, driverId), {
//       ...driverData,
//       updatedAt: new Date()
//     });
//     return {data:driverData, success: true };
//   } catch (error) {
//     console.error('Error updating driver:', error);
//     return { success: false, error };
//   }
// };

const isPhoneTaken = async (phoneNumber: string) => {
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




export const getDrivers = async () => {
  try {

    const driversSnapshot = collection(db, DRIVERS_COLLECTION);
    const q = query(driversSnapshot, where('isVerified', '==', true));
    const querySnapshot = await getDocs(q);

    const drivers: Driver[] = [];
    querySnapshot.forEach((doc) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _omit, ...rest } = doc.data();
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





// Equipment Owner functions



export const createEquipmentOwner = async (ownerId: string, ownerData: OwnerData) => {
  try {
const phone:string=ownerData.phoneNumber
        const phoneTaken = await isPhoneTaken(phone);

  if (phoneTaken) {
  return { success: false, error: 'رقم الجوال مستخدم من قبل' };
  }
    // توليد هاش لكلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword =ownerData.password && await bcrypt.hash(ownerData.password, salt);

    await setDoc(doc(db, EQUIPMENT_OWNERS_COLLECTION, ownerId), {
      name: ownerData.name,
      phoneNumber: ownerData.phoneNumber,
      password: hashedPassword, // تخزين الهاش بدلاً من كلمة المرور الأصلية
      isVerified: false,
      userType: 'equipmentOwners',
      createdAt: new Date(),
      updatedAt: new Date(),
      // يمكنك إضافة المزيد من الحقول هنا
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating equipment owner:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    };
  }
};

export const getEquipmentsByOwner = async (ownerId: string): Promise<UpdateResult<Equipment[]>> => {
  try {
    const equipmentQuery = query(
      collection(db, EQUIPMENT_COLLECTION),
      where('ownerId', '==', ownerId)
    );
    const querySnapshot = await getDocs(equipmentQuery);

    const equipmentList: Equipment[] = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as Equipment[];

    return { success: true, data: equipmentList };
  } catch (error) {
    console.error('Error getting equipments by owner:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    };
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
    
    // إذا كانت هناك كلمة مرور في البيانات المراد تحديثها
    if (data.password) {
      // توليد هاش جديد لكلمة المرور
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      
      // استبدال كلمة المرور النصية بالهاش
      data.password = hashedPassword;
    }

    // إضافة تاريخ التحديث
    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    await updateDoc(ownerRef, updateData);
    
    // جلب البيانات المحدثة
    const updatedDoc = await getDoc(ownerRef);
    if (!updatedDoc.exists()) {
      return { success: false, error: 'المستخدم غير موجود' };
    }
    
    const updatedData = updatedDoc.data();
    
    // إرجاع البيانات بدون كلمة المرور
    return {
      success: true,
      data: {
        id: updatedDoc.id,
        name: updatedData.name,
        photoUrl: updatedData.photoUrl,
        phoneNumber: updatedData.phoneNumber,
        isVerified: updatedData.isVerified,
        userType: updatedData.userType,
        createdAt: updatedData.createdAt?.toDate() || new Date(),
        equipmentDetails: updatedData.equipmentDetails,
        updatedAt: updatedData.updatedAt?.toDate() || new Date(),
      }
    };
  } catch (error) {
    console.error('Error updating equipment owner:', error);
    return { 
      success: false, 
      error: 'حدث خطأ غير متوقع'
    };
  }
};

// دالة مساعدة للتحقق من كلمة المرور قبل التحديث
export const verifyAndUpdateEquipmentOwner = async (
  ownerId: string,
  updates: Partial<OwnerData>,
  currentPassword?: string
): Promise<UpdateResult<OwnerData>> => {
  try {
    // إذا كان هناك كلمة مرور جديدة، يجب التحقق من كلمة المرور الحالية
    if (updates.password && currentPassword) {
      const ownerDoc = await getDoc(doc(db, 'equipmentOwners', ownerId));
      if (ownerDoc.exists()) {
        const ownerData = ownerDoc.data();
        const isMatch = await bcrypt.compare(currentPassword, ownerData.password);
        
        if (!isMatch) {
          return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
        }
      }
    }
    
    return await updateEquipmentOwner(ownerId, updates);
  } catch (error) {
    console.error('Error verifying and updating:', error);
    return { 
      success: false, 
       error: 'حدث خطأ أثناء التحقق والتحديث'
    };
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
