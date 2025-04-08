import { db } from './config';
import { collection, getDocs, doc, updateDoc,  } from 'firebase/firestore';

// Get all users (both drivers and equipment owners)
// export const getAllUsers = async () => {
//   try {
//     // Get drivers
//     const driversSnapshot = await getDocs(collection(db, 'drivers'));
//     const drivers = driversSnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//       userType: 'drivers'
//     }));

//     // Get equipment owners
//     const ownersSnapshot = await getDocs(collection(db, 'equipmentOwners'));
//     const owners = ownersSnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//       userType: 'equipmentOwners'
//     }));

//     // Combine and return all users
//     return {
//       success: true,
//       data: [...drivers, ...owners]
//     };
//   } catch (error) {
//     console.error('Error getting users:', error);
//     return {
//       success: false,
//       error: 'فشل في جلب بيانات المستخدمين'
//     };
//   }
// };
// services/userService.ts
import { Timestamp } from 'firebase/firestore';

export const getAllUsers = async () => {
  try {
    const driversSnapshot = await getDocs(collection(db, 'drivers'));
    const ownersSnapshot = await getDocs(collection(db, 'equipmentOwners'));

    const convertFirebaseData = (doc: any, type: 'drivers' | 'equipmentOwners'): User => {
      const data = doc.data();
      // في دالة convertFirebaseData
userType: type === 'drivers' ? 'drivers' : 'equipmentOwners'
      return {
        id: doc.id,
        name: data.name,
        phoneNumber: data.phoneNumber,
        userType: type,
        isVerified: data.isVerified || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        ...(type === 'driver' && {
          age: data.age,
          equipmentType: data.equipmentType,
          hasLicense: data.hasLicense,
          isAvailable: data.isAvailable
        }),
        ...(type === 'equipmentOwner' && {
          equipmentDetails: data.equipmentDetails,
          photoUrl: data.photoUrl
        })
      };
    };

    const drivers = driversSnapshot.docs.map(doc => 
      convertFirebaseData(doc, 'drivers')
    );

    const owners = ownersSnapshot.docs.map(doc => 
      convertFirebaseData(doc, 'equipmentOwners')
    );

    return {
      success: true,
      data: [...drivers, ...owners]
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      error: 'Failed to fetch users'
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



// Check if user is admin
export const checkAdminRole = async (userId: string) => {
  try {
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
