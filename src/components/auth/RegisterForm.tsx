'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const RegisterForm = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const [user, loadingUser] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      const userType = localStorage.getItem('userType');
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
          // If userType is not in localStorage, maybe they need to complete their profile
          router.push('/auth/complete-profile');
      }
    }
  }, [user, router]);

  if (loadingUser || user) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
  }

  const initializeRecaptcha = useCallback(() => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow sign up
      },
      'expired-callback': () => {
        setError('انتهت صلاحية reCAPTCHA. يرجى المحاولة مرة أخرى.');
      },
    });
    return recaptchaVerifier;
  }, []);

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (process.env.NODE_ENV !== 'development') {
      const egyptianPhoneRegex = /^(010|011|012|015)\d{8}$/;
      if (!egyptianPhoneRegex.test(phoneNumber)) {
        setError('يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقمًا (مثال: 01xxxxxxxxx)');
        setLoading(false);
        return;
      }
    }

    try {
      let fullPhoneNumber = phoneNumber;
      if (!fullPhoneNumber.startsWith('+')) {
        fullPhoneNumber = `+20${phoneNumber.substring(1)}`;
      }
      console.log('Full phone number being sent to Firebase:', fullPhoneNumber);

      const recaptchaVerifier = initializeRecaptcha();

      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        recaptchaVerifier
      );

      setConfirmationResult(confirmation);
      setOtpSent(true);
      setLoading(false);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err) {
        const errorCode = (err as { code: string }).code;
        if (errorCode === 'auth/too-many-requests') {
          setError('لقد تجاوزت عدد المحاولات المسموح بها. يرجى المحاولة مرة أخرى لاحقًا.');
        } else if (errorCode === 'auth/invalid-phone-number') {
          setError('رقم الهاتف غير صحيح. يرجى إدخال رقم هاتف مصري صالح.');
        } else {
          setError('حدث خطأ في إرسال رمز التحقق. تأكد من صحة الرقم وأنك لا تستخدم وضع التصفح المتخفي.');
        }
      } else {
        setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }

      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!otp) {
      setError('يرجى إدخال رمز التحقق.');
      setLoading(false);
      return;
    }

    try {
      if (!confirmationResult) {
        throw new Error('لا يوجد تأكيد للنتيجة');
      }

      await confirmationResult.confirm(otp);
      router.push(`/auth/complete-profile?phoneNumber=${encodeURIComponent(phoneNumber)}`);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err) {
        const errorCode = (err as { code: string }).code;
        if (errorCode === 'auth/invalid-verification-code') {
          setError('رمز التحقق غير صحيح. يرجى إدخال الرمز الصحيح.');
        } else {
          setError('حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى.');
        }
      } else {
        setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtpSent(false);
    setOtp('');
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
  };

  return (
    <div className="bg-white py-8 px-6 shadow-lg rounded-xl w-full max-w-md">
      {/* Header */}
      <div className="mb-8 text-center">
        <Image src="/images/link.jpg" alt="Link Logo" width={80} height={80} className="mx-auto mb-4 rounded-full" />
        <h2 className="text-2xl font-bold text-gray-900">
          {!otpSent ? 'إنشاء حساب جديد' : 'التحقق من الرمز'}
        </h2>
        <p className="text-gray-600 mt-2">
          {!otpSent ? 'أدخل رقم هاتفك لتلقي رمز التحقق.' : `أدخل الرمز المكون من 6 أرقام الذي تم إرساله إلى ${phoneNumber}`}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md text-right">
          <p>{error}</p>
        </div>
      )}

      {/* Form Stages */}
      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.76a11.024 11.024 0 008.57 8.57l.76-1.518a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
            </div>
            <input
              id="phoneNumber"
              type="tel"
              required
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              dir="ltr"
              placeholder="01xxxxxxxxx"
              maxLength={11}
            />
          </div>

          <div id="recaptcha-container" ref={recaptchaContainerRef} />

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zM7 8a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>
            </div>
            <input
              id="otp"
              type="text"
              required
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-[.5em]"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              dir="ltr"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              placeholder="- - - - - -"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'جاري التحقق...' : 'التحقق والمتابعة'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 underline disabled:text-gray-400"
            >
              لم تستلم الرمز؟ إعادة إرسال
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          لديك حساب بالفعل؟
          <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
            تسجيل الدخول
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
