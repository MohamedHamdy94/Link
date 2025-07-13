"use client";

import React, { useState, useEffect } from 'react';
import { updatePassword } from '@/app/auth/actions';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { auth } from '@/lib/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getIdTokenResult } from 'firebase/auth';

const UpdatePasswordForm = () => {
  const [message, setMessage] = useState<string | object>('');
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [user, loading] = useAuthState(auth);
  const [userType, setUserType] = useState<string | null>(null);

  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchUserType = async () => {
      if (!loading && user) {
        try {
          const tokenResult = await getIdTokenResult(user);
          const userTypeFromClaims = tokenResult.claims.userType as string | undefined;
          console.log(tokenResult)
          setUserType(userTypeFromClaims || null);
        } catch (error) {
          console.error("حدث خطأ أثناء جلب userType:", error);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfileLoading(false);
      }
    };

    fetchUserType();
  }, [user, loading]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage('');

    if (!user || !userType) {
      setMessage('يجب تسجيل الدخول وتحديد نوع المستخدم لتغيير كلمة المرور.');
      setSuccess(false);
      setPending(false);
      return;
    }

    const formData = new FormData(event.currentTarget);

    try {
      const result = await updatePassword(
        { message: '', success: false },
        user.uid,
        userType as 'drivers' | 'equipmentOwners',
        formData
      );

      setMessage(result.message );
      setSuccess(result.success);
    } catch (error) {
      console.error("خطأ أثناء تحديث كلمة المرور:", error);
      setMessage("حدث خطأ أثناء تحديث كلمة المرور.");
      setSuccess(false);
    }

    setPending(false);
  };

  if (loading || profileLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-red-600">
        يرجى تسجيل الدخول لتعديل كلمة المرور.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <p className={`text-center text-sm ${success ? 'text-green-600' : 'text-red-600'}`}>
          {message as string}
        </p>
      )}
      <div>
        <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
          كلمة المرور القديمة
        </label>
        <Input
          id="oldPassword"
          name="oldPassword"
          type="password"
          required
          placeholder="أدخل كلمة المرور القديمة"
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
          كلمة المرور الجديدة
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          placeholder="أدخل كلمة المرور الجديدة"
        />
      </div>
      <div>
        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
          تأكيد كلمة المرور الجديدة
        </label>
        <Input
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          required
          placeholder="أعد إدخال كلمة المرور الجديدة"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'جاري التحديث...' : 'تعديل كلمة المرور'}
      </Button>
    </form>
  );
};

export default UpdatePasswordForm;
