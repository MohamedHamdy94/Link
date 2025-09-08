'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import { useState, useEffect } from 'react';

type UserType = 'drivers' | 'equipmentOwners' | 'admins';

const BottomNavBar = () => {
  const pathname = usePathname();
  const [user] = useAuthState(auth);
  const [userType, setUserType] = useState<UserType | null>(null);

  useEffect(() => {
    if (user) {
      const storedUserType = localStorage.getItem('userType');
      if (storedUserType) {
        setUserType(storedUserType as UserType);
      }
      user.getIdTokenResult().then(idTokenResult => {
        const newUserType = idTokenResult.claims.userType as UserType || null;
        setUserType(newUserType);
      });
    }
     else {
      setUserType(null);
    }
  }, [user]);

  // Paths where the nav bar should be hidden
  const noNavPaths = ['/auth/complete-profile', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
  if (noNavPaths.includes(pathname)) {
    return null;
  }

  const getProfileLink = (): string => {
    if (!user) return '/auth/login';
    switch (userType) {
      case 'drivers':
        return '/driver/profile';
      case 'equipmentOwners':
        return '/equipment-owner/profile';
      case 'admins':
        return '/admin/dashboard';
      default:
        return '/auth/complete-profile';
    }
  };

  const navItems = [
    { href: '/', label: 'الرئيسية', icon: <HomeIcon /> },
    { href: '/equipment', label: 'المعدات', icon: <Image src="/images/ونش.png" alt="المعدات" width={24} height={24} className="w-6 h-6" /> },
    { href: '/drivers', label: 'السائقين', icon: <DriversIcon /> },
    { href: getProfileLink(), label: 'ملفي', icon: <ProfileIcon /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around max-w-7xl mx-auto">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-sm font-medium transition-colors duration-200 ${
              pathname === item.href
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-blue-600'
            }`}>
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

// SVG Icon Components (placeholders)
const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
);



const DriversIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
);

const ProfileIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
);

export default BottomNavBar;
