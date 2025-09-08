"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import { logout } from '@/lib/firebase/auth';

type UserType = 'drivers' | 'equipmentOwners' | 'admins';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, loading] = useAuthState(auth);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // All hooks are now at the top level.

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Auth state, user type, and redirection logic effect
  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (currentUser) => {
      setClaimsLoading(true);
      if (currentUser) {
        const idTokenResult = await currentUser.getIdTokenResult(true);
        const newUserType = idTokenResult.claims.userType as UserType | null;
        setUserType(newUserType);

        if (newUserType) {
          localStorage.setItem('userType', newUserType);
        } else {
          localStorage.removeItem('userType');
          const unauthenticatedPaths = ['/auth/complete-profile', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
          if (!unauthenticatedPaths.includes(pathname)) {
            const phone = currentUser.phoneNumber;
            if (phone) {
              const localPhone = phone.startsWith('+20') ? '0' + phone.substring(3) : phone;
              router.push(`/auth/complete-profile?phoneNumber=${encodeURIComponent(localPhone)}`);
            } else {
              router.push('/auth/register');
            }
          }
        }
      } else {
        setUserType(null);
        localStorage.removeItem('userType');
      }
      setClaimsLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]); // Added missing dependencies

  const handleInstall = () => {
    if (installPrompt) {
      installPrompt.prompt();
    }
  };

  // Navigation items
  const navItems = [
    { href: '/', label: 'الرئيسية' },
    { href: '/equipment', label: 'المعدات' },
    { href: '/drivers', label: 'السائقين' },
  ];

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
        return '/admin/dashboard';
      default:
        return '/auth/login';
    }
  };

  // Conditional rendering check is now just before the return statement.
  const noHeaderPaths = ['/auth/complete-profile'];
  if (noHeaderPaths.includes(pathname)) {
    return null;
  }

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
    if (loading || claimsLoading) {
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
              <Link href="/" className="flex-shrink-0 flex items-center">
                <Image src="/images/link.jpg" alt="Link Logo" width={40} height={40} className="h-10 w-auto" />
              </Link>
                  <div className="hidden md:flex justify-between items-center ">

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
            {installPrompt && (
              <button
                onClick={handleInstall}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                تثبيت التطبيق
              </button>
            )}
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
            {installPrompt && (
              <button
                onClick={handleInstall}
                className="block w-full text-right px-3 py-2 border-r-4 border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                تثبيت التطبيق
              </button>
            )}
            {renderAuthButtons(true)}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
