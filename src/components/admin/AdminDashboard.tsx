"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/firebase/auth';
import { User } from '@/lib/interface';
import Image from 'next/image';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';

const AdminDashboard = () => {
  const router = useRouter();
  const [looading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [userType, setUserType] = useState<'all' | 'drivers' | 'equipmentOwners'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      const formattedUsers: User[] = data.map((user: User) => ({
        ...user,
        photoUrl: user.photoUrl || '/default-avatar.png',
        name: user.name || 'غير محدد',
        phoneNumber: user.phoneNumber || 'غير محدد',
        userType: user.userType === 'drivers' ? 'drivers' : 'equipmentOwners',
        isVerified: user.isVerified || false,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
      }));
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل البيانات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...users];

    if (filter === 'verified') result = result.filter(user => user.isVerified);
    else if (filter === 'unverified') result = result.filter(user => !user.isVerified);

    if (userType === 'drivers') result = result.filter(user => user.userType === 'drivers');
    else if (userType === 'equipmentOwners') result = result.filter(user => user.userType === 'equipmentOwners');

    if (searchTerm) {
      result = result.filter(user =>
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.includes(searchTerm))
      );
    }

    setFilteredUsers(result);
  }, [filter, userType, searchTerm, users]);

  const handleToggleVerification = async (userType: string, userId: string, currentStatus: boolean) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userType, userId, isVerified: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      setSuccess(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} الحساب بنجاح`);
      setUsers(users.map(user => (user.id === userId ? { ...user, isVerified: !currentStatus } : user)));
    } catch (err) {
      setError('حدث خطأ أثناء تحديث حالة الحساب');
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (looading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-right">لوحة تحكم المسؤول</h2>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-800 self-end md:self-auto"
        >
          تسجيل الخروج
        </button>
      </div>
      
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
      
      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-3 md:flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 rounded-md text-xs md:text-sm ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-2 py-1 rounded-md text-xs md:text-sm ${
              filter === 'verified' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            مفعل
          </button>
          <button
            onClick={() => setFilter('unverified')}
            className={`px-2 py-1 rounded-md text-xs md:text-sm ${
              filter === 'unverified' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            غير مفعل
          </button>
        </div>
        
        <div className="grid grid-cols-3 md:flex gap-2">
          <button
            onClick={() => setUserType('all')}
            className={`px-2 py-1 rounded-md text-xs md:text-sm ${
              userType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            الجميع
          </button>
          <button
            onClick={() => setUserType('drivers')}
            className={`px-2 py-1 rounded-md text-xs md:text-sm ${
              userType === 'drivers' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            السائقين
          </button>
          <button
            onClick={() => setUserType('equipmentOwners')}
            className={`px-2 py-1 rounded-md text-xs md:text-sm ${
              userType === 'equipmentOwners' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            أصحاب المعدات
          </button>
        </div>
        
        <input
          type="text"
          placeholder="بحث بالاسم أو رقم الهاتف"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-sm md:text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          dir="rtl"
        />
      </div>
      
      {/* Mobile View - Cards with Images */}
      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-4">
          {filteredUsers.map((user) => (
            <div key={user.phoneNumber} className="border rounded-lg p-3 shadow-sm flex flex-col h-full">
              {/* صورة المستخدم magesProfile.jpg*/}
              <div className="relative w-full h-32 mb-3">
                <Image
                  src={user.photoUrl || '/public/images/magesProfile.jpg'}
                  alt={user.name || 'صورة المستخدم'}
                  fill
                  className="object-cover rounded-t-lg"
                  quality={80}
                  unoptimized={process.env.NODE_ENV !== 'production'}
                />
              </div>
              
              {/* محتوى البطاقة */}
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isVerified ? 'مفعل' : 'غير مفعل'}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-1 dir-rtl truncate">
                  {user.phoneNumber}
                </p>
                
                <p className="text-xs text-gray-500 mb-3">
                  {user.userType === 'drivers' ? 'سائق' : 'صاحب معدات'}
                </p>
              </div>
              
              {/* زر التفعيل/إلغاء التفعيل */}
              <button
                onClick={() => handleToggleVerification(user.userType, user.phoneNumber, user.isVerified)}
                className={`w-full py-2 rounded-md text-xs font-medium text-white ${
                  user.isVerified ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {user.isVerified ? 'إلغاء التفعيل' : 'تفعيل'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table with Images */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الصورة
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الاسم
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                رقم الهاتف
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نوع المستخدم
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.phoneNumber}>
                <td className="px-6 py-4 whitespace-nowrap">
                <div className="relative h-10 w-10">
                    <Image
                      src={user.photoUrl || '/images/imagesProfile.jpg'}
                      alt={user.name || 'صورة المستخدم'}
                      fill
                      className="object-cover rounded-full"
                      quality={80}
                      unoptimized={process.env.NODE_ENV !== 'production'}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-500 dir-ltr text-right">
                    {user.phoneNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-500">
                    {user.userType === 'drivers' ? 'سائق' : 'صاحب معدات'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isVerified ? 'مفعل' : 'غير مفعل'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleToggleVerification(user.userType, user.phoneNumber, user.isVerified)}
                    className={`px-3 py-1 rounded-md text-xs text-white ${
                      user.isVerified ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {user.isVerified ? 'إلغاء التفعيل' : 'تفعيل'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;