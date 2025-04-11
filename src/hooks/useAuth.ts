import { useState } from 'react';
import { 
  loginUser as authLogin,
  logout as authLogout,
  getSession,
  getUserType
} from '@/lib/firebase/auth';

export const useAuth = () => {
  const [userType, setUserType] = useState(getUserType());

  const login = async (phoneNumber: string, password: string) => {
    const response = await authLogin(phoneNumber, password);
    if (response.success) {
      setUserType(getUserType());
    }
    return response;
  };

  const logout = () => {
    authLogout();
    setUserType(null);
  };

  return {
    userType,
    login,
    logout,
    getSession,
    getUserType
  };
};