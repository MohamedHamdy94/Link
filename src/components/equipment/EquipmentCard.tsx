import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Equipment } from '@/lib/interface'; // Keep this for the prop type


interface EquipmentCardProps {
  item: Equipment;
  showAdminControls?: boolean;
}

const EquipmentCard = ({ item, showAdminControls = false }: EquipmentCardProps) => {
  const cardContent = (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <div className="relative w-full h-48 bg-gray-200">
        <Image
          src={item.photoUrls?.[0] || '/images/imagesProfile.jpg'} // Show only the first image
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
            <div className="flex flex-col items-end"> {/* New div for name and avatar */}
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mt-1"> {/* New div for owner name and avatar */}
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
  );

  return (
    <> 
      {showAdminControls ? (
        <div className="relative">
          {cardContent}
          <Link
            href={`/equipment-owner/edit-equipment/${item.fbId}`}
            className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-white rounded-md text-xs hover:bg-yellow-500"
          >
            تعديل
          </Link>
        </div>
      ) : (
        <Link href={`/equipment/${item.id}`} className="h-full block">
          {cardContent}
        </Link>
      )}
    </>
  );
};

export default EquipmentCard;