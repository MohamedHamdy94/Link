'use client';

import React, { useState } from 'react';
import DriverCard from './DriverCard';
import FilterButtons from '../ui/FilterButtons';
import { Driver } from '@/lib/interface';

interface DriversListProps {
  initialDrivers: Driver[];
}

const DriversList = ({ initialDrivers }: DriversListProps) => {
  const [filter, setFilter] = useState('مانلفت');

  const filteredDrivers = initialDrivers.filter(
    (driver: Driver) => driver.equipmentType === filter
  );

  return (
    <div className="bg-white p-2 rounded-lg shadow-md max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">
        قائمة السائقين المتاحين
      </h2>
      <div className="flex justify-between items-center mb-6">
        <FilterButtons filter={filter} setFilter={setFilter} />
      </div>

      {filteredDrivers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">لا يوجد سائقين متاحين حالياً لهذا النوع من المعدات</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-2 md:gap-12">
          {filteredDrivers.map((driver: Driver) => (
            <DriverCard key={driver.id} driver={driver} />
          ))}
        </div>
      )}
    </div>
  );
}; 

export default DriversList;