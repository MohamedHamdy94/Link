"use client";

import React, { useState } from 'react';
import { loginUser } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

const LoginForm = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginUser(phoneNumber, password);
      
      if (result.success) {
        // Redirect based on user type
        if (result.data?.userType === 'driver') {
          router.push('/driver/profile');
        } else {
          router.push('/equipment-owner/profile');
        }
      } else {
        setError(result.error || 'حدث خطأ أثناء تسجيل الدخول');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">تسجيل الدخول</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 text-right mb-1">
            رقم الهاتف
          </label>
          <input
            id="phoneNumber"
            type="tel"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="أدخل رقم الهاتف"
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
            placeholder="أدخل كلمة المرور"
            dir="rtl"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          ليس لديك حساب؟{' '}
          <a href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
            سجل الآن
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
