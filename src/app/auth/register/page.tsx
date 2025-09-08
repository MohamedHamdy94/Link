'use client';

import dynamic from 'next/dynamic';
import Script from 'next/script';

const RegisterForm = dynamic(() => import('@/components/auth/RegisterForm'), { 
  ssr: false 
});

export default function RegisterPage() {
  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        strategy="beforeInteractive"
      />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <RegisterForm />
        </div>
      </div>
    </>
  );
}
