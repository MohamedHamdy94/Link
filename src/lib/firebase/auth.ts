import { db } from './config';
import { doc, getDoc } from 'firebase/firestore';

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
        
        if (userData.password === password) {
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

export const logout = (): void => {
  currentSession = null;
};

export const getWhatsAppGroupLink = (): string => {
  return 'https://chat.whatsapp.com/example-group-link';
};