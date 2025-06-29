// import { db, auth } from './config';
// import { doc, getDoc } from 'firebase/firestore';
// import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
// import bcrypt from 'bcryptjs';
// type UserType = 'drivers' | 'equipmentOwners' | 'admins';

// interface AuthResponse {
//   success: boolean;
//   userType?: UserType;
//   error?: string;
// }

// // 🔐 تسجيل الدخول
// export const loginUser = async (phoneNumber: string, password: string): Promise<AuthResponse> => {
//   try {
//     const userTypes: UserType[] = ['drivers', 'equipmentOwners', 'admins'];

//     for (const userType of userTypes) {
//       const snapshot = await getDoc(doc(db, userType, phoneNumber));

//       if (snapshot.exists()) {
//         const userData = snapshot.data();

//         const isPasswordValid = await bcrypt.compare(password, userData.password);
//         if (isPasswordValid) {
//           // تسجيل دخول وهمي عبر Firebase Auth (تسجيل دخول إجباري بأي بريد عشوائي)
//           // يمكنك إنشاء حساب وهمي مسبقًا لهذا الغرض أو استخدام `signInAnonymously(auth)`
//           await signInWithEmailAndPassword(auth, `${phoneNumber}@app.com`, password)
//             .catch(() => {}); // تجاهل الخطأ إن لم يكن البريد مستخدم فعليًا

//           return { success: true, userType };
//         }
//       }
//     }

//     return { success: false, error: 'رقم الهاتف أو كلمة المرور غير صحيحة' };
//   } catch (error) {
//     console.error('Login error:', error);
//     return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
//   }
// };

// // 🔓 تسجيل الخروج

// export const logout = async (): Promise<void> => {
//   try {
//     await signOut(auth); // تسجيل الخروج من Firebase
//   } catch (error) {
//     console.error('Error signing out:', error);
//   }

//   // تنظيف الجلسة المحلية
//   sessionStorage.removeItem('userType');
//   sessionStorage.removeItem('session'); // إذا كنت تحفظ أي بيانات جلسة أخرى
// };

// export const getWhatsAppGroupLink = (): string => {
//   return 'https://chat.whatsapp.com/example-group-link';
// };


import { db } from './config';
import { doc, getDoc } from 'firebase/firestore';
 import bcrypt from 'bcryptjs';
import { signOut } from 'firebase/auth';
import { auth } from './config';

// Types
type UserType = 'drivers' | 'equipmentOwners' | 'admins';

interface Session {
  id: string;
  phoneNumber: string;
  userType: UserType;
  role?: string;
}

interface AuthResponse {
  success: boolean;
  userType?: UserType;
  error?: string;
}

// Current session state
let currentSession: Session | null = null;

// Main authentication functions
export const loginUser = async (phoneNumber: string, password: string): Promise<AuthResponse> => {
  try {
    const userTypes: UserType[] = ['drivers', 'equipmentOwners', 'admins'];
    
    for (const userType of userTypes) {
      const snapshot = await getDoc(doc(db, userType, phoneNumber));
      
      if (snapshot.exists()) {
        const userData = snapshot.data();
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        
        if (isPasswordValid) {
          currentSession = {
            id: phoneNumber,
            phoneNumber,
            userType,
            role: userType === 'admins' ? 'admins' : undefined
          };
          
          return { success: true, userType };
        } else {
          console.log('Password does not match');
        }
      }
    }

    console.log('User not found or password incorrect');
    return { success: false, error: 'رقم الهاتف أو كلمة المرور غير صحيحة' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
  }
};

export const getSession = (): Session | null => {
  return currentSession;
};

export const getUserType = (): UserType | null => {
  return currentSession?.userType ?? null;
};


export const logout = async (): Promise<void> => {
  try {
    await signOut(auth); // يسجل الخروج من Firebase Auth
    currentSession = null; // يتم تصفير الجلسة المحلية إن وجدت
  } catch (error) {
    console.error('فشل تسجيل الخروج:', error);
  }
};

export const getWhatsAppGroupLink = (): string => {
  return 'https://chat.whatsapp.com/example-group-link';
};