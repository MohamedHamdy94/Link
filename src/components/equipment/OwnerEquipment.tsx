'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Equipment } from '@/lib/interface';
import Image from 'next/image';
import Link from 'next/link';
import { getEquipmentsByOwner } from '@/lib/firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config'; 

const FullEquipmentList = () => {
  const router = useRouter();
  const [looading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
    
    if (loading || !user) return;
    const match = user.email?.match(/^(\d+)@/);
    const phone = match ? match[1] : null;

    const fetchEquipment = async () => {
      setLoading(true);
      setError('');

      try {
if(phone) {
      const result = await getEquipmentsByOwner(phone);
        
        if (result.success&& result.data) {
          setEquipment(result.data as Equipment[]);
        } else {
          setError('فشل في تحميل بيانات المعدات');
        }}
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [user, loading, router]);

  if (looading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link href="/equipment-owner" className="text-sm text-blue-600 hover:text-blue-800">
          العودة إلى الملف الشخصي
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">
          جميع المعدات
        </h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {equipment&& (
          equipment.map((item) => {
            console.log('Equipment item ID:', item.id);
            if (!item.id) {
              console.warn('Skipping equipment item due to missing ID:', item);
              return null; // لا تعرض العنصر إذا كان ID مفقودًا
            }
            return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="h-48 relative overflow-hidden">
                  {item.photoUrl ? (
                    <Image
                      src={item.photoUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">لا توجد صورة</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'rent' 
                        ? 'bg-blue-100 text-blue-800' 
                        : item.status === 'sale' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'rent' ? 'للإيجار' : item.status === 'sale' ? 'للبيع' : 'للعمل'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-900">
                      {item.price} ريال {item.status === 'rent' ? '/ يوم' : ''}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {item.equipmentType}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <Link 
                      href={`/equipment-owner/edit-equipment/${item.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      تعديل المعدة
                    </Link>
                    <span className="text-xs text-gray-500">
                      {item.ownerPhone}
                    </span>
                  </div>
                </div>
              </div>
            )
          }
        )
      )}
          
      </div>

    </div>
  );
};

export default FullEquipmentList;