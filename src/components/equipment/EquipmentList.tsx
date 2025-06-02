'use client';

import React, { useState, useEffect } from 'react';
import { getOwnerEquipment } from '@/lib/firebase/firestore';
import { getSession } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Equipment } from '@/lib/interface';

import EquipmentCard from './EquipmentCard';

const EquipmentList = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      const session = getSession();
      if (!session || session.userType !== 'equipmentOwners') {
        router.push('/auth/login');
        return;
      }
  
      try {
        const result = await getOwnerEquipment(session.id);
        if (result.success && result.data) {
          const formattedEquipment = result.data.map((equipment) => ({
            id: equipment.id,
            name: equipment.name,
            description: equipment.description,
            equipmentType: equipment.equipmentType,
            status: equipment.status,
            price: equipment.price,
            photoUrl: equipment.photoUrl || undefined,
            ownerId: equipment.ownerId,
            ownerPhone: equipment.ownerPhone,
            createdAt: equipment.createdAt.toDate(),
            updatedAt: equipment.updatedAt.toDate(),
          }));
          
          setEquipment(formattedEquipment);
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
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-8 rounded-lg shadow-md max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-right">
          المعدات الخاصة بك
        </h2>
        <Link
          href="/equipment-owner/add-equipment"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          إضافة معدة جديدة
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">
          {error}
        </div>
      )}

      {equipment.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">لا توجد معدات مضافة حتى الآن</p>
          <Link
            href="/equipment-owner/add-equipment"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            إضافة معدة جديدة
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {equipment.map((item : Equipment) => (
            <EquipmentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentList;