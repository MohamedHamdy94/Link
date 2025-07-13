"use client";

import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm';
import React from 'react';

const UpdatePasswordPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">تعديل كلمة المرور</h2>
        <UpdatePasswordForm />
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
