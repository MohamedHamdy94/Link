import React from 'react';
import Image from 'next/image';
import { UserInfoProps } from '@/lib/interface';

const UserInfo: React.FC<UserInfoProps> = ({ user, handleToggleVerification }) => {
  console.log(user.photoUrl)
  return (
    <tr>
      {/* عمود الصورة */}
      <td className="px-2 py-3 whitespace-nowrap">
        <div className="flex items-center justify-center">
          {user.photoUrl ? (
            <Image 
              src={user.photoUrl}
              alt={user.name || 'صورة المستخدم'}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">لا يوجد</span>
            </div>
          )}
        </div>
      </td>
      
      {/* عمود الاسم */}
      <td className="px-3 py-4 whitespace-nowrap text-right">
        <div className="text-sm font-medium text-gray-900">
          {user.name || 'غير محدد'}
        </div>
      </td>
      
      {/* عمود رقم الهاتف */}
      <td className="px-3 py-4 whitespace-nowrap text-right">
        <div className="text-sm text-gray-500 dir-ltr text-right">
          {user.phoneNumber || 'غير محدد'}
        </div>
      </td>
      
      {/* عمود نوع المستخدم */}
      <td className="px-3 py-4 whitespace-nowrap text-right">
        <div className="text-sm text-gray-500">
          {user.userType === 'drivers' ? 'سائق' : 'صاحب معدات'}
        </div>
      </td>
      
      {/* عمود حالة التفعيل */}
      <td className="px-3 py-4 whitespace-nowrap text-right">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.isVerified 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.isVerified ? 'مفعل' : 'غير مفعل'}
        </span>
      </td>
      
      {/* عمود الإجراءات */}
      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => handleToggleVerification(user.userType, user.phoneNumber, user.isVerified)}
          className={`px-3 py-1 rounded-md text-xs text-white ${
            user.isVerified 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {user.isVerified ? 'إلغاء التفعيل' : 'تفعيل'}
        </button>
      </td>
    </tr>
  );
};

export default UserInfo;