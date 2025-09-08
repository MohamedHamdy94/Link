'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPasswordAction } from '@/app/auth/actions';

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phoneNumber');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If there's no phone number, redirect away
    if (!phoneNumber) {
      router.push('/auth/login');
    }
  }, [phoneNumber, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة.');
      return;
    }

    if (!phoneNumber) {
      setError('رقم الهاتف غير موجود. لا يمكن المتابعة.');
      return;
    }

    setLoading(true);

    try {
      const fullPhoneNumber = `+20${phoneNumber.substring(1)}`;
      const result = await resetPasswordAction(fullPhoneNumber, password);

      if (result.success) {
        setSuccess('تم تغيير كلمة المرور بنجاح! سيتم توجيهك لتسجيل الدخول.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(result.error || 'حدث خطأ غير متوقع.');
      }
    } catch (err) {
      console.error('Reset Password Submit Error:', err);
      setError('حدث خطأ فادح. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (!phoneNumber) {
    return null; // Render nothing while redirecting
  }

  return (
    <div className="bg-white py-8 px-6 shadow-lg rounded-xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">تعيين كلمة مرور جديدة</h2>
        <p className="text-gray-600 mt-2">أدخل كلمة المرور الجديدة لحسابك.</p>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-md text-right">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 mb-4 rounded-md text-right">{success}</div>}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 text-right mb-1">كلمة المرور الجديدة</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 text-right mb-1">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className={`w-full px-4 py-2.5 ...`}>
            {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordForm;
