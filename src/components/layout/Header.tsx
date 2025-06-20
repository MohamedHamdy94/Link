"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, logout, getUserType } from '@/lib/firebase/auth';

type UserType = 'drivers' | 'equipmentOwners' | 'admins';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Navigation items
  const navItems = [
    { href: '/', label: 'الرئيسية' },
    { href: '/equipment', label: 'المعدات' },
    { href: '/drivers', label: 'السائقين' },
  ];

  // Auth check effect
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

  const getProfileLink = (): string => {
    switch (userType) {
      case 'drivers':
        return '/driver/profile';
      case 'equipmentOwners':
        return '/equipment-owner/profile';
      default:
        return '/auth/login';
    }
  };

  // Render navigation link
  const renderNavLink = (href: string, label: string, mobile = false) => (
    <Link
      href={href}
      className={`${
        mobile 
          ? 'block w-full text-right py-3 px-4 text-base font-medium hover:bg-gray-50'
          : 'px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-md mx-1'
      } ${
        pathname === href
          ? 'text-blue-600 bg-blue-50 font-semibold'
          : 'text-gray-700 hover:text-blue-600'
      } transition-colors duration-200`}
      onClick={() => setIsMenuOpen(false)}
    >
      {label}
    </Link>
  );

  // Render auth buttons
  const renderAuthButtons = (mobile = false) => {
    if (isLoggedIn) {
      return (
        <div className={`flex ${mobile ? 'flex-col space-y-2' : 'space-x-2 rtl:space-x-reverse'}`}>
          <Link
            href={getProfileLink()}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            الملف الشخصي
          </Link>
          {userType === 'equipmentOwners' && (
            <Link
              href="/equipment-owner/add-equipment"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              إضافة معدة
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors duration-200"
          >
            تسجيل الخروج
          </button>
        </div>
      );
    }
    return (
      <div className={`flex ${mobile ? 'flex-col space-y-2' : 'space-x-2 rtl:space-x-reverse'}`}>
        <Link
          href="/auth/login"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors duration-200"
          onClick={() => setIsMenuOpen(false)}
        >
          تسجيل الدخول
        </Link>
        <Link
          href="/auth/register"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
          onClick={() => setIsMenuOpen(false)}
        >
          إنشاء حساب
        </Link>
      </div>
    );
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-blue-600 flex-shrink-0">
           Link
          </Link>
                  <div className="flex justify-between items-center ">

          <Link href="/equipment" className="text-xl font-bold pe-4 hover:bg-gray-50 text-blue-600 ">
           المعدات
          </Link>
          <Link href="/drivers" className="text-xl font-bold hover:bg-gray-50 text-blue-600 ">
           السائقين
          </Link>
                      </div>

          {/* Desktop Navigation - Visible on all screens */}
          <nav className="hidden md:flex flex-1 justify-center">
            <div className="flex space-x-1 rtl:space-x-reverse">
              {navItems.map((item) => (
                <div key={item.href}>
                  {renderNavLink(item.href, item.label)}
                </div>
              ))}
            </div>
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center">
            {renderAuthButtons()}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
              aria-label="قائمة التنقل"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 fixed top-16 left-0 right-0 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <div key={item.href} className="w-full">
                {renderNavLink(item.href, item.label, true)}
              </div>
            ))}
          </div>
          <div className="px-2 py-3 border-t border-gray-200">
            {renderAuthButtons(true)}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;