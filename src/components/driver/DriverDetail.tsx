'use client';

import { Driver } from '@/lib/interface';
import Image from 'next/image';
import { Phone, User, Truck, MapPin, ShieldCheck } from 'lucide-react';

interface DriverDetailProps {
  driver: Driver;
}

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | React.ReactNode }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center gap-1">
      <div className="text-gray-500">{icon}</div>
      <span className="font-semibold text-gray-600 text-xs">{label}</span>
    </div>
    <span className="font-bold text-gray-900 text-base">{value}</span>
  </div>
);

const DriverDetail = ({ driver }: DriverDetailProps) => {
  return (
    <div className="w-full h-screen flex flex-col p-0 font-sans">
      <div className="flex-grow bg-white rounded-none shadow-none overflow-auto">
        {/* Image Section */}
        <div className="relative w-full h-64">
          <Image
            src={driver.photoUrl || '/images/imagesProfile.jpg'}
            alt={`صورة ${driver.name}`}
            layout="fill"
            objectFit="contain"
            className="rounded-t-none"
          />
          <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-bold text-white ${driver.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>
            {driver.isAvailable ? 'متاح' : 'غير متاح'}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <div className="flex flex-col items-center text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{driver.name}</h1>
            <a 
              href={`tel:${driver.phoneNumber}`}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Phone size={20} />
              <span>اتصل الآن</span>
            </a>
          </div>

          {/* Details Section */}
          <h3 className="text-lg font-bold text-gray-800 mb-2 text-right">التفاصيل</h3>
          <div className="space-y-1">
            <InfoRow 
              icon={<User size={20} />} 
              label="الاسم"
              value={driver.name} 
            />
            <InfoRow 
              icon={<User size={20} />} 
              label="السن"
              value={`${driver.age || 'N/A'} عامًا`} 
            />
            <InfoRow 
              icon={<MapPin size={20} />} 
              label="العنوان"
              value={driver.address || 'N/A'} 
            />
            <InfoRow 
              icon={<Truck size={20} />} 
              label="نوع المعدة"
              value={driver.equipmentType || 'N/A'} 
            />
            <InfoRow 
              icon={<ShieldCheck size={20} />} 
              label="هل يحمل رخصة اصلية "
              value={
                <span className={`font-bold ${driver.hasLicense ? 'text-green-600' : 'text-red-600'}`}>
                  {driver.hasLicense ? 'نعم' : 'لا'}
                </span>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDetail;
