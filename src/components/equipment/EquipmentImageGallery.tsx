'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';


interface EquipmentImageGalleryProps {
  photoUrls: string[];
}

const EquipmentImageGallery = ({ photoUrls }: EquipmentImageGalleryProps) => {
  // Hooks must be called at the top level.
  const [mainImage, setMainImage] = useState(photoUrls?.[0] || null);

  // Effect to reset main image if the underlying urls change
  useEffect(() => {
    if (!mainImage || !photoUrls.includes(mainImage)) {
      setMainImage(photoUrls?.[0] || null);
    }
  }, [photoUrls, mainImage]);

  if (!photoUrls || photoUrls.length === 0) {
    return (
      <div className="h-48 w-full bg-gray-200 flex items-center justify-center rounded-t-lg">
        <span className="text-gray-500 text-sm">لا توجد صورة</span>
      </div>
    );
  }

  return (
    <div>
      {/* Main Image */}
      <div className="h-48 w-full relative overflow-hidden mb-2 rounded-t-lg">
        {mainImage && (
            <Image
              src={mainImage}
              alt="Main equipment view"
                          layout="fill"
            objectFit="contain"
              className="object-contain"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
        )}
      </div>
      {/* Thumbnails */}
      {photoUrls.length > 1 && (
        <div className="grid grid-cols-4 gap-1 px-2 pb-2">
          {photoUrls.map((url) => (
            <div
              key={url}
              className={`h-12 w-full relative overflow-hidden rounded-md cursor-pointer border-2 ${mainImage === url ? 'border-blue-500' : 'border-transparent hover:border-gray-400'}`}
              onClick={() => setMainImage(url)}
            >
              <Image
                src={url}
                alt="Equipment thumbnail"
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentImageGallery;