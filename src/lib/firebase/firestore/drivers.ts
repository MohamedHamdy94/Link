// Firestore utility functions
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where
  
} from 'firebase/firestore';
import { db } from '../config';
import { Driver } from '@/lib/interface';

// User collections
const DRIVERS_COLLECTION = 'drivers';

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

export const getDriverByPhoneNumber = async (phoneNumber: string) => {
  try {
    const q = query(collection(db, DRIVERS_COLLECTION), where('phoneNumber', '==', phoneNumber));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const driverDoc = querySnapshot.docs[0];
      return { success: true, data: { id: driverDoc.id, ...driverDoc.data() } };
    } else {
      return { success: false, error: 'Driver not found' };
    }
  } catch (error) {
    console.error('Error getting driver by phone number:', error);
    return { success: false, error };
  }
};