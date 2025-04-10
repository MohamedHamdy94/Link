'use client';

import React, { useState, useEffect } from 'react';
import { getOwnerEquipment } from '@/lib/firebase/firestore';
import { getSession } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Equipment } from '@/lib/interface';

const EquipmentCard = ({ equipment }: { equipment: Equipment }) => {
  return (
    <div className="bg-white overflow-hidden shadow-md rounded-lg">
      <div className="h-48 w-full overflow-hidden">
        {equipment.photoUrl ? (
          <img
            src={equipment.photoUrl}
            alt={equipment.name}
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
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              equipment.status === 'rent'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {equipment.status === 'rent' ? 'للإيجار' : 'للبيع'}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 text-right">
            {equipment.name}
          </h3>
        </div>

        <div className="mt-2 text-right">
          <p className="text-sm text-gray-600 line-clamp-2">
            {equipment.description}
          </p>
        </div>

        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900">
            {equipment.price} ريال {equipment.status === 'rent' ? '/ يوم' : ''}
          </span>
          <span className="text-sm text-gray-500">
            {equipment.equipmentType}
          </span>
        </div>
      </div>
    </div>
  );
};

const EquipmentList = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      const session = getSession();
      if (!session || session.userType !== 'equipmentOwner') {
        router.push('/auth/login');
        return;
      }

      try {
        const result = await getOwnerEquipment(session.id);
        if (result.success && result.data) {
          const formattedUsers = result.data.map((equipment) => ({
            id: equipment.id,
            name: equipment.name,
            description: equipment.description,
            equipmentType: equipment.equipmentType,
            status: equipment.status,
            price: equipment.price,
            photoUrl: equipment.photoUrl,
            ownerId: equipment.ownerId,
            ownerPhone: equipment.ownerPhone,
          }));
          setEquipment(formattedUsers);
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
    <div className="bg-white p-8 rounded-lg shadow-md max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/equipment-owner/add-equipment"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          إضافة معدة جديدة
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">المعدات الخاصة بك</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((item) => (
            <EquipmentCard key={item.id} equipment={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
