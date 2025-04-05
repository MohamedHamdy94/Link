import Image from 'next/image';
import React from 'react';

// تعريف نوع البيانات الكامل للسائق
interface Driver {
  photoUrl?: string;
  name: string;
  equipmentType: string;
  age: number;
  phoneNumber: string;
  hasLicense?: boolean;
}

const DriverCard: React.FC<{ driver: Driver }> = ({ driver }) => {
  return (
    <div className="bg-gray-10 dark:bg-gray-700 relative shadow-xl overflow-hidden hover:shadow-2xl group rounded-xl p-2 sm:px-2 transition-all duration-500 transform">
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4">
        {/* صورة السائق */}
        <Image
          width={100}
          height={100}
          src={driver.photoUrl || "https://firebasestorage.googleapis.com/v0/b/manlift-36e37.appspot.com/o/project%2FimagesProfile.jpg?alt=media&token=f6213de6-0c3c-466c-adc2-3003d0da528e"}
          className="w-32 h-32 object-center object-cover rounded-full transition-all duration-500 delay-500 transform"
          alt="Avatar"
          priority={!driver.photoUrl}
        />
        
        {/* معلومات السائق */}
        <div className="transition-all transform duration-500">
          <h1 className="text-gray-600 dark:text-gray-200 font-bold">
            {driver.name}
          </h1>
          <h1 className="text-gray-600 dark:text-gray-200 font-bold">
            سائق {driver.equipmentType}
          </h1>
          <h1 className="text-gray-600 dark:text-gray-200 font-bold">
            {driver.age} سنة
          </h1>
          <h1 className="text-gray-600 dark:text-gray-200 font-bold">
            {driver.phoneNumber}
          </h1>

          {driver.hasLicense && (
            <h1 className="text-gray-400 font-bold">رخصة أصلية</h1>
          )}
        </div>
      </div>

      {/* حالة التوفر */}
      <div className="absolute top-1 delay-300 -bottom-16 transition-all duration-500 lift-1 rounded-lg">
        <div className="inline-flex flex-wrap gap-2">
          <div>
            <span className="py-1 px-2 inline-flex items-center gap-x-1 text-sm font-medium bg-green-600 text-teal-100 rounded-full">
              <svg
                className="shrink-0 size-5"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              متاح
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;