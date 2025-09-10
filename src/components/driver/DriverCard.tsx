import { Driver } from '@/lib/interface';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';


const DriverCard: React.FC<{ driver: Driver }> = ({ driver }) => {
  if (!driver || !driver.id) {
    // Don't render the card if the driver or its ID is missing.
    return null;
  }

  return (
    <Link href={`/driver/${encodeURIComponent(driver.id)}`} className="block h-full">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 h-full flex flex-col">
        {/* صورة السائق بأبعاد ثابتة */}
        <div className="relative w-full h-48 overflow-hidden"> {/* ارتفاع ثابت */}
          <Image
            src={driver.photoUrl || '/images/imagesProfile.jpg'}
            alt={driver.name || 'صورة السائق'}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 50vw, 33vw" // إضافة خاصية sizes هنا
          />
          {/* شارة التوفر */}
          <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            متاح
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div className="p-2 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate text-right">{driver.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-right mt-1">سائق {driver.equipmentType} </p>
          </div>

          <div className="mt-3 flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300 text-sm">{driver.age} سنة</span>
            {driver.hasLicense && (
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold px-1 py-1 rounded">
                يحمل رخصة اصلية
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DriverCard;