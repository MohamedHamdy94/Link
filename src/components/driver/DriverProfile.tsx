'use client';

import React, { useState, useEffect } from 'react';
import { getDriver } from '@/lib/firebase/firestore';
import { updateDriverAction } from '@/app/driver/actions';
import { uploadDriverPhoto, deleteFileByUrl } from '@/lib/firebase/storage';
import {  logout } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link'; // Added Link import
import { DocumentData } from 'firebase/firestore';
import { Driver } from '@/lib/interface';
// import { UpdateResult, Drive } from '@/lib/interface';

import { auth } from '@/lib/firebase/config'; 
import { useAuthState } from 'react-firebase-hooks/auth';

const DriverProfile = () => {
  const router = useRouter();
    const [user, loading] = useAuthState(auth);

  const [looading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [driverData, setDriverData] = useState<Driver | null>(null);
  const [isEditing, setIsEditing] = useState(false);
    const [phoneNumber, setIsPhoneNumber] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    equipmentType: '',
    isAvailable: false,
    hasLicense: false,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);
 useEffect(() => {
  const fetchDriverData = async () => {
    if (loading || !user) return;

    const match = user.email?.match(/^(\d+)@/);
    const id = match ? match[1] :'';


    setIsPhoneNumber(id);

    try {
      const result = await getDriver(id);

      if (result.success && result.data) {
        const toDriver = (id: string, data: DocumentData): Driver => ({
          id,
          name: data.name || '',
          age: data.age || 0,
          equipmentType: data.equipmentType || '',
          isAvailable: data.isAvailable || false,
          hasLicense: data.hasLicense || false,
          photoUrl: data.photoUrl || undefined,
          phoneNumber: data.phoneNumber || '',
          isVerified: data.isVerified || false,
          userType: data.userType,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : undefined,
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate().toISOString() : new Date().toISOString(), // Ensure it's always a string
        });

        const driver = toDriver(id, result.data);
        setDriverData(driver);
        setFormData({
          name: driver.name,
          age: driver.age.toString(),
          equipmentType: driver.equipmentType,
          isAvailable: driver.isAvailable,
          hasLicense: driver.hasLicense,
        });
        setPhotoPreview(driver.photoUrl || '');
        console.log('Driver photoUrl:', driver.photoUrl);
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
}, [loading, user]);


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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      let newPhotoUrl = driverData?.photoUrl || '';
      const oldPhotoUrl = driverData?.photoUrl; // حفظ رابط الصورة القديمة

      // Upload new photo if selected
      if (photoFile) {
        const uploadResult = await uploadDriverPhoto(phoneNumber, photoFile);
        
        if (!uploadResult.success) {
          setError(uploadResult.error?.toString() || 'فشل في رفع الصورة');
          setLoading(false);
          return;
        }
        if (uploadResult.success && uploadResult.url) {
          newPhotoUrl = uploadResult.url;
          setPhotoPreview(newPhotoUrl);

          // حذف الصورة القديمة إذا كانت موجودة ومختلفة عن الجديدة
          if (oldPhotoUrl && oldPhotoUrl !== newPhotoUrl) {
            const deleteResult = await deleteFileByUrl(oldPhotoUrl);
            if (!deleteResult.success) {
              console.warn('Failed to delete old photo:', deleteResult.error);
              // لا نوقف العملية هنا، لأن الصورة الجديدة تم رفعها بنجاح
            }
          }
        }
      }
      
      // Update driver data
      const updateResult = await updateDriverAction(phoneNumber, {
        name: formData.name,
        age: parseInt(formData.age),
        equipmentType: formData.equipmentType,
        isAvailable: formData.isAvailable,
        hasLicense: formData.hasLicense,
        userType: 'drivers',
        photoUrl: newPhotoUrl, // استخدم الرابط الجديد هنا
        phoneNumber: driverData?.phoneNumber || '',
        isVerified: driverData?.isVerified || false,
        updatedAt: new Date().toISOString(), // تحويل إلى string
      });
  
      if (updateResult.success && updateResult.data) {
        setSuccess('تم تحديث البيانات بنجاح');
        setDriverData(updateResult.data  as Driver);
        setIsEditing(false);
      } else {
        setError(updateResult.error?.toString() || 'فشل في تحديث البيانات');
      }
    } catch (err) {
      setError(`حدث خطأ غير متوقع: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error updating driver:', err);
    } finally {
      setLoading(false);
    }
  };

  
  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };
  
  if (looading && !driverData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!driverData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">لا يمكن تحميل بيانات السائق</p>
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
      
      {/* رسائل التنبيه */}
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
      
      {!driverData.isVerified && (
        <VerificationAlert />
      )}
      
      {isEditing ? (
        <EditForm 
          formData={formData}
          photoPreview={photoPreview}
          looading={looading}
          handleInputChange={handleInputChange}
          handlePhotoChange={handlePhotoChange}
          handleSubmit={handleSubmit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ProfileView 
          driverData={driverData}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  );
};

// مكون لعرض رسالة التحقق
const VerificationAlert = () => (
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
);

// مكون لعرض البيانات
interface ProfileViewProps {
  driverData: Driver;
  onEdit: () => void;
}

const ProfileView = ({ driverData, onEdit }: ProfileViewProps) => (
  <div>
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/3">
        <div className="relative w-40 h-40 mx-auto overflow-hidden rounded-full bg-gray-100">
          {driverData.photoUrl ? (
            <Image
              src={driverData.photoUrl}
              alt="صورة السائق"
              width={160}
              height={160}
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
        <ProfileField label="الاسم" value={driverData.name} />
        <ProfileField label="السن" value={driverData.age.toString()} />
        <ProfileField label="نوع المعدة" value={driverData.equipmentType} />
        <ProfileField label="متاح للعمل" value={driverData.isAvailable ? 'نعم' : 'لا'} />
        <ProfileField label="يحمل رخصة أصلية" value={driverData.hasLicense ? 'نعم' : 'لا'} />
        <ProfileField label="رقم الهاتف" value={driverData.phoneNumber} />
        <ProfileField 
          label="حالة الحساب" 
          value={driverData.isVerified ? 'مفعل' : 'غير مفعل'}
          valueClassName={driverData.isVerified ? 'text-green-600' : 'text-red-600'}
        />
      </div>
    </div>
    
    <div className="mt-6 flex justify-end space-x-4 rtl:space-x-reverse">
      <Link
        href="/auth/update-password"
        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        تعديل كلمة المرور
      </Link>
      <button
        onClick={onEdit}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        تعديل البيانات
      </button>
    </div>
  </div>
);

// مكون لحقل العرض
interface ProfileFieldProps {
  label: string;
  value: string;
  valueClassName?: string;
}

const ProfileField = ({ label, value, valueClassName = '' }: ProfileFieldProps) => (
  <div className="py-3 flex justify-between">
    <dd className={`text-gray-900 ${valueClassName}`}>{value || 'غير محدد'}</dd>
    <dt className="text-gray-500 font-medium">{label}</dt>
  </div>
);

// مكون لتعديل البيانات
interface EditFormProps {
  formData: {
    name: string;
    age: string;
    equipmentType: string;
    isAvailable: boolean;
    hasLicense: boolean;
  };
  photoPreview: string;
  looading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const EditForm = ({
  formData,
  photoPreview,
  looading,
  handleInputChange,
  handlePhotoChange,
  handleSubmit,
  onCancel
}: EditFormProps) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/3">
        <div className="mb-4">
          <div className="relative w-40 h-40 mx-auto overflow-hidden rounded-full bg-gray-100">
            {photoPreview ? (
              <Image 
                src={photoPreview} 
                alt="صورة السائق" 
                width={160}
                height={160}
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
        <FormInput
          label="الاسم"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleInputChange}
        />
        
        <FormInput
          label="السن"
          name="age"
          type="number"
          required
          value={formData.age}
          onChange={handleInputChange}
        />
        
        <FormSelect
          label="نوع المعدة التي تقودها"
          name="equipmentType"
          required
          value={formData.equipmentType}
          onChange={handleInputChange}
          options={[
            { value: '', label: 'اختر نوع المعدة' },
            { value: 'مانلفت', label: 'مانلفت' },
            { value: 'فورك', label: 'فورك' },
            { value: 'سيزر', label: 'سيزر' },
            { value: 'ونش', label: 'ونش' },
            { value: 'لودر', label: 'لودر' },
            { value: 'حفار', label: 'حفار' },
          ]}
        />
        
        <FormCheckbox
          label="متاح للعمل الآن"
          name="isAvailable"
          checked={formData.isAvailable}
          onChange={handleInputChange}
        />
        
        <FormCheckbox
          label="أحمل رخصة أصلية"
          name="hasLicense"
          checked={formData.hasLicense}
          onChange={handleInputChange}
        />
      </div>
    </div>
    
    <div className="flex justify-end space-x-4 rtl:space-x-reverse">
      <button
        type="button"
        onClick={onCancel}
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
);

// مكونات مساعدة للاستخدام في النموذج
interface FormInputProps {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormInput = ({ label, name, type, required = false, value, onChange }: FormInputProps) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 text-right mb-1">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
      value={value}
      onChange={onChange}
      dir="rtl"
    />
  </div>
);

interface FormSelectProps {
  label: string;
  name: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}

const FormSelect = ({ label, name, required = false, value, onChange, options }: FormSelectProps) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 text-right mb-1">
      {label}
    </label>
    <select
      id={name}
      name={name}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
      value={value}
      onChange={onChange}
      dir="rtl"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

interface FormCheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormCheckbox = ({ label, name, checked, onChange }: FormCheckboxProps) => (
  <div className="flex items-center">
    <input
      id={name}
      name={name}
      type="checkbox"
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      checked={checked}
      onChange={onChange}
    />
    <label htmlFor={name} className="mr-2 block text-sm text-gray-700">
      {label}
    </label>
  </div>
);

export default DriverProfile;