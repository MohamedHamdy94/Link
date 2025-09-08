"use client";

import React, { useState, useEffect } from 'react';
import { updatePasswordAction } from '@/app/auth/actions';
import { UserType } from '@/lib/interface';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { auth } from '@/lib/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getIdTokenResult } from 'firebase/auth';

import { useRouter } from 'next/navigation';

const UpdatePasswordForm = () => {
  const router = useRouter();
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
    const newPassword = formData.get('newPassword') as string;
    const confirmNewPassword = formData.get('confirmNewPassword') as string;

    if (newPassword !== confirmNewPassword) {
      setMessage('كلمة المرور الجديدة وتأكيدها غير متطابقين.');
      setSuccess(false);
      setPending(false);
      return;
    }

    try {
      const phoneNumberMatch = user.email?.match(/^(\+?\d+)@/);
      const phoneNumber = phoneNumberMatch ? phoneNumberMatch[1] : null;

      if (!phoneNumber) {
        setMessage('فشل في الحصول على رقم الهاتف من حساب المستخدم.');
        setSuccess(false);
        setPending(false);
        return;
      }

      const result = await updatePasswordAction(
        user.uid, // تمرير UID
        phoneNumber, // تمرير رقم الهاتف
        userType as UserType,
        formData.get('oldPassword') as string,
        formData.get('newPassword') as string
      );

      console.log('Update password action result:', result); // إضافة log هنا
      setMessage(result.message || 'حدث خطأ غير معروف');
      setSuccess(result.success);

      if (result.success) {
        console.log('Password update successful. Preparing for redirection...'); // إضافة log هنا
        setTimeout(() => {
          let profilePath = '';
          if (userType === 'drivers') {
            profilePath = '/driver/profile';
          } else if (userType === 'equipmentOwners') {
            profilePath = '/equipment-owner/profile';
          }
          else if (userType === 'admins') {
            profilePath = '/admin/dashboard'; // أو أي مسار مناسب للمسؤول
          }
          console.log('User type:', userType, 'Calculated profile path:', profilePath); // إضافة log هنا
          if (profilePath) {
            router.push(profilePath);
            console.log('Attempting to redirect to:', profilePath); // إضافة log هنا
          } else {
            console.warn('No profile path determined for user type:', userType); // إضافة log هنا
          }
        }, 2000); // تأخير لمدة ثانيتين
      }
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
