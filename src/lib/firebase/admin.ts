import { db } from './config';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

// Get all users (both drivers and equipment owners)
export const getAllUsers = async () => {
  try {
    // Get drivers
    const driversSnapshot = await getDocs(collection(db, 'drivers'));
    const drivers = driversSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      userType: 'drivers'
    }));

    // Get equipment owners
    const ownersSnapshot = await getDocs(collection(db, 'equipmentOwners'));
    const owners = ownersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      userType: 'equipmentOwners'
    }));

    // Combine and return all users
    return {
      success: true,
      data: [...drivers, ...owners]
    };
  } catch (error) {
    console.error('Error getting users:', error);
    return {
      success: false,
      error: 'فشل في جلب بيانات المستخدمين'
    };
  }
};

// Update user verification status
export const updateUserVerificationStatus = async (userType:string, userId: string, isVerified: boolean) => {
  try {
    console.log(userType)
    // First try to update in drivers collection
      const driverRef = doc(db, userType, userId);
      await updateDoc(driverRef, { isVerified });
      return { success: true };

  } catch (error) {
    console.error('Error updating user verification status:', error);
    return {
      success: false,
      error: 'فشل في تحديث حالة التفعيل'
    };
  }
};

// Get verified users only
// export const getVerifiedUsers = async () => {
//   try {
//     // Get verified drivers
//     const driversQuery = query(collection(db, 'drivers'), where('isVerified', '==', true));
//     const driversSnapshot = await getDocs(driversQuery);
//     const drivers = driversSnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//       userType: 'drivers'
//     }));

//     // Get verified equipment owners
//     const ownersQuery = query(collection(db, 'equipmentOwners'), where('isVerified', '==', true));
//     const ownersSnapshot = await getDocs(ownersQuery);
//     const owners = ownersSnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//       userType: 'equipmentOwners'
//     }));

//     // Combine and return verified users
//     return {
//       success: true,
//       data: [...drivers, ...owners]
//     };
//   } catch (error) {
//     console.error('Error getting verified users:', error);
//     return {
//       success: false,
//       error: 'فشل في جلب بيانات المستخدمين المفعلين'
//     };
//   }
// };

// // Get unverified users only
// export const getUnverifiedUsers = async () => {
//   try {
//     // Get unverified drivers
//     const driversQuery = query(collection(db, 'drivers'), where('isVerified', '==', false));
//     const driversSnapshot = await getDocs(driversQuery);
//     const drivers = driversSnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//       userType: 'drivers'
//     }));

//     // Get unverified equipment owners
//     const ownersQuery = query(collection(db, 'equipmentOwners'), where('isVerified', '==', false));
//     const ownersSnapshot = await getDocs(ownersQuery);
//     const owners = ownersSnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//       userType: 'equipmentOwners'
//     }));

//     // Combine and return unverified users
//     return {
//       success: true,
//       data: [...drivers, ...owners]
//     };
//   } catch (error) {
//     console.error('Error getting unverified users:', error);
//     return {
//       success: false,
//       error: 'فشل في جلب بيانات المستخدمين غير المفعلين'
//     };
//   }
// };

// Check if user is admin
export const checkAdminRole = async (userId: string) => {
  try {
    const adminRef = doc(db, 'admins', userId);
    const adminDoc = await getDocs(collection(db, 'admins'));
    const admins = adminDoc.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const isAdmin = admins.some(admin => admin.id === userId);
    
    return {
      success: true,
      isAdmin
    };
  } catch (error) {
    console.error('Error checking admin role:', error);
    return {
      success: false,
      isAdmin: false,
      error: 'فشل في التحقق من صلاحيات المسؤول'
    };
  }
};
