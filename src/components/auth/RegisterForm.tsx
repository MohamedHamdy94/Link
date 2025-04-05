"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDriver, createEquipmentOwner } from '@/lib/firebase/firestore';
import { getWhatsAppGroupLink } from '@/lib/firebase/auth';

type UserType = 'driver' | 'equipmentOwner';

const RegisterForm = () => {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('driver');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [hasLicense, setHasLicense] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [equipmentDetails, setEquipmentDetails] = useState('');
  const [equipmentStatus, setEquipmentStatus] = useState('rent');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  // const [userId, setUserId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }

    try {
      if (userType === 'driver') {
        // Register as driver
        const driverData = {
          phoneNumber,
          password,
          name,
          age: parseInt(age),
          equipmentType,
          isAvailable,
          hasLicense,
          photoUrl: '',
          isVerified: false
        };

        const result = await createDriver(phoneNumber, driverData);
        
        if (result.success) {
          setRegistered(true);
          // setUserId(phoneNumber);
        } else {
          setError( 'حدث خطأ أثناء التسجيل');
        }
      } else {
        // Register as equipment owner
        const ownerData = {
          phoneNumber,
          password,
          name,
          equipmentDetails,
          photoUrl: '',
          isVerified: false
        };

        const result = await createEquipmentOwner(phoneNumber, ownerData);
        
        if (result.success) {
          setRegistered(true);
          // setUserId(phoneNumber);
        } else {
          setError( 'حدث خطأ أثناء التسجيل');
        }
      }
    } catch (err) {
      setError('حدث خطأ أثناء التسجيل');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">تم التسجيل بنجاح!</h2>
        
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-right">
          <p>تم تسجيل حسابك بنجاح. للتحقق من رقم هاتفك وتفعيل حسابك، يرجى الانضمام إلى مجموعة الواتساب وإرسال رقم هاتفك.</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-right">خطوات التحقق:</h3>
          <ol className="list-decimal list-inside space-y-2 text-right">
            <li>انضم إلى مجموعة الواتساب من خلال الرابط أدناه</li>
            <li>أرسل رقم هاتفك: {phoneNumber}</li>
            <li>انتظر تأكيد المسؤول لتفعيل حسابك</li>
          </ol>
        </div>
        
        <div className="mb-6 text-center">
          <a 
            href={getWhatsAppGroupLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            الانضمام إلى مجموعة الواتساب
          </a>
        </div>
        
        <div className="text-center">
          <button
            onClick={() => router.push('/auth/login')}
            className="text-blue-600 hover:text-blue-800"
          >
            العودة إلى صفحة تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">إنشاء حساب جديد</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex justify-center space-x-4 rtl:space-x-reverse">
          <button
            type="button"
            className={`px-4 py-2 rounded-md ${
              userType === 'driver' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => setUserType('driver')}
          >
            سائق معدات
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md ${
              userType === 'equipmentOwner' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => setUserType('equipmentOwner')}
          >
            صاحب معدات
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Common Fields */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 text-right mb-1">
            رقم الهاتف *
          </label>
          <input
            id="phoneNumber"
            type="tel"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="أدخل رقم الهاتف"
            dir="rtl"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-right mb-1">
            كلمة المرور *
          </label>
          <input
            id="password"
            type="password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور"
            dir="rtl"
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 text-right mb-1">
            تأكيد كلمة المرور *
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="أعد إدخال كلمة المرور"
            dir="rtl"
          />
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-right mb-1">
            الاسم *
          </label>
          <input
            id="name"
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخل الاسم"
            dir="rtl"
          />
        </div>
        
        {/* Driver-specific Fields */}
        {userType === 'driver' && (
          <>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 text-right mb-1">
                السن *
              </label>
              <input
                id="age"
                type="number"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="أدخل السن"
                dir="rtl"
              />
            </div>
            
            <div>
              <label htmlFor="equipmentType" className="block text-sm font-medium text-gray-700 text-right mb-1">
                نوع المعدة التي تقودها *
              </label>
              <select
                id="equipmentType"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                dir="rtl"
              >
                <option value="">اختر نوع المعدة</option>
                <option value="حفار">حفار</option>
                <option value="جرافة">جرافة</option>
                <option value="لودر">لودر</option>
                <option value="بلدوزر">بلدوزر</option>
                <option value="رافعة">رافعة</option>
                <option value="شاحنة نقل">شاحنة نقل</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                id="isAvailable"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
              <label htmlFor="isAvailable" className="mr-2 block text-sm text-gray-700">
                متاح للعمل الآن
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="hasLicense"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={hasLicense}
                onChange={(e) => setHasLicense(e.target.checked)}
              />
              <label htmlFor="hasLicense" className="mr-2 block text-sm text-gray-700">
                أحمل رخصة أصلية
              </label>
            </div>
          </>
        )}
        
        {/* Equipment Owner-specific Fields */}
        {userType === 'equipmentOwner' && (
          <>
            <div>
              <label htmlFor="equipmentDetails" className="block text-sm font-medium text-gray-700 text-right mb-1">
                تفاصيل المعدات *
              </label>
              <textarea
                id="equipmentDetails"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                value={equipmentDetails}
                onChange={(e) => setEquipmentDetails(e.target.value)}
                placeholder="أدخل تفاصيل المعدات التي تمتلكها"
                rows={4}
                dir="rtl"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                حالة المعدات *
              </label>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <div className="flex items-center">
                  <input
                    id="rent"
                    type="radio"
                    name="equipmentStatus"
                    value="rent"
                    checked={equipmentStatus === 'rent'}
                    onChange={() => setEquipmentStatus('rent')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="rent" className="mr-2 block text-sm text-gray-700">
                    للإيجار
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="sale"
                    type="radio"
                    name="equipmentStatus"
                    value="sale"
                    checked={equipmentStatus === 'sale'}
                    onChange={() => setEquipmentStatus('sale')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="sale" className="mr-2 block text-sm text-gray-700">
                    للبيع
                  </label>
                </div>
              </div>
            </div>
          </>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'جاري التسجيل...' : 'تسجيل'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          لديك حساب بالفعل؟{' '}
          <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            تسجيل الدخول
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
