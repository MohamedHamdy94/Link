"use client";

import React, { useState, useEffect } from 'react';
import FilterButtons from '../ui/FilterButtons';
import {  getEquipments } from '@/lib/firebase/firestore';
import {  Equipment } from '@/lib/interface';

const EquipmentListPublic = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filterType, setFilterType] = useState('all'); 
  const [filter, setFilter] = useState('مانلفت');
  
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
         const result = await getEquipments();
            if (result.success) {
              setEquipment(result.data as Equipment[] );
              setLoading(false);
            } else {
              setError('فشل في تحميل بيانات السائق');
            }
        // setEquipment([
        //   {
        //     id: '1',
        //     name: 'حفار كاتربيلر',
        //     description: 'حفار كاتربيلر موديل 2020 بحالة ممتازة',
        //     equipmentType: 'حفار',
        //     status: 'rent',
        //     price: 1500,
        //     photoUrl: '',
        //     ownerId: '1',
        //     ownerPhone: '0123456789',
        //   },
        //   {
        //     id: '2',
        //     name: 'لودر كوماتسو',
        //     description: 'لودر كوماتسو موديل 2019 للبيع',
        //     equipmentType: 'لودر',
        //     status: 'sale',
        //     price: 250000,
        //     photoUrl: '',
        //     ownerId: '2',
        //     ownerPhone: '0123456788',
        //   },
        //   {
        //     id: '3',
        //     name: 'جرافة JCB',
        //     description: 'جرافة JCB موديل 2021 للإيجار اليومي أو الأسبوعي',
        //     equipmentType: 'مانلفت',
        //     status: 'rent',
        //     price: 1200,
        //     photoUrl: '',
        //     ownerId: '1',
        //     ownerPhone: '0123456789',
        //   },
        // ]);
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
    ? equipment .filter(item => item.equipmentType === filter )
    : equipment.filter(item => item.status === filterType && item.equipmentType === filter );
    
    // const filteredEquipment = equipment.filter(
    //   (equipment) =>equipment.status === filterType && equipment.equipmentType === filter
    // );
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800">المعدات المتاحة</h2>

           <FilterButtons filter={filter} setFilter={setFilter} />

      <div className="flex justify-between items-center my-4  ">
        <div className="flex space-x-2 rtl:space-x-reverse">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterType === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilterType('rent')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterType === 'rent' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            للإيجار
          </button>
          <button
            onClick={() => setFilterType('sale')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterType === 'sale' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            للبيع
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">
          {error}
        </div>
      )}
      
      {filteredEquipment.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">لا توجد معدات متاحة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <div key={item.id} className="bg-white overflow-hidden shadow-md rounded-lg">
              <div className="h-48 w-full overflow-hidden">
                {item.photoUrl ? (
                  <img 
                    src={item.photoUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">لا توجد صورة</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'rent' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.status === 'rent' ? 'للإيجار' : 'للبيع'}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 text-right">{item.name}</h3>
                </div>
                
                <div className="mt-2 text-right">
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    {item.price} ريال {item.status === 'rent' ? '/ يوم' : ''}
                  </span>
                  <span className="text-sm text-gray-500">{item.equipmentType}</span>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <a 
                      href={`tel:${item.ownerPhone}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      اتصل بالمالك
                    </a>
                    <span className="text-sm text-gray-500 dir-ltr">{item.ownerPhone}</span>
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
