"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import { logout } from '@/lib/firebase/auth';

type UserType = 'drivers' | 'equipmentOwners' | 'admins';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, loading] = useAuthState(auth);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Navigation items
  const navItems = [
    { href: '/', label: 'الرئيسية' },
    { href: '/equipment', label: 'المعدات' },
    { href: '/drivers', label: 'السائقين' },
  ];

  // Auth state and user type effect
  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (currentUser) => {
      if (currentUser) {
        const idTokenResult = await currentUser.getIdTokenResult();
        setUserType(idTokenResult.claims.userType as UserType || null);
      } else {
        setUserType(null);
      }
    });
    return () => unsubscribe();
  }, []);

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
      case 'admins':
        return '/admin/dashboard'; // Assuming an admin dashboard link
      default:
        return '/auth/login';
    }
  };

  // Render navigation link
  const renderNavLink = (href: string, label: string, mobile = false) => (
    <Link
      href={href}
      className={`${mobile ? 'block pr-3 pl-4 py-2 border-r-4 text-base' : 'inline-flex items-center px-1 pt-1 border-b-2 text-sm'} font-medium ${
        pathname === href
          ? `${mobile ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-blue-500 text-gray-900'}`
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
      onClick={() => setIsMenuOpen(false)}
    >
      {label}
    </Link>
  );

  // Render auth buttons
  const renderAuthButtons = (mobile = false) => {
    if (loading) {
      return null; // Show nothing or a loading spinner while auth state is loading
    }

    if (user) {
      return (
        <>
          <Link
            href={getProfileLink()}
            className={`${mobile ? 'block' : 'inline-flex'} items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100`}
            onClick={() => setIsMenuOpen(false)}
          >
            الملف الشخصي
          </Link>
          <button
            onClick={handleLogout}
            className={`${mobile ? 'block w-full text-right' : 'inline-flex'} items-center px-3 py-2 border ${mobile ? 'border-r-4 border-transparent' : 'border-gray-300'} text-sm font-medium rounded-md text-gray-700 ${mobile ? 'hover:bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
          >
            تسجيل الخروج
          </button>
        </>
      );
    }
    return (
      <>
        <Link
          href="/auth/login"
          className={`${mobile ? 'block' : 'inline-flex'} items-center px-3 py-2 border ${mobile ? 'border-r-4 border-transparent' : 'border-gray-300'} text-sm font-medium rounded-md text-gray-700 ${mobile ? 'hover:bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
          onClick={() => setIsMenuOpen(false)}
        >
          تسجيل الدخول
        </Link>
        <Link
          href="/auth/register"
          className={`${mobile ? 'block' : 'inline-flex'} items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700`}
          onClick={() => setIsMenuOpen(false)}
        >
          إنشاء حساب
        </Link>
      </>
    );
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 flex-shrink-0 me-4">
               Link
              </Link>
                  <div className="flex justify-between items-center ">

              <Link href="/equipment" className="text-xl font-bold px-4 hover:bg-gray-50 text-blue-600 ">
           المعدات
                 </Link>
              <Link href="/drivers" className="text-xl font-bold hover:bg-gray-50 text-blue-600 ">
           السائقين
           </Link>
                      </div>
            </div>
            <nav className="hidden md:mr-10 md:flex md:space-x-8 rtl:space-x-reverse">
  {navItems.map((item) => (
    <React.Fragment key={item.href}>
      {renderNavLink(item.href, item.label)}
    </React.Fragment>
  ))}
</nav>
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4 rtl:space-x-reverse">
            {renderAuthButtons()}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-expanded="false"
            >
              <span className="sr-only">فتح القائمة</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
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
  {navItems.map((item) => (
    <React.Fragment key={item.href}>
      {renderNavLink(item.href, item.label, true)}
    </React.Fragment>
  ))}
</div>
          <div className="pt-4 pb-3 border-t border-gray-200 space-y-1">
            {renderAuthButtons(true)}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
