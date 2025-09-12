'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { createDriverAction } from '@/app/driver/actions';
import { createEquipmentOwnerAction } from '@/app/equipment-owner/actions';
import { setCustomClaimsForUser } from '@/app/auth/actions';
import { auth } from '@/lib/firebase/config';
// أضف هذه الاستيرادات
import { EmailAuthProvider, linkWithCredential } from 'firebase/auth';

type UserType = 'drivers' | 'equipmentOwners';

const CompleteProfileForm = () => {
  // ... باقي الكود
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumberFromQuery = searchParams.get('phoneNumber');

  const [userType, setUserType] = useState<UserType>('drivers');
const phoneNumber = phoneNumberFromQuery || '';  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [hasLicense, setHasLicense] = useState(true);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        if (userType === 'drivers') {
          router.push('/driver/profile');
        } else {
          router.push('/equipment-owner/profile');
        }
      }, 3000); // 3-second delay

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [success, userType, router]);
  

  useEffect(() => {
    if (!phoneNumberFromQuery) {
      router.push('/auth/register');
    }
  }, [phoneNumberFromQuery, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    const currentUser = auth.currentUser;
    const fullPhoneNumber = `+20${phoneNumber.substring(1)}`;

      if (!currentUser || currentUser.phoneNumber !== fullPhoneNumber) {
        setError('جلسة المستخدم غير صالحة أو لا تتطابق مع رقم الهاتف. يرجى إعادة عملية التسجيل.');
        auth.signOut();
        router.push('/auth/register');
        return;
    }

    setLoading(true);
    console.log('Submitting form...');

    try {
      // 1. Prepare data for Firestore
      console.log('Step 2: Preparing data for Firestore...');
      const uid = currentUser.uid;
      const commonData = {
        uid,
        phoneNumber: fullPhoneNumber,
        name,
        address, // Add address to common data
        userType,
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        password, // This should be handled by the action (hashing)
        photoUrl: '', // Default empty photoUrl
      };
      console.log('Step 2 complete. Common data:', commonData);

      // 3. Create document in Firestore
      console.log('Step 3: Creating document in Firestore...');
      let result;
      if (userType === 'drivers') {
        result = await createDriverAction(fullPhoneNumber, {
          ...commonData,
          age: Number.isNaN(parseInt(age)) ? 0 : parseInt(age),
          equipmentType,
          isAvailable,
          hasLicense,
        });
      } else {
        result = await createEquipmentOwnerAction(fullPhoneNumber, commonData);
      }
      console.log('Step 3 complete. Firestore result:', result);

      // 4. Link credentials and finalize
      console.log('Step 4: Linking credentials and finalizing...');
      if (result.success) {
        console.log('Step 4a: Setting custom claims...');
        const claimsResult = await setCustomClaimsForUser(uid, phoneNumber, userType);
        console.log('Step 4a complete. Claims result:', claimsResult);
        if (claimsResult.success) {
          try {
            console.log('Step 4b: Linking credentials...');
            const email = `${fullPhoneNumber}@app.com`; // Use full phone number for email
            const credential = EmailAuthProvider.credential(email, password);
            await linkWithCredential(currentUser, credential);
            console.log('Step 4b complete. Credentials linked.');
            
            setSuccess(`تم إنشاء حساب ${userType === 'drivers' ? 'السائق' : 'صاحب المعدات'} بنجاح`);
          } catch (error) {
  const linkError = error as { code?: string; message?: string };
  if (linkError.code === 'auth/credential-already-in-use') {
    setError('هذا الحساب مرتبط بالفعل بمستخدم آخر.');
  } else {
    setError('فشل في ربط طريقة الدخول الجديدة.');
  }
  return;
}
        } else {
          setError(claimsResult.error || 'فشل في تعيين المطالبات المخصصة');
          return;
        }
      } else {
        setError('فشل في حفظ بيانات الحساب في Firestore');
      }
    } catch (err) {
      setError('حدث خطأ أثناء إنشاء الحساب');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
        إكمال بياناتك
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 text-center">
          <Image src="https://firebasestorage.googleapis.com/v0/b/manlift-36e37.appspot.com/o/project%2FafterSuccesRegister.jpg?alt=media&token=31f41667-8b7b-4a82-abd4-3885a950a7df" alt="Registration Successful" width={160} height={160} className="w-40 h-40 mx-auto rounded-full" />
          <h3 className="mt-4 text-xl font-bold text-green-700">اكتمل التسجيل بنجاح!</h3>
          <p className="text-gray-600 mt-2">سيتم توجيهك الآن إلى صفحتك الشخصية...</p>
        </div>
      )}

      {!success && (
        <>
          <div className="mb-3">
            <p className="text-center text-sm font-medium text-gray-700 mb-4">اختر نوع حسابك:</p>
            <div className="grid grid-cols-2 gap-4">
              {/* Equipment Owner Card */}
              <div
                onClick={() => setUserType('equipmentOwners')}
                className={`p-2 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all ${
                  userType === 'equipmentOwners'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-blue-400'
                }`}
              >
                <Image src="https://firebasestorage.googleapis.com/v0/b/manlift-36e37.appspot.com/o/project%2Fowner.png?alt=media&token=5f607a33-9827-4056-8d8f-cb40e143cc7e" alt="صاحب معدة" width={100} height={100}  />
                <span className="font-semibold text-gray-800">صاحب معدات</span>
              </div>

              {/* Driver Card */}
              <div
                onClick={() => setUserType('drivers')}
                className={`p-2 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all ${
                  userType === 'drivers'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-blue-400'
                }`}
              >
                <Image src="https://firebasestorage.googleapis.com/v0/b/manlift-36e37.appspot.com/o/project%2Fdriver.png?alt=media&token=7f2d421b-ed13-4bb9-a1d3-bf5a6cc2d698" alt="سائق" width={100} height={100}  />
                <span className="font-semibold text-gray-800">سائق</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 text-right mb-1"
                >
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
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 text-right mb-1"
                >
                  العنوان (اختياري)
                </label>
                <input
                  id="address"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  dir="rtl"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 text-right mb-1"
                >
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
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 text-right mb-1"
                >
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
                    <label
                      htmlFor="age"
                      className="block text-sm font-medium text-gray-700 text-right mb-1"
                    >
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
                    <label
                      htmlFor="equipmentType"
                      className="block text-sm font-medium text-gray-700 text-right mb-1"
                    >
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
                      <option value="مانلفت">مانلفت</option>
                      <option value="فورك">فورك</option>
                      <option value="سيزر">سيزر</option>
                      <option value="ونش">ونش</option>
                      <option value="لودر">لودر</option>
                      <option value="حفار">حفار</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                      متاح للعمل حالياً؟ *
                    </label>
                    <div className="flex space-x-4 rtl:space-x-reverse">
                      <div className="flex items-center ">
                        <input
                          id="available-no"
                          type="radio"
                          name="isAvailable"
                          checked={!isAvailable}
                          onChange={() => setIsAvailable(false)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label
                          htmlFor="available-no"
                          className="mr-2 block text-sm text-gray-700"
                        >
                          لا
                        </label>
                      </div>
                      <div className="flex items-center mx-4">
                        <input
                          id="available-yes"
                          type="radio"
                          name="isAvailable"
                          checked={isAvailable}
                          onChange={() => setIsAvailable(true)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label
                          htmlFor="available-yes"
                          className="mr-2 block text-sm text-gray-700"
                        >
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
                        <label
                          htmlFor="license-no"
                          className="mr-2 block text-sm text-gray-700"
                        >
                          لا
                        </label>
                      </div>
                      <div className="flex items-center mx-4">
                        <input
                          id="license-yes"
                          type="radio"
                          name="hasLicense"
                          checked={hasLicense}
                          onChange={() => setHasLicense(true)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label
                          htmlFor="license-yes"
                          className="mr-2 block text-sm text-gray-700"
                        >
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
        </>
      )}
    </div>
  );
};

export default CompleteProfileForm;
