"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createEquipment } from '@/lib/firebase/firestore';
import { uploadEquipmentPhoto } from '@/lib/firebase/storage';
//import { Equipment } from '@/lib/interface';
import generateId from '@/lib/utils/generateId'
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import imageCompression from 'browser-image-compression';

const EquipmentForm = () => {
  const router = useRouter();
    generateId()
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [status, setStatus] = useState('rent'); 
  const [price, setPrice] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [looading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
 const [user, loading] = useAuthState(auth);


  // استخدام useCallback لتحسين أداء معالجة الصور
  const handlePhotoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(file, options);
        setPhotoFile(compressedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error(error);
        setError('حدث خطأ أثناء ضغط الصورة.');
      }
    }
  }, []);

  // تحسين معالجة التقديم
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!loading && !user) {
      router.push('/auth/login');
    }
    
    if (loading || !user) return;
    const match = user.email?.match(/^(\d+)@/);
    const phone = match ? match[1] : '';


    try {
     
    let photoUrl = ''; 

    // تحميل الصورة فقط إذا كانت موجودة
    if (photoFile) {
      const uploadResult = await uploadEquipmentPhoto(
      phone,
        `${Date.now()}`,
        photoFile
      );
      
      if (uploadResult && uploadResult.success) {
        photoUrl = uploadResult.url || 'فشل في رفع صورة المعدة';

      }else{
        photoUrl=''
        setError('فشل في رفع صورة المعدة');
        setLoading(false);
        return;

      }
    }

    // إنشاء كائن المعدة
    const equipmentData = {
      id: generateId(),
      name,
      description,
      equipmentType,
      status,
      price: parseFloat(price),
      photoUrl, // استخدام المتغير photoUrl الذي تم تعريفه مسبقاً
      ownerId: phone,
      ownerPhone: phone,
      createdAt: new Date().toISOString(), // تحويل إلى string
      updatedAt: new Date().toISOString(), // تحويل إلى string
    };

      // إرسال البيانات إلى Firebase
      const result = await createEquipment(equipmentData);
      if (result.success) {
        setSuccess('تمت إضافة المعدة بنجاح');   
        setPhotoFile(null);
        setPhotoPreview('');
        
        // إعادة التوجيه بعد النجاح (اختياري)
        setTimeout(() => {
          router.push('/equipment-owner/profile');
        }, 1500);
      } else {
        throw new Error('فشل في إضافة المعدة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء إضافة المعدة');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



 return (
   <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">

<div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">إضافة معدة جديدة</h2>

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
            <div className="mb-4">
              <div className="relative w-full aspect-w-16 aspect-h-9 mx-auto overflow-hidden rounded-md bg-gray-100">
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
                    اختر صورة للمعدة
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
                اسم المعدة *
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

            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                حالة المعدة *
              </label>
              <div className="flex  rtl:space-x-reverse">
                <div className="flex items-center">
                  <input
                    id="rent"
                    type="radio"
                    name="status"
                    value="rent"
                    checked={status === 'rent'}
                    onChange={() => setStatus('rent')}
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
                    name="status"
                    value="sale"
                    checked={status === 'sale'}
                    onChange={() => setStatus('sale')}
                    className="h-4 w-4 mr-1 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="sale" className="mr-2 block text-sm text-gray-700">
                    للبيع
                  </label>
                </div>
                <div className="flex items-center m-4">
                  <input
                    id="work"
                    type="radio"
                    name="status"
                    value="work"
                    checked={status === 'work'}
                    onChange={() => setStatus('work')}
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="work" className="mr-2 block text-sm text-gray-700">
في العمل                 </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 text-right mb-1">
                السعر *
              </label>
              <input
                id="price"
                type="number"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                dir="rtl"
                placeholder={status === 'rent' ? "سعر الإيجار اليومي" : "سعر البيع"}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 text-right mb-1">
                وصف المعدة *
              </label>
              <textarea
                id="description"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                dir="rtl"
                placeholder="أدخل وصفاً تفصيلياً للمعدة"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 rtl:space-x-reverse">
          <button
            type="button"
            onClick={() => router.push('/equipment-owner/profile')}
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
            {looading ? 'جاري الإضافة...' : 'إضافة المعدة'}
          </button>
        </div>
      </form>
    </div>
    </div>
);
};

export default EquipmentForm;