'use client';

import React, { useState, useEffect } from 'react';
import { getEquipmentById, updateEquipment } from '@/lib/firebase/firestore';
import { uploadEquipmentPhoto } from '@/lib/firebase/storage';
import { getSession } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Equipment } from '@/lib/interface';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditEquipmentPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // الحقول القابلة للتعديل
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<'rent' | 'sale' | 'work'>('rent');
  const [equipmentType, setEquipmentType] = useState('');

  useEffect(() => {
    const session = getSession();
    if (!session || session.userType !== 'equipmentOwners') {
      router.push('/auth/login');
      return;
    }

    const fetchEquipment = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await getEquipmentById(id);
        
        if (result.success && result.data) {
          const eq = result.data as Equipment;
          setEquipment(eq);
          setName(eq.name);
          setDescription(eq.description);
          setPrice(eq.price.toString());
          setStatus(eq.status);
          setFbId(eq.fbId);
          setEquipmentType(eq.equipmentType);
          setPhotoPreview(eq.photoUrl || '');
        } else {
          setError('فشل في تحميل بيانات المعدة');
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id, router]);

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
    setSaving(true);
  
    const session = getSession();
    if (!session || !equipment) {
      router.push('/auth/login');
      return;
    }
  
    try {
      let photoUrl = equipment.photoUrl;
  
      if (photoFile) {
        const uploadResult = await uploadEquipmentPhoto(equipment.fbId, photoFile);
        if (!uploadResult.success || !uploadResult.url) {
          setError('فشل في رفع الصورة');
          setSaving(false);
          return;
        }
        photoUrl = uploadResult.url;
      }
  
      const updateData: Partial<Equipment> = {
        name,
        description,
        price: parseFloat(price),
        status,
        equipmentType,
        ...(photoUrl && { photoUrl }),
        updatedAt: new Date()
      };
  
      const updateResult = await updateEquipment(equipment.fbId, updateData);
      
      if (updateResult.success) {
        setSuccess('تم تحديث بيانات المعدة بنجاح');
        setEquipment({ ...equipment, ...updateData });
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!equipment) {
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
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          العودة
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          تعديل المعدة
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="relative w-full h-48 mx-auto overflow-hidden rounded-lg bg-gray-100">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="صورة المعدة"
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
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                value={name}
                onChange={(e) => setName(e.target.value)}
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                الوصف
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                  حالة المعدة
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'rent' | 'sale' | 'work')}
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
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
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

