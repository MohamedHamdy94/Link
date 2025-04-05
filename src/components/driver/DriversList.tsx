'use client';

import React, { useState, useEffect } from 'react';
import { getDrivers } from '@/lib/firebase/firestore';
// import { getSession } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
// import Link from 'next/link';
import DriverCard from './DriverCard';
import FilterButtons from '../ui/FilterButtons';
import { Driver } from '@/lib/interface';

const DriversList = () => {
  // const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [filter, setFilter] = useState('مانلفت');

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const result = await getDrivers();
        if (result.success) {
          setDrivers(result.data as []);
          setLoading(false);
        } else {
          setError('فشل في تحميل بيانات السائق');
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);
  const filteredDrivers = drivers.filter(
    (driver:Driver) => driver.equipmentType === filter
  );
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-2 rounded-lg shadow-md max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">
        قائمة السائقين المتاحين
      </h2>
      <div className="flex justify-between items-center mb-6">
      <FilterButtons filter={filter} setFilter={setFilter} />

      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">
          {error}
        </div>
      )}

      {filteredDrivers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">لا يوجد سائقين متاحين حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-2 md:gap-12">
          {' '}
          {filteredDrivers.map((driver:Driver) => (
            <DriverCard key={driver.id} driver={driver} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DriversList;
