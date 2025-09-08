'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Equipment } from '@/lib/interface';
import Link from 'next/link';
import { getEquipmentsByOwner } from '@/lib/firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import EquipmentCard from './EquipmentCard'; // Import the reusable component

const OwnerEquipmentList = () => {
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (authLoading || !user) { // Added !user check
      return; // Wait until user state is determined or user is null
    }

    const rawPhoneNumber = user.phoneNumber;
    if (!rawPhoneNumber) {
      setError('فشل في الحصول على رقم الهاتف من حساب المستخدم.');
      setPageLoading(false);
      return;
    }
    const phone = rawPhoneNumber.startsWith('+20') ? rawPhoneNumber.substring(3) : rawPhoneNumber;

    const fetchEquipment = async () => {
      setPageLoading(true);
      setError('');
      try {
        const result = await getEquipmentsByOwner(phone);
        if (result.success && result.data) {
          setEquipment(result.data as Equipment[]);
        } else {
          setError('فشل في تحميل بيانات المعدات.');
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات.');
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchEquipment();
  }, [user, authLoading, router]);

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link href="/equipment-owner/profile" className="text-sm text-blue-600 hover:text-blue-800">
          &larr; العودة إلى الملف الشخصي
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">
          جميع المعدات الخاصة بي
        </h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">
          {error}
        </div>
      )}

      {equipment.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {equipment.map((item) => (
            <EquipmentCard key={item.id} item={item} showAdminControls={true} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">لم تقم بإضافة أي معدات حتى الآن.</p>
        </div>
      )}
    </div>
  );
};

export default OwnerEquipmentList;
