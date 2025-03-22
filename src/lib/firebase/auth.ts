// Authentication utility functions
import { getUserByPhone } from './firestore';

// Session management
const SESSION_STORAGE_KEY = 'equipment_website_user_session';

// Interface for user session
interface UserSession {
  id: string;
  userType: 'driver' | 'equipmentOwner';
  phoneNumber: string;
  isVerified: boolean;
}

/**
 * Login user with phone number and password
 * @param phoneNumber - User phone number
 * @param password - User password
 * @returns Object with success status and user data or error
 */
export const loginUser = async (phoneNumber: string, password: string) => {
  try {
    // Get user by phone number
    const userResult = await getUserByPhone(phoneNumber);
    
    if (!userResult.success) {
      return { success: false, error: 'رقم الهاتف غير مسجل' };
    }
    
    const userData = userResult.data as any;
    
    // Check password
    // if (userData.password !== password) {
    //   return { success: false, error: 'كلمة المرور غير صحيحة' };
    // }
    
    // Create session
    const session: UserSession = {
      id: userData.id ,
      userType: userData.userType,
      phoneNumber: userData.phoneNumber,
      isVerified: userData.isVerified
    };
    
    // Save session to localStorage
    saveSession(session);
    
    return { success: true, data: userData };
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
  }
};

/**
 * Save user session to localStorage
 * @param session - User session data
 */
export const saveSession = (session: UserSession) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }
};

/**
 * Get current user session from localStorage
 * @returns User session or null if not logged in
 */
export const getSession = (): UserSession | null => {
  if (typeof window !== 'undefined') {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
  }
  return null;
};

/**
 * Check if user is logged in
 * @returns Boolean indicating if user is logged in
 */
export const isLoggedIn = (): boolean => {
  return getSession() !== null;
};

/**
 * Check if user is verified
 * @returns Boolean indicating if user is verified
 */
export const isVerified = (): boolean => {
  const session = getSession();
  return session !== null && session.isVerified;
};

/**
 * Get user type
 * @returns User type or null if not logged in
 */
export const getUserType = (): 'driver' | 'equipmentOwner' | null => {
  const session = getSession();
  return session ? session.userType : null;
};

/**
 * Logout user
 */
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
};

/**
 * Get WhatsApp group link for verification
 * @returns WhatsApp group link
 */
export const getWhatsAppGroupLink = (): string => {
  // This would be replaced with the actual WhatsApp group link
  return 'https://chat.whatsapp.com/example-group-link';
};
