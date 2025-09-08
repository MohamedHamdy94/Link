'use client';

import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Suspense } from 'react';

// This component is needed to wrap the form and allow it to use useSearchParams
const ResetPasswordPageContent = () => {
  return <ResetPasswordForm />;
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordPageContent />
        </Suspense>
      </div>
    </div>
  );
}
