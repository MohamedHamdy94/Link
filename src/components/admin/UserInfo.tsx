import React from 'react'
import { UserInfoProps } from '@/lib/interface';

const UserInfo: React.FC<UserInfoProps> = ({ user, handleToggleVerification }) => {
  return (
    <tr key={user.id}>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="text-sm font-medium text-gray-900">{user.name || 'غير محدد'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="text-sm text-gray-500 dir-ltr text-right">{user.phoneNumber || 'غير محدد'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="text-sm text-gray-500">
          {user.userType === 'drivers' ? 'سائق' : 'صاحب معدات'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.isVerified 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.isVerified ? 'مفعل' : 'غير مفعل'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => handleToggleVerification(user.userType, user.id, user.isVerified)}
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
export default UserInfo