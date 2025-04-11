"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllUsers, updateUserVerificationStatus } from '@/lib/firebase/admin';
import { getSession, logout } from '@/lib/firebase/auth';
import UserInfo from "./UserInfo";
import { User } from '@/lib/interface';

const AdminDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [userType, setUserType] = useState<'all' | 'drivers' | 'equipmentOwners'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkAdminAccess = async () => {
      const session = getSession();
      if (!session || session.role !== 'admins') {
        router.push('/auth/login');
        return;
      }
      fetchUsers();
    };
    checkAdminAccess();
  }, [router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers();
      if (result.success && result.data) {
        const formattedUsers: User[] = result.data.map(user => ({
          ...user,
          name: user.name || 'غير محدد',
          phoneNumber: user.phoneNumber || 'غير محدد',
          userType: user.userType === 'drivers' ? 'drivers' : 'equipmentOwners',
          isVerified: user.isVerified || false,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
        }));
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      } else {
        setError(result.error || 'فشل في تحميل بيانات المستخدمين');
      }
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
      const result = await updateUserVerificationStatus(userType, userId, !currentStatus);
      if (result.success) {
        setSuccess(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} الحساب بنجاح`);
        setUsers(users.map(user => user.id === userId ? { ...user, isVerified: !currentStatus } : user));
      } else {
        setError(result.error || 'فشل في تحديث حالة الحساب');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحديث حالة الحساب');
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (loading) {
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
      
      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">لا يوجد مستخدمين مطابقين للبحث</p>
        </div>
      ) : (
        <div className="md:hidden">
        <div className="grid grid-cols-2 gap-4">
          {filteredUsers.map((user) => (
            <div key={user.phoneNumber} className="border rounded-lg p-3">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm truncate">
                    {user.name || 'غير محدد'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isVerified ? 'مفعل' : 'غير مفعل'}
                  </span>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 text-left dir-rtl truncate">
                  {user.phoneNumber || 'غير محدد'}
                </div>
                
                <div className="mt-1 text-xs">
                  {user.userType === 'drivers' ? 'سائق' : 'صاحب معدات'}
                </div>
                
                <button
                  onClick={() => handleToggleVerification(user.userType, user.phoneNumber, user.isVerified)}
                  className={`mt-3 w-full py-1 rounded-md text-xs text-white ${
                    user.isVerified ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {user.isVerified ? 'إلغاء التفعيل' : 'تفعيل'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Desktop Table */}
     {/* Mobile View - 2 Cards per Row */}


{/* Desktop Table View */}
<div className="hidden md:block overflow-x-auto">
  {/* ... keep your existing table code ... */}
</div>
    </div>
  );
};

export default AdminDashboard;