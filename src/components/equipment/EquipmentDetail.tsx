'use client';

import { Equipment } from '@/lib/interface';
import Image from 'next/image';
import EquipmentImageGallery from './EquipmentImageGallery';


interface EquipmentDetailProps {
  equipment: Equipment;
}

const EquipmentDetail = ({ equipment }: EquipmentDetailProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Image Gallery */}
      <EquipmentImageGallery photoUrls={equipment.photoUrls} />

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content (Left/Top) */}
          <div className="md:col-span-2 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-right">{equipment.name}</h1>
            <div className="flex justify-end items-center gap-4">
              <span className="px-3 py-1 text-sm rounded-full font-medium bg-blue-100 text-blue-800">
                {equipment.equipmentType}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${equipment.status === 'rent' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                {equipment.status === 'rent' ? 'للإيجار' : 'للبيع'}
              </span>
            </div>
            <p className="text-lg text-right font-semibold text-gray-800 mt-4">
              {equipment.priceOnRequest ? 'السعر عند الطلب' : `${equipment.price} جنيه ${equipment.status === 'rent' ? '/ يوم' : ''}`}
            </p>
            <div className="text-right mt-4 border-t pt-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">الوصف</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{equipment.description}</p>
            </div>
          </div>

          {/* Owner Info Card (Right/Bottom) */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 h-full flex flex-col">
              {/* Owner Image Banner */}
              <div className="relative w-full h-48">
                <Image
                  src={equipment.ownerPhotoUrl || '/images/imagesProfile.jpg'}
                  alt={equipment.ownerName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Owner Details */}
              <div className="p-4 flex-grow flex flex-col">
                <div className="text-right mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">معلومات المالك</h2>
                  <p className="font-bold text-gray-900 dark:text-white text-lg mt-2">{equipment.ownerName}</p>
                  {equipment.ownerAddress && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{equipment.ownerAddress}</p>}
                </div>

                {/* Spacer to push button to the bottom */}
                <div className="flex-grow"></div>

                {/* Call Button */}
                <a
                  href={`tel:${equipment.ownerPhone}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.76a11.024 11.024 0 008.57 8.57l.76-1.518a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                  <span>اتصل بالمالك</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;