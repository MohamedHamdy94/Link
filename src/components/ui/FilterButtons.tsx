'use client'; // تحديد أن هذا المكون هو Client Component

import React from 'react';

interface FilterButtonsProps {
  filter: string;
  setFilter: (filter: string) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ filter, setFilter }) => {
  const filterTypes = ['مانلفت', 'فورك', 'ونش', 'سيزر', 'لودر', 'حفار'];

  return (
    <div className="flex   space-x-2 rtl:space-x-reverse">
      {filterTypes.map((type) => (
        <button
          key={type}
          onClick={() => setFilter(type)}
          className={`px-3 py-1 rounded-md text-sm mx-1 ${
            filter === type
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;