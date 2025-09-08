'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { updateEquipment } from '@/lib/firebase/firestore';
import { uploadEquipmentPhoto, deleteFileByUrl } from '@/lib/firebase/storage';
import { deleteEquipmentAction } from '@/app/equipment-owner/actions';
import { Equipment } from '@/lib/interface';
import imageCompression from 'browser-image-compression';

const MAX_PHOTOS = 4;

interface EditEquipmentClientProps {
  equipment: Equipment;
}

export default function EditEquipmentClient({ equipment }: EditEquipmentClientProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: equipment.name,
    description: equipment.description || '',
    price: equipment.price?.toString() || '',
    status: equipment.status,
    equipmentType: equipment.equipmentType,
  });

  const [priceOnRequest, setPriceOnRequest] = useState(equipment.priceOnRequest || false);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>(equipment.photoUrls || []);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePhotoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalPhotos = existingPhotoUrls.length + newPhotoFiles.length + files.length;

      if (totalPhotos > MAX_PHOTOS) {
        setError(`لا يمكن رفع أكثر من ${MAX_PHOTOS} صور.`);
        return;
      }

      setError('');
      setIsProcessingImages(true);
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };

      const compressedFiles: File[] = [];
      const previews: string[] = [];

      try {
        for (const file of files) {
          const compressedFile = await imageCompression(file, options);
          compressedFiles.push(compressedFile);
          previews.push(URL.createObjectURL(compressedFile));
        }
        setNewPhotoFiles(prev => [...prev, ...compressedFiles]);
        setNewPhotoPreviews(prev => [...prev, ...previews]);
      } catch (error) {
        console.error('Error compressing image:', error);
        setError('حدث خطأ أثناء ضغط إحدى الصور.');
      } finally {
        setIsProcessingImages(false);
      }
    }
  }, [existingPhotoUrls.length, newPhotoFiles.length]);

  const handleRemoveExistingPhoto = (urlToRemove: string) => {
    setExistingPhotoUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleRemoveNewPhoto = (index: number) => {
    setNewPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceOnRequestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setPriceOnRequest(isChecked);
    if (isChecked) {
      setFormData(prev => ({ ...prev, price: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!priceOnRequest && !formData.price) {
      setError('يجب إدخال السعر أو تحديد "السعر عند الطلب".');
      return;
    }

    setSaving(true);

    try {
      // 1. Upload new photos in parallel
      const uploadPromises = newPhotoFiles.map(file => 
        uploadEquipmentPhoto(equipment.ownerId, equipment.id, file)
      );
      const uploadResults = await Promise.all(uploadPromises);
      const newUploadedUrls = uploadResults.map(result => {
        if (result.success && result.url) {
          return result.url;
        }
        throw new Error('فشل في رفع إحدى الصور الجديدة.');
      });

      // 2. Determine which old photos were deleted
      const initialUrls = equipment.photoUrls || [];
      const deletedUrls = initialUrls.filter(url => !existingPhotoUrls.includes(url));

      // 3. Delete the removed photos from storage in parallel
      const deletePromises = deletedUrls.map(url => deleteFileByUrl(url));
      await Promise.all(deletePromises);

      // 4. Create the final list of photo URLs
      const finalPhotoUrls = [...existingPhotoUrls, ...newUploadedUrls];

      if (finalPhotoUrls.length === 0) {
        setError('يجب أن تحتوي المعدة على صورة واحدة على الأقل.');
        setSaving(false);
        return;
      }

      // 5. Update the equipment document in Firestore
      const updateData: Partial<Equipment> = {
        ...formData,
        price: priceOnRequest ? null : parseFloat(formData.price),
        priceOnRequest,
        photoUrls: finalPhotoUrls,
        updatedAt: new Date().toISOString(),
      };

      const updateResult = await updateEquipment(equipment.id, updateData);

      if (updateResult.success) {
        setSuccess('تم تحديث البيانات بنجاح. ستظهر التغييرات في القائمة العامة خلال دقيقة.');
        setTimeout(() => router.push('/equipment-owner/profile'), 1500);
      } else {
        throw new Error('فشل في تحديث البيانات.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEquipment = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه المعدة؟ سيتم حذف جميع صورها وبياناتها بشكل نهائي.')) {
      return;
    }
    setDeleting(true);
    setError('');
    try {
      const result = await deleteEquipmentAction(equipment.id);
      if (result.success) {
        router.push('/equipment-owner/profile');
      } else {
        throw new Error(result.error || 'فشل في حذف المعدة.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">تعديل المعدة</h2>
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded text-right">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded text-right">{success}</div>}
      {isProcessingImages && <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded text-right">جاري معالجة الصور...</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Management Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-2">الصور الحالية</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {existingPhotoUrls.map((url) => (
              <div key={url} className="relative group">
                <Image src={url} alt="صورة حالية" width={200} height={200} className="w-full h-28 object-cover rounded-md" />
                <button type="button" onClick={() => handleRemoveExistingPhoto(url)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs leading-none opacity-50 group-hover:opacity-100">
                  &times;
                </button>
              </div>
            ))}
            {newPhotoPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <Image src={preview} alt={`معاينة ${index + 1}`} width={200} height={200} className="w-full h-28 object-cover rounded-md border-2 border-blue-400" />
                <button type="button" onClick={() => handleRemoveNewPhoto(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs leading-none opacity-50 group-hover:opacity-100">
                  &times;
                </button>
              </div>
            ))}
          </div>
          {(existingPhotoUrls.length + newPhotoFiles.length) < MAX_PHOTOS && (
            <div className="mt-4">
              <label className="block w-full text-center px-3 py-4 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                <span className="block text-sm text-gray-600">إضافة المزيد من الصور (بحد أقصى {MAX_PHOTOS})</span>
                <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" disabled={isProcessingImages} />
              </label>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 text-right mb-1">اسم المعدة</label>
            <input type="text" name="name" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-right" value={formData.name} onChange={handleChange} dir="rtl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 text-right mb-1">نوع المعدة</label>
            <select name="equipmentType" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-right" value={formData.equipmentType} onChange={handleChange} dir="rtl">
              <option value="">اختر نوع المعدة</option>
              <option value="حفار">حفار</option>
              <option value="سيزر">سيزر</option>
              <option value="لودر">لودر</option>
              <option value="ونش">ونش</option>
              <option value="مانلفت">مانلفت</option>
              <option value="فورك">فورك</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 text-right mb-1">السعر</label>
            <input type="number" name="price" required={!priceOnRequest} disabled={priceOnRequest} className={`w-full px-3 py-2 border border-gray-300 rounded-md text-right ${priceOnRequest ? 'bg-gray-100' : ''}`} value={formData.price} onChange={handleChange} dir="rtl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 text-right mb-1">الحالة</label>
            <select name="status" className="w-full px-3 py-2 border border-gray-300 rounded-md text-right" value={formData.status} onChange={handleChange}>
              <option value="rent">للإيجار</option>
              <option value="sale">للبيع</option>
              <option value="work">تعمل الان (غير متاح)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 text-right mb-1">الوصف</label>
            <textarea name="description" className="w-full px-3 py-2 border border-gray-300 rounded-md text-right" rows={4} value={formData.description} onChange={handleChange} dir="rtl" />
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

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          <button type="button" onClick={handleDeleteEquipment} disabled={deleting} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
            {deleting ? 'جاري الحذف...' : 'حذف المعدة'}
          </button>
          <div className="flex gap-4">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              إلغاء
            </button>
            <button type="submit" disabled={saving || isProcessingImages} className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50`}>
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}