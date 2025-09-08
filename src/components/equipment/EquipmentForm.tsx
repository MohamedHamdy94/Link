'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createEquipment, getEquipmentOwner } from '@/lib/firebase/firestore';
import { OwnerData } from '@/lib/interface';
import { uploadEquipmentPhoto } from '@/lib/firebase/storage';
import generateId from '@/lib/utils/generateId';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import imageCompression from 'browser-image-compression';

const MAX_PHOTOS = 4;

const EquipmentForm = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [status, setStatus] = useState('rent');
  const [price, setPrice] = useState('');
  const [priceOnRequest, setPriceOnRequest] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, userLoading] = useAuthState(auth);
  const [owner, setOwner] = useState<OwnerData | null>(null);

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (user && user.email) {
        const match = user.email.match(/^(\+?\d+)@/);
        const phone = match ? match[1] : null;
        if (phone) {
          const ownerResult = await getEquipmentOwner(phone);
          if (ownerResult.success && ownerResult.data) {
            setOwner(ownerResult.data);
          }
        }
      }
    };
    fetchOwnerData();
  }, [user]);

  const handlePhotoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + photoFiles.length > MAX_PHOTOS) {
        setError(`لا يمكن رفع أكثر من ${MAX_PHOTOS} صور.`);
        return;
      }

      setError('');
      setIsProcessingImages(true);
      setProgressMessage('جاري معالجة الصور المحددة...');

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const newCompressedFiles: File[] = [];
      const newPreviews: string[] = [];

      try {
        for (const file of files) {
          const compressedFile = await imageCompression(file, options);
          newCompressedFiles.push(compressedFile);
          newPreviews.push(URL.createObjectURL(compressedFile));
        }
        setPhotoFiles(prev => [...prev, ...newCompressedFiles]);
        setPhotoPreviews(prev => [...prev, ...newPreviews]);
      } catch (error) {
        console.error('Error compressing image:', error);
        setError('حدث خطأ أثناء ضغط إحدى الصور.');
      } finally {
        setIsProcessingImages(false);
        setProgressMessage('');
      }
    }
  }, [photoFiles.length]);

  const handleRemovePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handlePriceOnRequestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setPriceOnRequest(isChecked);
    if (isChecked) {
      setPrice('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setProgressMessage('');

    if (photoFiles.length === 0) {
      setError('يجب إضافة صورة واحدة على الأقل.');
      return;
    }

    if (!priceOnRequest && !price) {
      setError('يجب إدخال السعر أو تحديد "السعر عند الطلب".');
      return;
    }

    setLoading(true);

    if (userLoading || !user || !owner) {
        setError('يجب تسجيل الدخول وبيانات المالك يجب أن تكون متاحة لإضافة معدة.');
        setLoading(false);
        router.push('/auth/login');
        return;
    }
    
    const phone = owner.phoneNumber;
    if (!phone) {
        setError('رقم هاتف المالك غير صالح.');
        setLoading(false);
        return;
    }

    try {
      const equipmentId = generateId();
      setProgressMessage(`جاري رفع ${photoFiles.length} من الصور...`);

      // Create an array of upload promises
      const uploadPromises = photoFiles.map(file => 
        uploadEquipmentPhoto(phone, equipmentId, file)
      );

      // Run all uploads in parallel
      const uploadResults = await Promise.all(uploadPromises);

      const uploadedUrls: string[] = [];
      for (const result of uploadResults) {
        if (result.success && result.url) {
          uploadedUrls.push(result.url);
        } else {
          // If any upload fails, stop the process
          throw new Error('فشل في رفع إحدى الصور. يرجى المحاولة مرة أخرى.');
        }
      }
      
      // Ensure all images were uploaded successfully
      if (uploadedUrls.length !== photoFiles.length) {
          throw new Error('لم يتم رفع جميع الصور بنجاح. يرجى المحاولة مرة أخرى.');
      }

      setProgressMessage('جاري حفظ بيانات المعدة...');

      const equipmentData = {
        id: equipmentId,
        name,
        description,
        equipmentType,
        status,
        price: priceOnRequest ? null : parseFloat(price),
        priceOnRequest,
        photoUrls: uploadedUrls,
        ownerId: phone,
        ownerPhone: phone,
        ownerName: owner?.name || '',
        ownerPhotoUrl: owner?.photoUrl || '',
        ownerAddress: owner?.address || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await createEquipment(equipmentData);

      if (result.success) {
        setSuccess('تمت إضافة المعدة بنجاح');
        // Reset form
        setName('');
        setDescription('');
        setEquipmentType('');
        setStatus('rent');
        setPrice('');
        setPriceOnRequest(false);
        setPhotoFiles([]);
        setPhotoPreviews([]);
        
        setTimeout(() => {
          router.push('/equipment-owner/profile');
        }, 1500);
      } else {
        throw new Error('فشل في إضافة المعدة إلى قاعدة البيانات.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع.');
      console.error(err);
    } finally {
      setLoading(false);
      setProgressMessage('');
    }
  };

  return (
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

      {isProcessingImages && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 text-right">
          {progressMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side for inputs */}
          <div className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 text-right mb-2">
                حالة المعدة *
              </label>
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {/* For Rent Card */}
                <div
                  onClick={() => setStatus('rent')}
                  className={`p-4 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all ${
                    status === 'rent'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-blue-400'
                  }`}
                >
                  <svg className="w-8 h-8 mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <span className="font-semibold text-gray-800">للإيجار</span>
                </div>

                {/* For Sale Card */}
                <div
                  onClick={() => setStatus('sale')}
                  className={`p-4 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all ${
                    status === 'sale'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300 bg-white hover:border-green-400'
                  }`}
                >
                  <svg className="w-8 h-8 mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  <span className="font-semibold text-gray-800">للبيع</span>
                </div>

                {/* Working Now Card */}
                <div
                  onClick={() => setStatus('work')}
                  className={`py-4 px-2 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all ${
                    status === 'work'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-300 bg-white hover:border-yellow-400'
                  }`}
                >
                  <svg className="w-8 h-8 mb-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  <span className="font-semibold text-gray-800">تعمل الآن</span>
                </div>
              </div>
              {status === 'work' && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  ملاحظة: عند اختيار &apos;تعمل الآن&apos;، لن تظهر المعدة في القائمة العامة للمستخدمين.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 text-right mb-1">
                السعر (بالجنيه المصري) *
              </label>
              <input
                id="price"
                type="number"
                required={!priceOnRequest}
                disabled={priceOnRequest}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right ${priceOnRequest ? 'bg-gray-100' : ''}`}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                dir="rtl"
                placeholder={status === 'rent' ? "سعر الإيجار اليومي" : "سعر البيع"}
              />
            </div>
            <div className="flex items-center justify-end">
                <label htmlFor="priceOnRequest" className="mr-2 block text-sm text-gray-700">
                    السعر عند الطلب (تواصل معي)
                </label>
                <input 
                    id="priceOnRequest" 
                    type="checkbox" 
                    checked={priceOnRequest}
                    onChange={handlePriceOnRequestChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
            </div>
          </div>

          {/* Right side for photo upload and description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-2">الصور (بحد أقصى {MAX_PHOTOS}) *</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <Image src={preview} alt={`Preview ${index + 1}`} width={150} height={150} className="w-full h-24 object-cover rounded-md" />
                    <button type="button" onClick={() => handleRemovePhoto(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs leading-none opacity-75 group-hover:opacity-100 transition-opacity">
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              {photoFiles.length < MAX_PHOTOS && (
                <label className="block w-full text-center px-3 py-4 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                  <span className="block text-sm text-gray-600">اختر الصور</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" disabled={isProcessingImages} />
                </label>
              )}
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

        <div className="flex justify-end space-x-4 rtl:space-x-reverse mt-6 pt-6 border-t">
          <button type="button" onClick={() => router.push('/equipment-owner/profile')} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            إلغاء
          </button>
          <button type="submit" disabled={loading || isProcessingImages} className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${loading || isProcessingImages ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {loading ? (progressMessage || 'جاري الإضافة...') : 'إضافة المعدة'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EquipmentForm;
