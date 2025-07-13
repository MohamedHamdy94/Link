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
import { Equipment,Driver,OwnerData, UpdateResult } from '@/lib/interface';
import { isPhoneTaken } from './utils';

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

    const updatePayload: Partial<Driver> & { updatedAt: Date } = {
      ...driverData,
      updatedAt: new Date()
    };

    // إذا تم توفير كلمة مرور جديدة، قم بتشفيرها وإضافتها إلى حمولة التحديث
    if (driverData.password) {
      const hashedPassword = await bcrypt.hash(driverData.password, 10);
      updatePayload.password = hashedPassword;
    } else {
      // إذا لم يتم توفير كلمة مرور جديدة، احذف حقل كلمة المرور من حمولة التحديث
      // لكي لا يتم الكتابة فوق كلمة المرور الحالية بقيمة undefined
      delete updatePayload.password;
    }

    await updateDoc(doc(db, DRIVERS_COLLECTION, driverId), updatePayload);

    return { data: updatePayload, success: true };
  } catch (error) {
    console.error('Error updating driver:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    };
  }
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