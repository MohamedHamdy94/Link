'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUserAction } from '@/app/auth/actions';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';

const LoginForm = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [customError, setCustomError] = useState('');
  const [loading, setLoading] = useState(false);

  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');
    setLoading(true);

    try {
      // Step 1: Authenticate with Firebase to get a user session
      const email = `${phoneNumber}@app.com`;
      const userCredential = await signInWithEmailAndPassword(email, password);

      if (!userCredential) {
        setCustomError('فشل في تسجيل الدخول. يرجى التحقق من رقم الهاتف وكلمة المرور.');
        setLoading(false);
        return;
      }

      // Step 2: Call the Server Action to verify user details in Firestore
      const result = await loginUserAction(phoneNumber, password);

      if (result.success) {
        // On success, redirect to the correct profile page
        switch (result.userType) {
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
            setCustomError('نوع المستخدم غير معروف');
        }
      } else {
        setCustomError(result.error || 'فشل في التحقق من بيانات المستخدم.');
      }
    } catch (err) {
      // This will catch errors from both Firebase auth and the server action
      setCustomError(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول');
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
            رقم الهاتف
          </label>
          <input
            id="phoneNumber"
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            dir="rtl"
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
