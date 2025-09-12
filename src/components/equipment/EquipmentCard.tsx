import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Equipment } from '@/lib/interface'; // Keep this for the prop type


interface EquipmentCardProps {
  item: Equipment;
  showAdminControls?: boolean;
}

const EquipmentCard = ({ item, showAdminControls = false }: EquipmentCardProps) => {
  if (showAdminControls) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
        <div className="relative w-full h-48 bg-gray-200">
          <Image
            src={item.photoUrls?.[0] || '/images/imagesProfile.jpg'}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="p-3 md:p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-start">
            <span className={`px-2 py-1 text-xs rounded-full ${
              item.status === 'rent'
                ? 'bg-blue-100 text-blue-800'
                : item.status === 'sale'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {item.status === 'rent' ? 'للإيجار' : item.status === 'sale' ? 'للبيع' : 'تعمل'}
            </span>
            <div className="flex items-center gap-3 text-right">
              <div className="flex flex-col items-end">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">
                    {item.ownerName}
                  </span>
                  <Image width={32} height={32} className="w-8 h-8 rounded-full object-cover" src={item.ownerPhotoUrl || '/images/imagesProfile.jpg'} alt={item.ownerName || 'Owner'} />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 text-right flex-grow">
            <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
              {item.description}
            </p>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-xs md:text-sm font-medium text-gray-900">
              {item.priceOnRequest ? 'السعر عند الطلب' : `${item.price} جنيه ${item.status === 'rent' ? '/ يوم' : ''}`}
            </span>
            <span className="text-xs md:text-sm text-gray-500">
              {item.equipmentType}
            </span>
          </div>
        </div>
        <div className="p-2 border-t border-gray-200 bg-gray-50">
          <Link
            href={`/equipment-owner/edit-equipment/${item.fbId}`}
            className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 5.232z" />
            </svg>
            تعديل بيانات المعدة
          </Link>
        </div>
      </div>
    );
  }

  // Default card (for non-admins)
  return (
    <Link href={`/equipment/${item.id}`} className="h-full block">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
        <div className="relative w-full h-48 bg-gray-200">
          <Image
            src={item.photoUrls?.[0] || '/images/imagesProfile.jpg'}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="p-3 md:p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-start">
            <span className={`px-2 py-1 text-xs rounded-full ${
              item.status === 'rent'
                ? 'bg-blue-100 text-blue-800'
                : item.status === 'sale'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {item.status === 'rent' ? 'للإيجار' : item.status === 'sale' ? 'للبيع' : 'تعمل'}
            </span>
            <div className="flex items-center gap-3 text-right">
              <div className="flex flex-col items-end">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">
                    {item.ownerName}
                  </span>
                  <Image width={32} height={32} className="w-8 h-8 rounded-full object-cover" src={item.ownerPhotoUrl || '/images/imagesProfile.jpg'} alt={item.ownerName || 'Owner'} />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 text-right flex-grow">
            <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
              {item.description}
            </p>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-xs md:text-sm font-medium text-gray-900">
              {item.priceOnRequest ? 'السعر عند الطلب' : `${item.price} جنيه ${item.status === 'rent' ? '/ يوم' : ''}`}
            </span>
            <span className="text-xs md:text-sm text-gray-500">
              {item.equipmentType}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EquipmentCard;
