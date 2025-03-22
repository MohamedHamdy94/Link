"use client";

import React, { useState, useEffect } from 'react';
import { getDriver, updateDriver, verifyDriver } from '@/lib/firebase/firestore';
import { uploadDriverPhoto } from '@/lib/firebase/storage';
import { getSession, logout } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

const DriverProfile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [driverData, setDriverData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasLicense, setHasLicense] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  
  useEffect(() => {
    const fetchDriverData = async () => {
      const session = getSession();
      if (!session || session.userType !== 'driver') {
        router.push('/auth/login');
        return;
      }
      
      try {
        const result = await getDriver(session.id);
        if (result.success) {
          setDriverData(result.data);
          // Initialize form state
          setName(result.data?.name || '');
          setAge(result.data?.age?.toString() || '');
          setEquipmentType(result.data?.equipmentType || '');
          setIsAvailable(result.data?.isAvailable || false);
          setHasLicense(result.data?.hasLicense || false);
          setPhotoPreview(result.data?.photoUrl || '');
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
    
    fetchDriverData();
  }, [router]);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    const session = getSession();
    if (!session) {
      router.push('/auth/login');
      return;
    }
    
    try {
      let photoUrl = driverData?.photoUrl || '';
      
      // Upload new photo if selected
      if (photoFile) {
        const uploadResult = await uploadDriverPhoto(session.id, photoFile);
        if (uploadResult.success) {
          photoUrl = uploadResult.url;
        } else {
          setError('فشل في رفع الصورة');
          setLoading(false);
          return;
        }
      }
      
      // Update driver data
      const updateResult = await updateDriver(session.id, {
        name,
        age: parseInt(age),
        equipmentType,
        isAvailable,
        hasLicense,
        photoUrl
      });
      
      if (updateResult.success) {
        setSuccess('تم تحديث البيانات بنجاح');
        setDriverData({
          ...driverData,
          name,
          age: parseInt(age),
          equipmentType,
          isAvailable,
          hasLicense,
          photoUrl
        });
        setIsEditing(false);
      } else {
        setError('فشل في تحديث البيانات');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحديث البيانات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };
  
  if (loading && !driverData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          تسجيل الخروج
        </button>
        <h2 className="text-2xl font-bold text-gray-800">الملف الشخصي للسائق</h2>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-right">
          {success}
        </div>
      )}
      
      {!driverData?.isVerified && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 text-right">
          <p className="font-bold">الحساب غير مفعل</p>
          <p>يرجى الانضمام إلى مجموعة الواتساب وإرسال رقم هاتفك لتفعيل حسابك.</p>
          <a 
            href="https://chat.whatsapp.com/example-group-link" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mt-2 text-blue-600 hover:text-blue-800"
          >
            الانضمام إلى مجموعة الواتساب
          </a>
        </div>
      )}
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="mb-4">
                <div className="relative w-40 h-40 mx-auto overflow-hidden rounded-full bg-gray-100">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="صورة السائق" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
                      لا توجد صورة
                    </div>
                  )}
                </div>
                <label className="block mt-4 text-center">
                  <span className="sr-only">اختر صورة</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </label>
              </div>
            </div>
            
            <div className="md:w-2/3 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-right mb-1">
                  الاسم
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  dir="rtl"
                />
              </div>
              
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 text-right mb-1">
                  السن
                </label>
                <input
                  id="age"
                  type="number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  dir="rtl"
                />
              </div>
              
              <div>
                <label htmlFor="equipmentType" className="block text-sm font-medium text-gray-700 text-right mb-1">
                  نوع المعدة التي تقودها
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
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="relative w-40 h-40 mx-auto overflow-hidden rounded-full bg-gray-100">
                {driverData?.photoUrl ? (
                  <img 
                    src={driverData.photoUrl} 
                    alt="صورة السائق" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
                    لا توجد صورة
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-2/3">
              <dl className="divide-y divide-gray-200">
                <div className="py-3 flex justify-between">
                  <dd className="text-gray-900">{driverData?.name || 'غير محدد'}</dd>
                  <dt className="text-gray-500 font-medium">الاسم</dt>
                </div>
                
                <div className="py-3 flex justify-between">
                  <dd className="text-gray-900">{driverData?.age || 'غير محدد'}</dd>
                  <dt className="text-gray-500 font-medium">السن</dt>
                </div>
                
                <div className="py-3 flex justify-between">
                  <dd className="text-gray-900">{driverData?.equipmentType || 'غير محدد'}</dd>
                  <dt className="text-gray-500 font-medium">نوع المعدة</dt>
                </div>
                
                <div className="py-3 flex justify-between">
                  <dd className="text-gray-900">{driverData?.isAvailable ? 'نعم' : 'لا'}</dd>
                  <dt className="text-gray-500 font-medium">متاح للعمل</dt>
                </div>
                
                <div className="py-3 flex justify-between">
                  <dd className="text-gray-900">{driverData?.hasLicense ? 'نعم' : 'لا'}</dd>
                  <dt className="text-gray-500 font-medium">يحمل رخصة أصلية</dt>
                </div>
                
                <div className="py-3 flex justify-between">
                  <dd className="text-gray-900">{driverData?.phoneNumber || 'غير محدد'}</dd>
                  <dt className="text-gray-500 font-medium">رقم الهاتف</dt>
                </div>
                
                <div className="py-3 flex justify-between">
                  <dd className={`${driverData?.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {driverData?.isVerified ? 'مفعل' : 'غير مفعل'}
                  </dd>
                  <dt className="text-gray-500 font-medium">حالة الحساب</dt>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              تعديل البيانات
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverProfile;
