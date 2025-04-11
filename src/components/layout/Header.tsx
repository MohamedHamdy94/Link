"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, logout, getUserType } from '@/lib/firebase/auth';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'drivers' | 'equipmentOwners'| "admins" | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    setIsLoggedIn(!!session);
    setUserType(getUserType());
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMenuOpen(false);
  };

  const getProfileLink = () => {
    if (userType === 'drivers') {
      return '/driver/profile';
    } else if (userType === 'equipmentOwners') {
      return '/equipment-owner/profile';
    }
    return '/auth/login';
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                موقع سائقي المعدات
              </Link>
            </div>
            <nav className="hidden md:mr-10 md:flex md:space-x-8 rtl:space-x-reverse">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                الرئيسية
              </Link>
              <Link
                href="/equipment"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/equipment'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                المعدات
              </Link>
              <Link
                href="/drivers"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/drivers'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                السائقين
              </Link>
            </nav>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-4 rtl:space-x-reverse">
            {isLoggedIn ? (
              <>
                <Link
                  href={getProfileLink()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                >
                  الملف الشخصي
                </Link>
                {userType === 'equipmentOwners' && (
                  <Link
                    href="/equipment-owner/add-equipment"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    إضافة معدة
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-expanded="false"
            >
              <span className="sr-only">فتح القائمة</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block pr-3 pl-4 py-2 border-r-4 text-base font-medium ${
                pathname === '/'
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              الرئيسية
            </Link>
            <Link
              href="/equipment"
              className={`block pr-3 pl-4 py-2 border-r-4 text-base font-medium ${
                pathname === '/equipment'
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              المعدات
            </Link>
            <Link
              href="/drivers"
              className={`block pr-3 pl-4 py-2 border-r-4 text-base font-medium ${
                pathname === '/drivers'
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              السائقين
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isLoggedIn ? (
              <div className="space-y-1">
                <Link
                  href={getProfileLink()}
                  className="block pr-3 pl-4 py-2 border-r-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  الملف الشخصي
                </Link>
                {userType === 'equipmentOwners' && (
                  <Link
                    href="/equipment-owner/add-equipment"
                    className="block pr-3 pl-4 py-2 border-r-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    إضافة معدة
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-right pr-3 pl-4 py-2 border-r-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/auth/login"
                  className="block pr-3 pl-4 py-2 border-r-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/auth/register"
                  className="block pr-3 pl-4 py-2 border-r-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
