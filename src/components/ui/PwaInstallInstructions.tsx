'use client';

import React from 'react';

const PwaInstallInstructions = () => {
  return (
    <section className="py-16 bg-gray-800 text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-10">ثبت التطبيق على جهازك</h2>
        <div className="grid md:grid-cols-2 gap-8 text-center">
          {/* Android Instructions */}
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">لمستخدمي أندرويد (Chrome)</h3>
            <div className="text-right space-y-3">
              <p>1. افتح الموقع في متصفح Google Chrome.</p>
              <p>2. اضغط على زر القائمة (الثلاث نقاط الرأسية) في الأعلى.</p>
              <p>3. اختر &apos;تثبيت التطبيق&apos; أو &apos;إضافة إلى الشاشة الرئيسية&apos;.</p>
              <p>4. أكد الإضافة، وستجد التطبيق على شاشتك الرئيسية.</p>
            </div>
          </div>

          {/* iOS Instructions */}
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">لمستخدمي آيفون (Safari)</h3>
            <div className="text-right space-y-3">
              <p>1. افتح الموقع في متصفح Safari.</p>
              <p>2. اضغط على أيقونة المشاركة (مربع به سهم للأعلى).</p>
              <p>3. مرر للأسفل واختر &apos;إضافة إلى الشاشة الرئيسية&apos;.</p>
              <p>4. اضغط &apos;إضافة&apos;، وستجد التطبيق على شاشتك الرئيسية.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PwaInstallInstructions;



