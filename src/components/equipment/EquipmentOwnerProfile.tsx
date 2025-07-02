'use client';

import React, { useState, useEffect } from 'react';
import { getEquipmentOwner, updateEquipmentOwner, getOwnerEquipments } from '@/lib/firebase/firestore';
import { uploadDriverPhoto } from '@/lib/firebase/storage';
import { useRouter } from 'next/navigation';
import { OwnerData, Equipment } from '@/lib/interface';
import { auth } from '@/lib/firebase/config'; 
import { useAuthState } from 'react-firebase-hooks/auth';
import Image from 'next/image';
import Link from 'next/link';
import { logout } from '@/lib/firebase/auth';

const EquipmentOwnerProfile = () => {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  const [ownerData, setOwnerData] = useState<OwnerData | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [error, setError] = useState('');
  const [ownerError, setOwnerError] = useState('');
  const [equipmentError, setEquipmentError] = useState('');
  const [success, setSuccess] = useState('');
  const [looading, setLoading] = useState(true);
  const [equipmentLoading, setEquipmentLoading] = useState(true);
  const [id, setId] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (loading || !user) return;

    const match = user.email?.match(/^(\d+)@/);
    const phoneNumber = match ? match[1] : null;
  if(phoneNumber) setId(phoneNumber)
    if (!phoneNumber) {
      setError('رقم الجوال غير صالح');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setEquipmentLoading(true);
      setError('');
      setOwnerError('');
      setEquipmentError('');
console.log (phoneNumber)

      try {
        const [ownerResult, equipmentResult] = await Promise.all([
          getEquipmentOwner(phoneNumber),
          getOwnerEquipments(phoneNumber),
        ]);

        if (ownerResult.success && ownerResult.data) {
          const data = ownerResult.data;
          setOwnerData({
            id: data.id,
            name: data.name || '',
            photoUrl: data.photoUrl || undefined,
            phoneNumber: data.phoneNumber || '',
            isVerified: data.isVerified || false,
            userType: data.userType,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          setName(data.name || '');
          setPhotoPreview(data.photoUrl || '');
        } else {
          setOwnerError('فشل في تحميل بيانات صاحب المعدات');
          console.log(ownerError)
        }

        if (equipmentResult.success) {
          setEquipment(equipmentResult.data as Equipment[]);
        } else {
          setEquipmentError('فشل في تحميل بيانات المعدات');
          console.log(equipmentError)
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات');
        console.error(err);
      } finally {
        setLoading(false);
        setEquipmentLoading(false);
      }
    };

    fetchData();
  }, [user, loading]);
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    if (!file.type.match('image.*')) {
      setError('يجب أن يكون الملف من نوع صورة');
      return;
    }
  
    if (file.size > 2 * 1024 * 1024) {
      setError('يجب أن يكون حجم الصورة أقل من 2MB');
      return;
    }
  
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
  
    if (!user) {
      router.push('/auth/login');
      return;
    }
  
    try {
      let photoUrl = ownerData?.photoUrl;
  
      if (photoFile) {
        const uploadResult = await uploadDriverPhoto(id, photoFile);
        if (!uploadResult.success || !uploadResult.url) {
          setError('فشل في رفع الصورة');
          setLoading(false);
          return;
        }
        photoUrl = uploadResult.url;
      }
  
      const updateData: Partial<OwnerData> = {
        name,
        ...(photoUrl && { photoUrl }),
        updatedAt: new Date()
      };
  
      const updateResult = await updateEquipmentOwner(id, updateData);
       

      if (updateResult.success && updateResult.data) {
        setSuccess('تم تحديث البيانات بنجاح');
        setOwnerData(updateResult.data);
        setIsEditing(false);
      } else {
        setError( 'فشل في تحديث البيانات');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const navigateToAddEquipment = () => {
    router.push('/equipment-owner/add-equipment');
  };

  if (looading && !ownerData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (

    <div className="bg-gray-50 p-8 rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleLogout}
          className="text-sm text-red-700 hover:text-gray-800"
        >
          تسجيل الخروج
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          الملف الشخصي
        </h2>
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

      {!ownerData?.isVerified && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 text-right">
          <p className="font-bold">الحساب غير مفعل</p>
          <p>
            يرجى الانضمام إلى مجموعة الواتساب وإرسال رقم هاتفك لتفعيل حسابك لتتمكن من إيضافة معداتك
          </p>
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
              <div className="relative w-40 h-40 mx-auto overflow-hidden rounded-full bg-gray-100">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="صورة صاحب المعدات"
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

            <div className="md:w-2/3 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 text-right mb-1"
                >
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
              disabled={looading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${
                looading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {looading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="relative w-40 h-40 mx-auto overflow-hidden rounded-full bg-gray-100">
                {ownerData?.photoUrl ? (
                  <img
                    src={ownerData.photoUrl}
                    alt="صورة صاحب المعدات"
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
                  <dd className="text-gray-900">
                    {ownerData?.name || 'غير محدد'}
                  </dd>
                  <dt className="text-gray-500 font-medium">الاسم</dt>
                </div>

                <div className="py-3 flex justify-between">
                  <dd className="text-gray-900">
                    {ownerData?.phoneNumber || 'غير محدد'}
                  </dd>
                  <dt className="text-gray-500 font-medium">رقم الهاتف</dt>
                </div>

                <div className="py-3 flex justify-between">
                  <dd
                    className={`${
                      ownerData?.isVerified ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {ownerData?.isVerified ? 'مفعل' : 'غير مفعل'}
                  </dd>
                  <dt className="text-gray-500 font-medium">حالة الحساب</dt>
                </div>
              </dl>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4 rtl:space-x-reverse">
     {ownerData?.isVerified &&       <button
              onClick={navigateToAddEquipment}
              className="px-4 me-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              إضافة معدات جديدة
            </button> }
      
        
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              تعديل البيانات
            </button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-right">
          أحدث المعدات المضافة
        </h3>
        
        {equipmentLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="h-40 relative overflow-hidden">
                  {item.photoUrl ? (
                    <Image
                      src={item.photoUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">لا توجد صورة</span>
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'rent' 
                        ? 'bg-blue-100 text-blue-800' 
                        : item.status === 'sale' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'rent' ? 'للإيجار' : item.status === 'sale' ? 'للبيع' : 'تعمل'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {item.price} جنيه {item.status === 'rent' ? '/ يوم' : ''}
                    </span>
                    <Link 
                      href={`/equipment-owner/edit-equipment/${item.fbId}`}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      تعديل
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {equipment.length === 0 && !equipmentLoading && ownerData?.isVerified && (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">لا توجد معدات مسجلة</p>
            <button
              onClick={navigateToAddEquipment}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              إضافة معدات جديدة
            </button>
          </div>
        )}

        {equipment.length > 3 && (
          <div className="mt-4 text-center">
            <Link 
              href="/equipment-owner/full-equipment-list" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              عرض جميع المعدات ({equipment.length})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentOwnerProfile;