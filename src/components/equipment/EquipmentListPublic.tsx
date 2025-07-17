"use client";
import React, { useState } from 'react';
import FilterButtons from '../ui/FilterButtons';
import { Equipment } from '@/lib/interface';
import Image from 'next/image';

interface EquipmentListPublicProps {
  equipments: Equipment[];
}

const EquipmentListPublic = ({ equipments }: EquipmentListPublicProps) => {
  const [filterType, setFilterType] = useState('all');
  const [filter, setFilter] = useState('مانلفت');

  // مكون البادج المعدل
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      rent: { 
        text: 'للإيجار', 
        bgColor: 'bg-blue-600',
      },
      sale: { 
        text: 'للبيع', 
        bgColor: 'bg-green-600',
      },
      work: { 
        text: 'في العمل', 
        bgColor: 'bg-yellow-500',
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    
    if (!config) return null;

    return (
      <div className="absolute top-3 left-3 z-10">
        <span className={`py-1 px-3 inline-flex items-center gap-x-1 text-sm font-medium ${config.bgColor} text-white rounded-full`}>
          <CheckIcon />
          {config.text}
        </span>
      </div>
    );
  };

  // أيقونة البادج
  function CheckIcon() {
    return (
      <svg className="shrink-0 size-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
      </svg>
    );
  }

  const filteredEquipment = filterType === 'all' 
    ? equipments.filter(item => item.equipmentType === filter)
    : equipments.filter(item => item.status === filterType && item.equipmentType === filter);

  return (
    <div className="bg-gray-50 p-4 md:p-8 rounded-lg shadow-md max-w-6xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-right">
        المعدات المتاحة
      </h2>

      <div className="my-1">
        <FilterButtons filter={filter} setFilter={setFilter} />
      </div>

      <div className="flex flex-wrap gap-2 my-4">
        {['all', 'rent', 'sale'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-md text-xs md:text-sm ${
              filterType === type 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {type === 'all' ? 'الكل' : type === 'rent' ? 'للإيجار' : 'للبيع' }
          </button>
        ))}
      </div>
      
      {filteredEquipment.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">لا توجد معدات متاحة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((item) => (
            <div key={item.id} className="bg-white relative overflow-hidden shadow-md rounded-lg flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
              <StatusBadge status={item.status} />
              
              <div className="w-full overflow-hidden aspect-w-16 aspect-h-9">
                {item.photoUrl ? (
                  <Image
                    width={500}
                    height={500}
                    src={item.photoUrl} 
                    alt={item.name} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">لا توجد صورة</span>
                  </div>
                )}
              </div>
              
              <div className="p-3 md:p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 text-right">
                    {item.name}
                  </h3>
                </div>
                
                <div className="mt-2 text-right flex-grow">
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium text-gray-900">
                    {item.price} جنيه {item.status === 'rent' ? '/ يوم' : ''}
                  </span>
                  <span className="text-xs md:text-sm text-gray-500">
                    {item.equipmentType}
                  </span>
                </div>
                
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <a 
                      href={`tel:${item.ownerPhone}`}
                      className="text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium"
                    >
                      اتصل بالمالك
                    </a>
                    <span className="text-xs md:text-sm text-gray-500 dir-ltr">
                      {item.ownerPhone}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentListPublic;