'use client';

import React, { useState, useEffect } from 'react';
import {
  getEquipmentOwner,
  updateEquipmentOwner,
} from '@/lib/firebase/firestore';
import { uploadDriverPhoto } from '@/lib/firebase/storage';
import { getSession, logout } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { OwnerData } from '@/lib/interface';

const EquipmentOwnerProfile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ownerData, setOwnerData] = useState<OwnerData| null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    const fetchOwnerData = async () => {
      const session = getSession();
      if (!session || session.userType !== 'equipmentOwner') {
        router.push('/auth/login');
        return;
      }

      try {
        const result = await getEquipmentOwner(session.id);
        if (result.success && result.data) {
          setOwnerData({
            id:result.data.id,
            name: result.data.name || '',
            photoUrl: result.data.photoUrl || undefined,
            phoneNumber: result.data.phoneNumber || '',
            isVerified: result.data.isVerified || false,
            userType:result.data.userType ,
            createdAt:new Date(),
            updatedAt: new Date(),

          } );
          // Initialize form state
          setName(result.data?.name || '');
          setPhotoPreview(result.data?.photoUrl || '');
        } else {
          setError('فشل في تحميل بيانات صاحب المعدات');
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    // التحقق من نوع الملف
    if (!file.type.match('image.*')) {
      setError('يجب أن يكون الملف من نوع صورة');
      return;
    }
  
    // التحقق من حجم الملف (2MB كحد أقصى)
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
  
    const session = getSession();
    if (!session) {
      router.push('/auth/login');
      return;
    }
  
    try {
      let photoUrl = ownerData?.photoUrl;
  
      // Upload new photo if selected
      if (photoFile) {
        const uploadResult = await uploadDriverPhoto(session.id, photoFile);
        if (!uploadResult.success || !uploadResult.url) {
          setError( 'فشل في رفع الصورة');
          setLoading(false);
          return;
        }
        photoUrl = uploadResult.url;
      }
  
      // تحضير البيانات للتحديث
      const updateData: Partial<OwnerData> = {
        name,
        ...(photoUrl && { photoUrl }),
        updatedAt: new Date()
      };
  
      // Update owner data
      const updateResult = await updateEquipmentOwner(session.id, updateData);
      
      if (updateResult.success && updateResult.data) {
        setSuccess('تم تحديث البيانات بنجاح');
        setOwnerData(updateResult.data);
        setIsEditing(false);
      } else {
        setError(updateResult.error?.toString() || 'فشل في تحديث البيانات');
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

  if (loading && !ownerData) {
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
        <h2 className="text-2xl font-bold text-gray-800">
          الملف الشخصي لصاحب المعدات
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
            يرجى الانضمام إلى مجموعة الواتساب وإرسال رقم هاتفك لتفعيل حسابك.
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
            <button
              onClick={navigateToAddEquipment}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              إضافة معدات جديدة
            </button>
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

export default EquipmentOwnerProfile;
