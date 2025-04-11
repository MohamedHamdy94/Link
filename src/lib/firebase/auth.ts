"use client";

import { db } from './config';
import { doc, getDoc } from 'firebase/firestore';

// Custom authentication functions
let currentSession: {
  id: string;
  phoneNumber: string;
  userType: 'drivers' | 'equipmentOwners' | 'admins';
  role?: string;
} | null = null;

// Login user
export const loginUser = async (phoneNumber: string, password: string) => {
  try {
    // Check if user exists in drivers collection
    const driverSnapshot = await getDoc(doc(db, 'drivers', phoneNumber));
    if (driverSnapshot.exists()) {
      const driverData = driverSnapshot.data();
      if (driverData.password === password) {
        // Set session
        currentSession = {
          id: phoneNumber,
          phoneNumber,
          userType: 'drivers'
        };
        return { success: true, userType: 'drivers' };
      }
    }

    // Check if user exists in equipment owners collection
    const ownerSnapshot = await getDoc(doc(db, 'equipmentOwners', phoneNumber));
    if (ownerSnapshot.exists()) {
      const ownerData = ownerSnapshot.data();
      if (ownerData.password === password) {
        // Set session
        currentSession = {
          id: phoneNumber,
          phoneNumber,
          userType: 'equipmentOwners'
        };
        return { success: true, userType: 'equipmentOwners' };
      }
    }
    
    // Check if user is admin
    const adminSnapshot = await getDoc(doc(db, 'admins', phoneNumber));
    
    if (adminSnapshot.exists()) {
      const adminData = adminSnapshot.data();
      if (adminData.password === password) {
        // Set session
        currentSession = {
          id: phoneNumber,
          phoneNumber,
          userType: 'admins',
          role: 'admin'
        };
        return { success: true, userType: 'admins' };
      }
    }

    return { success: false, error: 'رقم الهاتف أو كلمة المرور غير صحيحة' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
  }
};

// Get current session
export const getSession = () => {
  return currentSession;
};

// Get user type
export const getUserType = (): 'drivers' | 'equipmentOwners' | 'admins' | null => {
  return currentSession?.userType ?? null;
};

// Logout
export const logout = () => {
  currentSession = null;
};

// Get WhatsApp group link
export const getWhatsAppGroupLink = () => {
  return 'https://chat.whatsapp.com/example-group-link';
};
