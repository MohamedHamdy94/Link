import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { User } from '../interface';
import { db } from './config';
import { collection, getDocs, doc, updateDoc,  } from 'firebase/firestore';

let adminAuthInstance: ReturnType<typeof getAuth> | undefined;

export const getAdminAuth = (): ReturnType<typeof getAuth> => {
  if (adminAuthInstance) {
    return adminAuthInstance;
  }

  try {
    const serviceAccountConfig = process.env.FIREBASE_ADMIN_SDK_CONFIG;

    if (!serviceAccountConfig) {
      throw new Error('Environment variable FIREBASE_ADMIN_SDK_CONFIG is not set.');
    }

    const serviceAccount = JSON.parse(serviceAccountConfig);

    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount)
      });
    }

    adminAuthInstance = getAuth();
    return adminAuthInstance;

  } catch (error) {
    console.error('Error loading service account key or initializing Firebase Admin SDK:', error);
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
};

// Get all users (both drivers and equipment owners)
export const getAllUsers = async (): Promise<{
  success: boolean;
  data?: User[];
  error?: string;
}> => {
  try {
    // جلب السائقين
    const driversSnapshot = await getDocs(collection(db, 'drivers'));
    const drivers: User[] = driversSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'غير محدد',
        phoneNumber: data.phoneNumber || 'غير محدد',
        userType: 'drivers',
        isVerified: data.isVerified || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        age: data.age,
        equipmentType: data.equipmentType,
        hasLicense: data.hasLicense,
        isAvailable: data.isAvailable,
        password: data.password
      };
    });

    // جلب أصحاب المعدات
    const ownersSnapshot = await getDocs(collection(db, 'equipmentOwners'));
    const owners: User[] = ownersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'غير محدد',
        phoneNumber: data.phoneNumber || 'غير محدد',
        userType: 'equipmentOwners',
        isVerified: data.isVerified || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        equipmentDetails: data.equipmentDetails,
        photoUrl: data.photoUrl,
        password: data.password
      };
    });

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
    // تحديث حالة isVerified في Firestore
    const userRef = doc(db, userType, userId);
    await updateDoc(userRef, { isVerified });

    // تحديث المطالبات المخصصة في Firebase Authentication
    const adminAuth = getAdminAuth(); // Get the initialized adminAuth instance
    const userRecord = await adminAuth.getUser(userId);
    const currentCustomClaims = userRecord.customClaims || {};
    await adminAuth.setCustomUserClaims(userId, { ...currentCustomClaims, isVerified });
    
    // إبطال توكنات التحديث لإجبار العميل على الحصول على توكن جديد
    await adminAuth.revokeRefreshTokens(userId);

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