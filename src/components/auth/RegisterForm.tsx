"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDriver, createEquipmentOwner } from '@/lib/firebase/firestore';
import { getWhatsAppGroupLink } from '@/lib/firebase/auth';

type UserType = 'drivers' | 'equipmentOwners';

const RegisterForm = () => {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('drivers');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [hasLicense, setHasLicense] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [whatsAppLink, setWhatsAppLink] = useState('');
  const [photoUrl, setphotoUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setphotoUrl('')
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    
    setLoading(true);
    
    try {
      if (userType === 'drivers') {
        // Create driver
        const result = await createDriver( phoneNumber,{
          phoneNumber,
          password,
          name,
          age: parseInt(age),
          equipmentType,
          isAvailable,
          hasLicense,
          photoUrl,
          userType ,
          isVerified: false,
          createdAt: new Date()
        });
        
        if (result.success) {
          setSuccess('تم إنشاء حساب السائق بنجاح');
          setWhatsAppLink(getWhatsAppGroupLink());
        } else {
          setError(result.error || 'فشل في إنشاء الحساب');
        }
      } else {
        // Create equipment owner
        const result = await createEquipmentOwner( phoneNumber,{
          phoneNumber,
          password,
          name,
          userType,
          photoUrl,
          isVerified: false,
          createdAt: new Date()
        });
        
        if (result.success) {
          setSuccess('تم إنشاء حساب صاحب المعدات بنجاح');
          setWhatsAppLink(getWhatsAppGroupLink());
        } else {
          setError(result.error || 'فشل في إنشاء الحساب');
        }
      }
    } catch (err) {
      setError('حدث خطأ أثناء إنشاء الحساب');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">إنشاء حساب جديد</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-right">
          <p>{success}</p>
          <p className="mt-2">
            يرجى الانضمام إلى مجموعة الواتساب للتحقق من رقم هاتفك وتفعيل حسابك:
            <a 
              href={whatsAppLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block mt-1 text-blue-600 hover:text-blue-800"
            >
              رابط مجموعة الواتساب
            </a>
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            الذهاب إلى صفحة تسجيل الدخول
          </button>
        </div>
      )}
      
      {!success && (
        <>
          <div className="mb-6">
            <div className="flex justify-center space-x-4 rtl:space-x-reverse">
              <button
                type="button"
                onClick={() => setUserType('equipmentOwners')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  userType === 'equipmentOwners' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                صاحب معدات
              </button>
              <button
                type="button"
                onClick={() => setUserType('drivers')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  userType === 'drivers' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                سائق
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 text-right mb-1">
                  رقم الهاتف *
                </label>
                <input
                  id="phoneNumber"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  dir="rtl"
                />
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-right mb-1">
                  الاسم *
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-right mb-1">
                  كلمة المرور *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="rtl"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 text-right mb-1">
                  تأكيد كلمة المرور *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  dir="rtl"
                />
              </div>
              
              {userType === 'drivers' ? (
                <>
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 text-right mb-1">
                      السن *
                    </label>
                    <input
                      id="age"
                      type="number"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
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
                      <option value="جرافة">جرافة</option>
                      <option value="لودر">لودر</option>
                      <option value="بلدوزر">بلدوزر</option>
                      <option value="رافعة">رافعة</option>
                      <option value="شاحنة نقل">شاحنة نقل</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                      متاح للعمل حالياً؟ *
                    </label>
                    <div className="flex space-x-4 rtl:space-x-reverse">
                      <div className="flex items-center">
                        <input
                          id="available-no"
                          type="radio"
                          name="isAvailable"
                          checked={!isAvailable}
                          onChange={() => setIsAvailable(false)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="available-no" className="mr-2 block text-sm text-gray-700">
                          لا
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="available-yes"
                          type="radio"
                          name="isAvailable"
                          checked={isAvailable}
                          onChange={() => setIsAvailable(true)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="available-yes" className="mr-2 block text-sm text-gray-700">
                          نعم
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                      يحمل رخصة أصلية؟ *
                    </label>
                    <div className="flex space-x-4 rtl:space-x-reverse">
                      <div className="flex items-center">
                        <input
                          id="license-no"
                          type="radio"
                          name="hasLicense"
                          checked={!hasLicense}
                          onChange={() => setHasLicense(false)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="license-no" className="mr-2 block text-sm text-gray-700">
                          لا
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="license-yes"
                          type="radio"
                          name="hasLicense"
                          checked={hasLicense}
                          onChange={() => setHasLicense(true)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="license-yes" className="mr-2 block text-sm text-gray-700">
                          نعم
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                ''
              )}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                تسجيل الدخول
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default RegisterForm;
