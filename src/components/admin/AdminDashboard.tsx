"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllUsers, updateUserVerificationStatus,getVerifiedUsers, } from '@/lib/firebase/admin';
import { getSession, logout } from '@/lib/firebase/auth';
import UserInfo from "./UserInfo"
const AdminDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState('all'); // 'all', 'verified', 'unverified'
  const [userType, setUserType] = useState('all'); // 'all', 'driver', 'equipmentOwner'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkAdminAccess = async () => {
      const session = getSession();
      if (!session || session.role !== 'admin') {
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
      if (result.success) {
        setUsers(result.data);
        setFilteredUsers(result.data);
      } else {
        setError('فشل في تحميل بيانات المستخدمين');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحميل البيانات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters whenever filter state changes
    let result = [...users];
    
    // Filter by verification status
    if (filter === 'verified') {
      result = result.filter(user => user.isVerified);
    } else if (filter === 'unverified') {
      result = result.filter(user => !user.isVerified);
    }
    
    // Filter by user type
    if (userType === 'driver') {
      result = result.filter(user => user.userType === 'driver');
    } else if (userType === 'equipmentOwner') {
      result = result.filter(user => user.userType === 'equipmentOwner');
    }
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.phoneNumber?.includes(searchTerm)
      );
    }
    
    setFilteredUsers(result);
  }, [filter, userType, searchTerm, users]);

  const handleToggleVerification = async (usertype: string,userId: string, currentStatus: boolean) => {
    setError('');
    setSuccess('');
    
    try {
      const result = await updateUserVerificationStatus(usertype, userId, !currentStatus);
      
      if (result.success) {
        setSuccess(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} الحساب بنجاح`);
        
        // Update local state
        const updatedUsers = users.map(user => {
          if (user.id === userId) {
            return { ...user, isVerified: !currentStatus };
          }
          return user;
        });
        
        setUsers(updatedUsers);
      } else {
        setError('فشل في تحديث حالة الحساب');
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
    <div className="bg-white p-8 rounded-lg shadow-md max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          تسجيل الخروج
        </button>
        <h2 className="text-2xl font-bold text-gray-800">لوحة تحكم المسؤول</h2>
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
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'verified' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              الحسابات المفعلة
            </button>
            <button
              onClick={() => setFilter('unverified')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'unverified' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              الحسابات الغير مفعلة
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setUserType('all')}
              className={`px-3 py-1 rounded-md text-sm ${
                userType === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              جميع المستخدمين
            </button>
            <button
              onClick={() => setUserType('driver')}
              className={`px-3 py-1 rounded-md text-sm ${
                userType === 'driver' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              السائقين
            </button>
            <button
              onClick={() => setUserType('equipmentOwner')}
              className={`px-3 py-1 rounded-md text-sm ${
                userType === 'equipmentOwner' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              أصحاب المعدات
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الهاتف"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            dir="rtl"
          />
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">لا يوجد مستخدمين مطابقين للبحث</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  حالة التفعيل
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
  <UserInfo 
    key={user.id} 
    user={user} 
    handleToggleVerification={handleToggleVerification} 
  />
))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
