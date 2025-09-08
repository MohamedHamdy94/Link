'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { checkUserExistsByPhone } from '@/app/auth/actions';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const ForgotPasswordForm = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  const initializeRecaptcha = useCallback(() => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, {
      size: 'invisible',
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

    const egyptianPhoneRegex = /^(010|011|012|015)\d{8}$/;
    if (!egyptianPhoneRegex.test(phoneNumber)) {
      setError('يرجى إدخال رقم هاتف مصري صحيح.');
      setLoading(false);
      return;
    }

    const fullPhoneNumber = `+20${phoneNumber.substring(1)}`;

    try {
      // 1. Check if user exists
      const userCheck = await checkUserExistsByPhone(fullPhoneNumber);
      if (!userCheck.exists) {
        setError('هذا الرقم غير مسجل لدينا. يرجى التأكد من الرقم أو إنشاء حساب جديد.');
        setLoading(false);
        return;
      }

      // 2. Send OTP
      const recaptchaVerifier = initializeRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء إرسال رمز التحقق. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!confirmationResult) {
      setError('حدث خطأ. يرجى محاولة إرسال الرمز مرة أخرى.');
      setLoading(false);
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      // Redirect to the reset password page with the phone number
      router.push(`/auth/reset-password?phoneNumber=${encodeURIComponent(phoneNumber)}`);
    } catch (err) {
      console.error('OTP Verification Error:', err);
      setError('رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 px-6 shadow-lg rounded-xl w-full">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {!otpSent ? 'استعادة كلمة المرور' : 'التحقق من الرمز'}
        </h2>
        <p className="text-gray-600 mt-2">
          {!otpSent ? 'أدخل رقم هاتفك المسجل لإرسال كود التحقق.' : `أدخل الرمز الذي تم إرساله إلى ${phoneNumber}`}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md text-right">
          <p>{error}</p>
        </div>
      )}

      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div className="relative">
            <input
              id="phoneNumber"
              type="tel"
              required
              className="w-full pr-3 pl-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              dir="ltr"
              placeholder="01xxxxxxxxx"
              maxLength={11}
            />
          </div>
          <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
          <button type="submit" disabled={loading} className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700`}>
            {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="relative">
            <input
              id="otp"
              type="text"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg ..."
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              dir="ltr"
              maxLength={6}
              autoFocus
              placeholder="- - - - - -"
            />
          </div>
          <button type="submit" disabled={loading} className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700`}>
            {loading ? 'جاري التحقق...' : 'التحقق والمتابعة'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
