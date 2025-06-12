"use client";

import React, { useState, useEffect } from 'react';
import FilterButtons from '../ui/FilterButtons';
import { getEquipments } from '@/lib/firebase/firestore';
import { Equipment } from '@/lib/interface';
import Image from 'next/image';

const EquipmentListPublic = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
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
        bgColor: 'bg-yellow-600',
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

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const result = await getEquipments();
        if (result.success) {
          setEquipment(result.data as Equipment[]);
        } else {
          setError('فشل في تحميل بيانات المعدات');
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEquipment();
  }, []);
  
  const filteredEquipment = filterType === 'all' 
    ? equipment.filter(item => item.equipmentType === filter)
    : equipment.filter(item => item.status === filterType && item.equipmentType === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 md:p-8 rounded-lg shadow-md max-w-6xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-right">
        المعدات المتاحة
      </h2>

      <div className="my-1">
        <FilterButtons filter={filter} setFilter={setFilter} />
      </div>

      <div className="flex flex-wrap gap-2 my-4">
        {['all', 'rent', 'sale','work'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-md text-xs md:text-sm ${
              filterType === type 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {type === 'all' ? 'الكل' : type === 'rent' ? 'للإيجار' :type === 'sale' ? 'للبيع':'في العمل'}
          </button>
        ))}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right text-sm">
          {error}
        </div>
      )}
      
      {filteredEquipment.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">لا توجد معدات متاحة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((item) => (
            <div key={item.id} className="bg-white relative overflow-hidden shadow-md rounded-lg flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
              <StatusBadge status={item.status} />
              
              <div className="h-48 w-full overflow-hidden">
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
                    {item.price} ريال {item.status === 'rent' ? '/ يوم' : ''}
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