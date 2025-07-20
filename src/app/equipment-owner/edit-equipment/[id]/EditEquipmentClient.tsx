'use client';

import Image from 'next/image';

import React, { useState, useEffect } from 'react';
import { updateEquipment } from '@/lib/firebase/firestore';
import { uploadEquipmentPhoto, deleteFileByUrl } from '@/lib/firebase/storage';
import { useRouter } from 'next/navigation';
import { Equipment } from '@/lib/interface';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config'; 

interface EditEquipmentClientProps {
  initialData: Equipment;
}

export default function EditEquipmentClient({ initialData }: EditEquipmentClientProps) {
  const router = useRouter();
    const [user, loading] = useAuthState(auth);
  
  const [looading, setLoading] = useState(!initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(initialData.photoUrl || '');

  const [formData, setFormData] = useState({
    name: initialData.name,
    description: initialData.description || '',
    price: initialData.price.toString(),
    status: initialData.status,
    equipmentType: initialData.equipmentType,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {


    if (!initialData) {
      setError('فشل في تحميل بيانات المعدة');
      setLoading(false);
    }
  }, [initialData, router]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('اسم المعدة مطلوب');
      return false;
    }

    if (!formData.price || isNaN(parseFloat(formData.price))) {
      setError('السعر يجب أن يكون رقمًا صحيحًا');
      return false;
    }

    if (!formData.equipmentType) {
      setError('نوع المعدة مطلوب');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
  
    // التحقق من وجود fbId
    if (!initialData.fbId) {
      setError('معرف المعدة غير موجود');
      return;
    }
  
    setSaving(true);
  
    if (!user) {
      router.push('/auth/login');
      return;
    }
  
    try {
      let photoUrl = initialData.photoUrl || '';
      const oldPhotoUrl = initialData.photoUrl; // حفظ رابط الصورة القديمة

      if (photoFile) {
        const uploadResult = await uploadEquipmentPhoto(initialData.ownerId, initialData.fbId, photoFile);
        if (!uploadResult.success || !uploadResult.url) {
          setError('فشل في رفع الصورة');
          setSaving(false);
          return;
        }
        photoUrl = uploadResult.url;

        // حذف الصورة القديمة إذا كانت موجودة ومختلفة عن الجديدة
        if (oldPhotoUrl && oldPhotoUrl !== photoUrl) {
          const deleteResult = await deleteFileByUrl(oldPhotoUrl);
          if (!deleteResult.success) {
            console.warn('Failed to delete old photo:', deleteResult.error);
            // لا نوقف العملية هنا، لأن الصورة الجديدة تم رفعها بنجاح
          }
        }
      }
  
      const updateData: Equipment = {
        ...initialData,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        status: formData.status as 'rent' | 'sale' | 'work',
        equipmentType: formData.equipmentType,
        photoUrl,
        updatedAt: new Date().toISOString(),
      };
  
      // نعلم TypeScript أن fbId موجود لأنه تم التحقق منه مسبقاً
      const updateResult = await updateEquipment(initialData.fbId, updateData);
  
      if (updateResult.success) {
        setSuccess('تم تحديث بيانات المعدة بنجاح');
        setTimeout(() => {
          setSuccess('');
          router.push('/equipment-owner/profile'); // إعادة التوجيه هنا
        }, 1500); // يمكن تعديل التأخير حسب الحاجة
      } else {
        setError(updateResult.error?.toString() || 'فشل في تحديث البيانات');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (looading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto text-center">
        <p className="text-red-500 mb-4">لم يتم العثور على المعدة</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          العودة
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="relative w-full aspect-w-16 aspect-h-9 mx-auto overflow-hidden rounded-lg bg-gray-100">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="صورة المعدة"
                  width={500}
                  height={500}
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
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </label>
          </div>

          <div className="md:w-2/3 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                اسم المعدة
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                value={formData.name}
                onChange={handleChange}
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                الوصف
              </label>
              <textarea
                name="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                  السعر
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  value={formData.price}
                  onChange={handleChange}
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                  حالة المعدة
                </label>
                <select
                  name="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="rent">للإيجار</option>
                  <option value="sale">للبيع</option>
                  <option value="work">تعمل الان (غير متاح)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="equipmentType" className="block text-sm font-medium text-gray-700 text-right mb-1">
                نوع المعدة *
              </label>
              <select
                id="equipmentType"
                name="equipmentType"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                value={formData.equipmentType}
                onChange={handleChange}
                dir="rtl"
              >
                <option value="">اختر نوع المعدة</option>
                <option value="حفار">حفار</option>
                <option value="سيزر">سيزر</option>
                <option value="لودر">لودر</option>
                <option value="ونش">ونش</option>
                <option value="مانلفت">مانلفت</option>
                <option value="فورك"> فورك </option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 rtl:space-x-reverse">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${
              saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </form>
    </div>
  );
}