'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import PwaInstallInstructions from '@/components/ui/PwaInstallInstructions';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [user] = useAuthState(auth);

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-white text-gray-800">
        <div className="container mx-auto px-6 py-12 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/manlift-36e37.appspot.com/o/project%2FhomeBageWellcom.png?alt=media&token=60dea685-f06f-43e8-b0bf-7a066cb8739f"
              alt="Welcome Image"
              width={250} 
              height={150}
              
              priority
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            مرحباً بك في منصة واصل
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            المكان الأمثل لإيجاد وتأجير المعدات الثقيلة، والعثور على سائقين متاحين بسهولة وأمان.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {!user ? (
              <>
                <Link href="/auth/register" passHref>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
                    إنشاء حساب
                  </button>
                </Link>
                <Link href="/auth/login" passHref>
                  <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
                    تسجيل الدخول
                  </button>
                </Link>
              </>
            ) : (
              <div className="flex justify-center gap-4 flex-wrap">
                <Link href="/equipment" passHref>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
                    اذهب الى المعدات
                  </button>
                </Link>
                <Link href="/drivers" passHref>
                  <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
                    اذهب الى السائقين
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">عن منصة لينك</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            منصة واصل هي حلقة الوصل بين ملاك المعدات الثقيلة والسائقين والمقاولين في السوق. هدفنا هو تسهيل عملية العثور على المعدات المناسبة للمشاريع وتوفير فرص عمل للسائقين المهرة.
          </p>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
            كيف تعمل المنصة؟
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">1. سجل حسابك</h3>
              <p className="text-gray-600">
                سجل حسابك الجديد بسهولة سواء كنت مالك معدة أو سائق.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">2. أضف أو ابحث</h3>
              <p className="text-gray-600">
                يمكن لملاك المعدات إضافة معداتهم وعرضها للإيجار أو البيع. يمكن للسائقين والشركات تصفح المعدات المتاحة.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">3. تواصل مباشرة</h3>
              <p className="text-gray-600">
                توفر المنصة معلومات الاتصال المباشرة لتسهيل التواصل الفوري بين الطرفين بدون وسطاء.
              </p>
            </div>
          </div>
        </div>
      </section>
      <PwaInstallInstructions />
    </main>
  );
}
