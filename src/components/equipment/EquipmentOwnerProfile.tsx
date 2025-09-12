'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getEquipmentsByOwner, getEquipmentOwner } from '@/lib/firebase/firestore';
import { useRouter } from 'next/navigation';
import { OwnerData, Equipment } from '@/lib/interface';
import { auth } from '@/lib/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { logout } from '@/lib/firebase/auth';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import { updateEquipmentOwnerAction, changeEquipmentOwnerPasswordAction } from '@/app/equipment-owner/actions';
import ProfileImageUploader from '@/components/common/ProfileImageUploader';


const EquipmentOwnerProfile = () => {
  const router = useRouter();
  const [user, loadingUser] = useAuthState(auth);

  const [ownerData, setOwnerData] = useState<OwnerData | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [equipmentLoading, setEquipmentLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push('/auth/login');
    }
  }, [user, loadingUser, router]);

  useEffect(() => {
    if (loadingUser || !user) return;

    const rawPhoneNumber = user.phoneNumber;
    if (!rawPhoneNumber) {
      setError('فشل في الحصول علي رقم الهاتف من حساب المستخدم');
      setIsLoading(false);
      setEquipmentLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setEquipmentLoading(true);
      try {
        const [equipmentListResult, ownerProfileResult] = await Promise.all([
          getEquipmentsByOwner(rawPhoneNumber),
          getEquipmentOwner(rawPhoneNumber),
        ]);

        if (ownerProfileResult.success && ownerProfileResult.data) {
          setOwnerData(ownerProfileResult.data);
          setFormData({
            name: ownerProfileResult.data.name || '',
            address: ownerProfileResult.data.address || '',
          });
          if (!ownerProfileResult.data.isVerified) {
            const createdAt = new Date(ownerProfileResult.data.createdAt || 0).getTime();
            const updatedAt = new Date(ownerProfileResult.data.updatedAt || 0).getTime();
            const diffInSeconds = (updatedAt - createdAt) / 1000;

            if (diffInSeconds > 60) { // More than 1 minute difference
              setVerificationMessage('تم إلغاء تفعيل حسابك لمخالفة سياسات وشروط الموقع. يرجى التواصل مع الإدارة.');
            } else {
              setVerificationMessage('حسابك قيد المراجعة حاليًا وسيتم تفعيله قريبًا.');
            }
          }
        } else {
          setError('فشل في تحميل بيانات صاحب المعدات: ' + (ownerProfileResult.error || ''));
        }

        if (equipmentListResult.success) {
          setEquipment(equipmentListResult.data as Equipment[]);
        } else {
          setError('فشل في تحميل بيانات المعدات: ' + (equipmentListResult.error || ''));
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات');
        console.error('Fetch data error:', err);
      } finally {
        setIsLoading(false);
        setEquipmentLoading(false);
      }
    };

    fetchData();
  }, [user, loadingUser]);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/auth/login');
  }, [router]);

  const navigateToAddEquipment = useCallback(() => {
    router.push('/equipment-owner/add-equipment');
  }, [router]);

  if (isLoading && !ownerData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button onClick={handleLogout} className="text-sm text-red-700 hover:text-gray-800">تسجيل الخروج</button>
        <h2 className="text-2xl font-bold text-gray-800">
          {ownerData?.name || 'ملفي الشخصي'}
        </h2>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-right">{success}</div>}

      {ownerData && !ownerData.isVerified && <VerificationAlert message={verificationMessage} />}

      {isChangingPassword ? (
        <ChangePasswordForm
          pageLoading={isLoading}
          handleSubmit={async (e: React.FormEvent, passwords: { [key: string]: string }) => {
            e.preventDefault();

            if (passwords.newPassword !== passwords.confirmPassword) {
              setError('كلمتا المرور الجديدتان غير متطابقتين');
              return;
            }

            setError(null);
            setSuccess(null);
            setIsLoading(true);

            if (!user) {
              router.push('/auth/login');
              return;
            }

            try {
              const result = await changeEquipmentOwnerPasswordAction(
                user.phoneNumber!,
                passwords.oldPassword,
                passwords.newPassword
              );

              if (result.success) {
                setSuccess('تم تغيير كلمة المرور بنجاح');
                setIsChangingPassword(false);
              } else {
                setError(result.error as string);
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
            } finally {
              setIsLoading(false);
            }
          }}
          onCancel={() => {
            setIsChangingPassword(false);
          }}
        />
      ) : isEditing ? (
        <EditForm
          formData={formData}
          pageLoading={isLoading}
          handleInputChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
          handleSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setSuccess(null);
            setIsLoading(true);

            if (!user) {
              router.push('/auth/login');
              return;
            }

            try {
              const updateResult = await updateEquipmentOwnerAction(user.phoneNumber!, {
                name: formData.name,
                address: formData.address,
              });

              if (updateResult.success && updateResult.data) {
                setSuccess('تم تحديث البيانات بنجاح.');
                setOwnerData(updateResult.data as OwnerData);
                setIsEditing(false);
              } else {
                throw new Error(updateResult.error?.toString() || 'فشل في تحديث البيانات');
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
            } finally {
              setIsLoading(false);
            }
          }}
          onCancel={() => {
            setIsEditing(false);
          }}
        />
      ) : (
        <ProfileView ownerData={ownerData} onEdit={() => setIsEditing(true)} setIsChangingPassword={setIsChangingPassword} setOwnerData={setOwnerData} />
      )}

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 text-right">معداتي</h3>
            {ownerData?.isVerified && (
              <button onClick={navigateToAddEquipment} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium">
                إضافة معدات جديدة
              </button>
            )}
        </div>

        {equipmentLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((item) => (
              <EquipmentCard key={item.id} item={item} showAdminControls={true} />
            ))}
          </div>
        )}

        {equipment.length === 0 && !equipmentLoading && ownerData?.isVerified && (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">لا توجد معدات مسجلة</p>
            <button onClick={navigateToAddEquipment} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              إضافة معدات جديدة
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentOwnerProfile;

const VerificationAlert = ({ message }: { message: string }) => (
  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 text-right">
    <p className="font-bold">الحساب غير مفعل</p>
    <p>{message}</p>
  </div>
);

interface ProfileViewProps {
  ownerData: OwnerData | null;
  onEdit: () => void;
  setIsChangingPassword: (isChanging: boolean) => void;
  setOwnerData: React.Dispatch<React.SetStateAction<OwnerData | null>>;
}

const ProfileView = ({ ownerData, onEdit, setIsChangingPassword, setOwnerData }: ProfileViewProps) => (
  <div>
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/3">
        <ProfileImageUploader
          currentPhotoUrl={ownerData?.photoUrl}
          userType="equipmentOwners"
          userId={ownerData?.phoneNumber || ''}
          onPhotoUpdate={(newUrl) => {
            setOwnerData(prev => prev ? { ...prev, photoUrl: newUrl || undefined } : null);
          }}
        />
      </div>
      <div className="md:w-2/3">
        <ProfileField label="الاسم" value={ownerData?.name || 'غير محدد'} />
        {ownerData?.address && (
          <ProfileField label="العنوان" value={ownerData.address} />
        )}
      </div>
    </div>
    <div className="mt-6 ms-4 flex justify-end space-x-6 rtl:space-x-reverse">
      <button onClick={onEdit} className="px-4 py-2 mx-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
        تعديل البيانات
      </button>
      <button onClick={() => setIsChangingPassword(true)} className=" px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
        تغيير كلمة المرور
      </button>
    </div>
  </div>
);



interface ChangePasswordFormProps {
  pageLoading: boolean;
  handleSubmit: (e: React.FormEvent, passwords: { [key: string]: string }) => void;
  onCancel: () => void;
}

const ChangePasswordForm = ({ pageLoading, handleSubmit, onCancel }: ChangePasswordFormProps) => {
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, passwords)} className="space-y-6">
      <FormInput
        label="كلمة المرور القديمة"
        name="oldPassword"
        type="password"
        required
        value={passwords.oldPassword}
        onChange={handlePasswordChange}
      />
      <FormInput
        label="كلمة المرور الجديدة"
        name="newPassword"
        type="password"
        required
        value={passwords.newPassword}
        onChange={handlePasswordChange}
      />
      <FormInput
        label="تأكيد كلمة المرور الجديدة"
        name="confirmPassword"
        type="password"
        required
        value={passwords.confirmPassword}
        onChange={handlePasswordChange}
      />
      <div className="flex justify-end space-x-6 rtl:space-x-reverse ">
        <button type="button" onClick={onCancel} className="px-4 py-2 mx-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          إلغاء
        </button>
        <button type="submit" disabled={pageLoading} className={`px-4  py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${pageLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
          {pageLoading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
        </button>
      </div>
    </form>
  );
};

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
  formData: { name: string; address: string; };
  pageLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const EditForm = ({ formData, pageLoading, handleInputChange, handleSubmit, onCancel }: EditFormProps) => {

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-4">
          <FormInput label="الاسم" name="name" type="text" required value={formData.name} onChange={handleInputChange} />
          <FormInput label="العنوان" name="address" type="text" value={formData.address} onChange={handleInputChange} />
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