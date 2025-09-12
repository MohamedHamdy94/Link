'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSignInWithEmailAndPassword, useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';

const LoginForm = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [customError, setCustomError] = useState('');
  const [loading, setLoading] = useState(false);

  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const [user, loadingUser] = useAuthState(auth);

  useEffect(() => {
    const redirectUser = async () => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult(true);
        const userType = idTokenResult.claims.userType;

        switch (userType) {
          case 'drivers':
            router.push('/driver/profile');
            break;
          case 'equipmentOwners':
            router.push('/equipment-owner/profile');
            break;
          case 'admins':
            router.push('/admin/dashboard');
            break;
          default:
            router.push('/auth/complete-profile');
        }
      }
    };

    redirectUser();
  }, [user, router]);

  if (loadingUser || user) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');
    setLoading(true);

    const egyptianPhoneRegex = /^(010|011|012|015)\d{8}$/;
    if (!egyptianPhoneRegex.test(phoneNumber)) {
        setCustomError('يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقمًا.');
        setLoading(false);
        return;
    }

    try {
      // Convert local phone number to full E.164 format for authentication
      const fullPhoneNumber = `+20${phoneNumber.substring(1)}`;
      const email = `${fullPhoneNumber}@app.com`;

      // Step 1: Authenticate with Firebase to get a user session
      const userCredential = await signInWithEmailAndPassword(email, password);

      if (!userCredential) {
        // This case might be redundant as signInWithEmailAndPassword throws on failure
        setCustomError('فشل في تسجيل الدخول. يرجى التحقق من رقم الهاتف وكلمة المرور.');
        setLoading(false);
        return;
      }

      // On successful Firebase Auth, get the custom claims to decide redirection
      const idTokenResult = await userCredential.user.getIdTokenResult(true); // Force refresh to get latest claims
      const userType = idTokenResult.claims.userType;

      // Redirect based on userType claim
      switch (userType) {
        case 'drivers':
          router.push('/driver/profile');
          break;
        case 'equipmentOwners':
          router.push('/equipment-owner/profile');
          break;
        case 'admins':
          router.push('/admin/dashboard');
          break;
        default:
          // This case is important for users who completed registration but claims are not set yet
          // or if they don't have a userType for some reason.
          setCustomError('لم يتم تحديد نوع المستخدم. قد تحتاج إلى إكمال ملفك الشخصي.');
          router.push('/auth/complete-profile'); // Redirect to complete profile
      }

    } catch (err) {
      // Handle specific Firebase Auth errors
      if (err instanceof Error && 'code' in err) {
        const firebaseError = err as { code: string };
        if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
          setCustomError('رقم الهاتف أو كلمة المرور غير صحيحة.');
        } else {
          setCustomError('حدث خطأ أثناء تسجيل الدخول: ' + err.message);
        }
      } else {
         setCustomError('حدث خطأ غير متوقع.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">تسجيل الدخول</h2>

      {customError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">
          {customError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 text-right mb-1">
            رقم الهاتف المصري
          </label>
          <input
            id="phoneNumber"
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            dir="ltr"
            placeholder="01xxxxxxxxx"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-right mb-1">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="rtl"
          />
        </div>

        <div className="text-left">
          <a href="/auth/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            نسيت كلمة المرور؟
          </a>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          ليس لديك حساب؟
          <a href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
            إنشاء حساب جديد
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
