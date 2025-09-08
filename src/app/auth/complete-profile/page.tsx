import CompleteProfileForm from '@/components/auth/CompleteProfileForm';
import { Suspense } from 'react';

export default function CompleteProfilePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-6 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-4">
          إكمال إنشاء الحساب
        </h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <CompleteProfileForm />
        </Suspense>
      </div>
    </div>
  );
}
