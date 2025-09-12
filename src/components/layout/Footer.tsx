"use client";

import { usePathname } from 'next/navigation';
import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Paths where the footer should be hidden
  const noFooterPaths = ['/auth/complete-profile'];

  if (noFooterPaths.includes(pathname)) {
    return null;
  }
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="text-center md:text-right">
            <h3 className="text-lg font-medium text-gray-900">موقع واصل</h3>
            <p className="mt-2 text-sm text-gray-500">
              منصة للوصل بين سائقي المعدات و أصحاب المعدات
            </p>
          </div>
          
          <div className="mt-8 md:mt-0 text-center md:text-right">
            <h3 className="text-base font-medium text-gray-900">للشكاوى والاستفسارات</h3>
            <div className="flex justify-center md:justify-end space-x-6 rtl:space-x-reverse mt-4">
              <a href="https://www.facebook.com/wasl.2025" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                <span className="sr-only">Facebook</span>
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 rtl:space-x-reverse justify-center md:order-2">
                        <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-gray-600">
              سياسة الخصوصية
            </Link>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-600">
              شروط الاستخدام
            </a>
            <a href="https://www.facebook.com/wasl.2025" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-600">
              اتصل بنا
            </a>
          </div>
          <p className="mt-8 text-sm text-gray-400 text-center md:mt-0 md:order-1">
            &copy; {currentYear} موقع سائقي المعدات وأصحاب المعدات. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
