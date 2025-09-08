"use client";
import React, { useState } from 'react';
import FilterButtons from '../ui/FilterButtons';
import { Equipment } from '@/lib/interface';
import EquipmentCard from './EquipmentCard'; // Import the card

interface EquipmentListPublicProps {
  equipments: Equipment[];
}

const EquipmentListPublic = ({ equipments }: EquipmentListPublicProps) => {
  const [filterType, setFilterType] = useState('all');
  const [filter, setFilter] = useState('مانلفت');

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
            {type === 'all' ? 'الكل' : type === 'rent' ? 'للإيجار' : 'للبيع'}
          </button>
        ))}
      </div>

      {filteredEquipment.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">لا توجد معدات متاحة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((item) => (
            <EquipmentCard key={item.id} item={item} showAdminControls={false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentListPublic;
