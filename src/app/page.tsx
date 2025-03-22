import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-600">موقع سائقي المعدات</h1>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/auth/login" className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                تسجيل الدخول
              </Link>
              <Link href="/auth/register" className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-blue-600 bg-white border border-blue-600 hover:bg-blue-50">
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              منصة لربط سائقي المعدات بأصحاب المعدات
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              سجل الآن كسائق معدات أو صاحب معدات واستفد من خدماتنا
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/auth/register" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                سجل الآن
              </Link>
            </div>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 text-right">سائقي المعدات</h3>
                  <div className="mt-2 text-right">
                    <p className="text-sm text-gray-500">
                      سجل كسائق معدات وأضف مهاراتك ونوع المعدات التي تستطيع قيادتها. حدد توفرك للعمل وانتظر عروض العمل من أصحاب المعدات.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link href="/auth/register" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      سجل كسائق <span aria-hidden="true">&larr;</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 text-right">أصحاب المعدات</h3>
                  <div className="mt-2 text-right">
                    <p className="text-sm text-gray-500">
                      سجل كصاحب معدات وأضف تفاصيل المعدات التي تمتلكها. حدد ما إذا كانت متاحة للإيجار أو للبيع وابحث عن سائقين مؤهلين.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link href="/auth/register" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      سجل كصاحب معدات <span aria-hidden="true">&larr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} موقع سائقي المعدات وأصحاب المعدات. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
