
import Link from 'next/link';

export default function HomePage2() {
  return (
    // Use a flex column layout for the entire page, ensuring it takes up at least the full screen height.
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Main content area */}
      <main className="flex-grow">
        {/* Center the content and set a maximum width. Add padding for different screen sizes. */}
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Responsive heading with different text sizes for different screen sizes. */}
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
              منصة لربط سائقي المعدات بأصحاب المعدات
            </h2>
            {/* Responsive paragraph with different text sizes for different screen sizes. */}
            <p className="mt-4 text-xl text-gray-500 sm:text-2xl">
              سجل الآن كسائق معدات أو صاحب معدات
            </p>
            {/* Use a flex container to center the buttons and allow them to wrap on smaller screens. */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/register"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                سجل الآن
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3 border border-blue-700 text-base font-medium rounded-md md:py-4 md:text-lg md:px-10"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>

          {/* Use a responsive grid with one column on small screens and two columns on medium screens and up. */}
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Card for equipment drivers. */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 text-right">
                  سائقي المعدات
                </h3>
                <div className="mt-2 text-right">
                  <p className="text-sm text-gray-500">
                    سجل كسائق معدات وأضف مهاراتك ونوع المعدات التي تستطيع
                    قيادتها. حدد توفرك للعمل وانتظر عروض العمل من أصحاب
                    المعدات.
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/auth/register"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    سجل كسائق <span aria-hidden="true">&larr;</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Card for equipment owners. */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 text-right">
                  أصحاب المعدات
                </h3>
                <div className="mt-2 text-right">
                  <p className="text-sm text-gray-500">
                    سجل كصاحب معدات وأضف تفاصيل المعدات التي تمتلكها. حدد ما
                    إذا كانت متاحة للإيجار أو للبيع وابحث عن سائقين مؤهلين.
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/auth/register"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    سجل كصاحب معدات <span aria-hidden="true">&larr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} موقع سائقي المعدات وأصحاب المعدات.
            جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
