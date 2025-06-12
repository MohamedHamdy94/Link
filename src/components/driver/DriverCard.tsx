import { Driver } from '@/lib/interface';
import Image from 'next/image';
import React from 'react';

const DriverCard: React.FC<{ driver: Driver }> = ({ driver }) => {
  if (!driver.isAvailable) {
    return (
      <div className=" text-center  py-12">
        <p className="text-center text-gray-500">لا يوجد سائقين متاحين حالياً</p>
      </div>
    ); // أو يمكنك إرجاع بديل آخر
  }
  return driver.isVerified && (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
      {/* صورة السائق بأبعاد ثابتة */}
      <div className="relative w-full h-48">
        <Image
          src={driver.photoUrl || '/images/imagesProfile.jpg'}
          alt={driver.name || 'صورة السائق'}
          fill
          className="object-cover"
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* شارة التوفر */}
        {driver.isAvailable && (
          <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            متاح
          </div>
        )}
      </div>

      {/* محتوى البطاقة */}
      <div className="p-2">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white truncate">{driver.name}</h3>
        </div>

        <div className="flex items-center mb-2">
        
          {driver.hasLicense && (
            <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-2 py-1 rounded">
              رخصة أصلية
            </span>
          )}
                    <span className="text-gray-600 dark:text-gray-300 text-sm ms-2">{driver.age} سنة</span>

        </div>

  
        <a href={`tel:${driver.phoneNumber}`} className="text-blue-600 dark:text-blue-400 hover:underline">

          <div className=" flex items-center  w-full mt-4 bg-green-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors duration-300">
      <div>         اتصل  الآن </div>      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>   </div>
          </a>

        
      </div>
    </div>
  );
};

export default DriverCard;