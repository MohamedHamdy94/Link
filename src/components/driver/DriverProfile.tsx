'use client';

import React, { useState, useEffect } from 'react';
import { getDriverByPhoneNumber } from '@/lib/firebase/firestore';
import { updateDriverAction } from '@/app/driver/actions';
import { logout } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Driver } from '@/lib/interface';
import { auth } from '@/lib/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import ProfileImageUploader from '@/components/common/ProfileImageUploader';

const DriverProfile = () => {
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);

  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [driverData, setDriverData] = useState<Driver | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationMessage, setVerificationMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    equipmentType: '',
    isAvailable: false,
    hasLicense: false,
    address: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchDriverData = async () => {
      if (authLoading || !user) return;

      const rawPhoneNumber = user.phoneNumber;

      if (!rawPhoneNumber) {
        setError('فشل في الحصول علي رقم الهاتف من حساب المستخدم');
        setPageLoading(false);
        return;
      }

      try {
        const result = await getDriverByPhoneNumber(rawPhoneNumber);
        if (result.success && result.data) {
          const driver = result.data as Driver;
          setDriverData(driver);
          setFormData({
            name: driver.name,
            age: driver.age.toString(),
            equipmentType: driver.equipmentType,
            isAvailable: driver.isAvailable,
            hasLicense: driver.hasLicense,
            address: driver.address || '',
          });

          if (!driver.isVerified) {
            const createdAt = new Date(driver.createdAt || 0).getTime();
            const updatedAt = new Date(driver.updatedAt || 0).getTime();
            const diffInSeconds = (updatedAt - createdAt) / 1000;

            if (diffInSeconds > 60) { // More than 1 minute difference
              setVerificationMessage('تم إلغاء تفعيل حسابك لمخالفة سياسات وشروط الموقع. يرجى التواصل مع الإدارة.');
            } else {
              setVerificationMessage('حسابك قيد المراجعة حاليًا وسيتم تفعيله قريبًا.');
            }
          }

          // Also set the phone number for display/use elsewhere if needed
          setPhoneNumber(rawPhoneNumber);
        } else {
          setError('فشل في تحميل بيانات السائق');
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات');
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchDriverData();
  }, [authLoading, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPageLoading(true);

    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      const updateResult = await updateDriverAction(phoneNumber, {
        name: formData.name,
        age: parseInt(formData.age),
        equipmentType: formData.equipmentType,
        isAvailable: formData.isAvailable,
        hasLicense: formData.hasLicense,
        address: formData.address,
      });

      if (updateResult.success && updateResult.data) {
        setSuccess('تم تحديث البيانات بنجاح. ستظهر التغييرات لجميع المستخدمين خلال دقيقة.');
        setDriverData(updateResult.data as Driver);
        setIsEditing(false);
      } else {
        throw new Error(updateResult.error?.toString() || 'فشل في تحديث البيانات');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setPageLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (authLoading || pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!driverData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">لا يمكن تحميل بيانات السائق. قد تحتاج إلى إكمال ملفك الشخصي.</p>
        <Link href="/auth/complete-profile" className="text-blue-500 hover:underline ml-2">إكمال الملف الشخصي</Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-800">تسجيل الخروج</button>
        <h2 className="text-2xl font-bold text-gray-800">الملف الشخصي للسائق</h2>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-right">{success}</div>}

      {!driverData.isVerified && <VerificationAlert message={verificationMessage} />}

      {isEditing ? (
        <EditForm
          formData={formData}
          pageLoading={pageLoading}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ProfileView driverData={driverData} onEdit={() => setIsEditing(true)} setDriverData={setDriverData} />
      )}
    </div>
  );
};

const VerificationAlert = ({ message }: { message: string }) => (
  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 text-right">
    <p className="font-bold">الحساب غير مفعل</p>
    <p>{message}</p>
  </div>
);

interface ProfileViewProps {
  driverData: Driver;
  onEdit: () => void;
  setDriverData: React.Dispatch<React.SetStateAction<Driver | null>>;
}

const ProfileView = ({ driverData, onEdit, setDriverData }: ProfileViewProps) => (
  <div>
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/3">
        <ProfileImageUploader
          currentPhotoUrl={driverData.photoUrl}
          userType="drivers"
          userId={driverData.phoneNumber}
          onPhotoUpdate={(newUrl) => {
            setDriverData(prev => prev ? { ...prev, photoUrl: newUrl || undefined } : null);
          }}
        />
      </div>
      <div className="md:w-2/3">
        <ProfileField label="الاسم" value={driverData.name} />
        <ProfileField label="السن" value={driverData.age.toString()} />
        <ProfileField label="العنوان" value={driverData.address || 'غير محدد'} />
        <ProfileField label="نوع المعدة" value={driverData.equipmentType} />
        <ProfileField label="متاح للعمل" value={driverData.isAvailable ? 'نعم' : 'لا'} />
        <ProfileField label="يحمل رخصة أصلية" value={driverData.hasLicense ? 'نعم' : 'لا'} />
        
        <ProfileField label="حالة الحساب" value={driverData.isVerified ? 'مفعل' : 'غير مفعل'} valueClassName={driverData.isVerified ? 'text-green-600' : 'text-red-600'} />
      </div>
    </div>
    <div className="mt-6 flex justify-end space-x-6 rtl:space-x-reverse">
      <Link href="/auth/update-password" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        تعديل كلمة المرور
      </Link>
      <button onClick={onEdit} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
        تعديل البيانات
      </button>
    </div>
  </div>
);

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

interface EditFormProps {
  formData: { name: string; age: string; equipmentType: string; isAvailable: boolean; hasLicense: boolean; address: string; };
  pageLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const EditForm = ({ formData, pageLoading, handleInputChange, handleSubmit, onCancel }: EditFormProps) => {

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-4">
          <FormInput label="الاسم" name="name" type="text" required value={formData.name} onChange={handleInputChange} />
          <FormInput label="السن" name="age" type="number" required value={formData.age} onChange={handleInputChange} />
          <FormInput label="العنوان" name="address" type="text" value={formData.address} onChange={handleInputChange} />
          <FormSelect label="نوع المعدة التي تقودها" name="equipmentType" required value={formData.equipmentType} onChange={handleInputChange} options={[{ value: '', label: 'اختر نوع المعدة' }, { value: 'مانلفت', label: 'مانلفت' }, { value: 'فورك', label: 'فورك' }, { value: 'سيزر', label: 'سيزر' }, { value: 'ونش', label: 'ونش' }, { value: 'لودر', label: 'لودر' }, { value: 'حفار', label: 'حفار' }]} />
          <FormCheckbox label="متاح للعمل الآن" name="isAvailable" checked={formData.isAvailable} onChange={handleInputChange} />
          <FormCheckbox label="أحمل رخصة أصلية" name="hasLicense" checked={formData.hasLicense} onChange={handleInputChange} />
        </div>
      </div>
      <div className="flex justify-end space-x-6 rtl:space-x-reverse">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          إلغاء
        </button>
        <button type="submit" disabled={pageLoading} className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${pageLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
          {pageLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </form>
  );
};

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
    <input id={name} name={name} type={type} required={required} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" value={value} onChange={onChange} dir="rtl" />
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
    <select id={name} name={name} required={required} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" value={value} onChange={onChange} dir="rtl">
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
    <input id={name} name={name} type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={checked} onChange={onChange} />
    <label htmlFor={name} className="mr-2 block text-sm text-gray-700">
      {label}
    </label>
  </div>
);

export default DriverProfile;
