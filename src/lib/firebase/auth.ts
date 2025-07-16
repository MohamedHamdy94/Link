


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

// Current session state
let currentSession: Session | null = null;

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