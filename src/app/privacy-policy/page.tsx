// src/app/privacy-policy/page.tsx

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-gray-50">
      {/* Header Section */}
      <header className="bg-gray-800 text-white py-8 shadow-md">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-extrabold">سياسة الخصوصية</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="container mx-auto px-6">
          <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg max-w-4xl mx-auto" dir="rtl">
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-8">آخر تحديث: 22 أغسطس 2025</p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">مقدمة</h2>
              <p className="mb-6 text-gray-700">
                نحن في منصة &lsquo;لينك&rsquo; (&lsquo;نحن&rsquo;، &lsquo;منصتنا&rsquo;) نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيف نجمع ونستخدم ونشارك ونحمي معلوماتك عند استخدامك لموقعنا وخدماتنا.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">المعلومات التي نجمعها</h2>
              <p className="mb-4 text-gray-700">قد نجمع أنواعًا مختلفة من المعلومات، بما في ذلك:</p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                <li>
                  <strong>البيانات الشخصية:</strong> مثل الاسم، رقم الهاتف، البريد الإلكتروني، والصورة الشخصية التي تقدمها عند التسجيل.
                </li>
                <li>
                  <strong>بيانات المعدات:</strong> المعلومات التي يقدمها ملاك المعدات حول معداتهم، مثل النوع، الوصف، السعر، والصور.
                </li>
                <li>
                  <strong>بيانات الاستخدام:</strong> معلومات حول كيفية استخدامك للمنصة، مثل الصفحات التي تزورها والميزات التي تستخدمها.
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">كيف نستخدم معلوماتك</h2>
              <p className="mb-4 text-gray-700">نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                <li>لتوفير وتشغيل وصيانة خدماتنا.</li>
                <li>لتسهيل التواصل بين ملاك المعدات والسائقين.</li>
                <li>لتحسين وتخصيص تجربتك على المنصة.</li>
                <li>لإرسال إشعارات وتحديثات تتعلق بحسابك أو خدماتنا.</li>
                <li>لأغراض تحليلية وفهم كيفية استخدام منصتنا.</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">مشاركة معلوماتك</h2>
              <p className="mb-4 text-gray-700">
                نحن لا نبيع أو نؤجر بياناتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك في الحالات التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                <li>مع المستخدمين الآخرين على المنصة لتسهيل عملية تأجير المعدات (على سبيل المثال، مشاركة رقم هاتف مالك المعدة مع سائق مهتم).</li>
                <li>إذا طُلب منا ذلك بموجب القانون أو لحماية حقوقنا.</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">أمان البيانات</h2>
              <p className="mb-6 text-gray-700">
                نتخذ تدابير أمنية معقولة لحماية معلوماتك من الوصول أو الاستخدام أو الكشف غير المصرح به. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت أو تخزين إلكتروني آمنة بنسبة 100%، ولا يمكننا ضمان الأمان المطلق.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">حقوقك</h2>
              <p className="mb-6 text-gray-700">
                لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها أو حذفها. يمكنك ممارسة هذه الحقوق عن طريق التواصل معنا.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">التغييرات على هذه السياسة</h2>
              <p className="mb-6 text-gray-700">
                قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإعلامك بأي تغييرات عن طريق نشر السياسة الجديدة على هذه الصفحة.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">اتصل بنا</h2>
              <p className="mb-8 text-gray-700">
                إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر البريد الإلكتروني: [أضف بريدك الإلكتروني هنا]
              </p>
              
              <hr />
              <div className="mt-8 bg-gray-100 p-4 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>إخلاء مسؤولية:</strong> هذا المستند هو قالب عام ولا يشكل استشارة قانونية. يوصى بشدة بمراجعة محامٍ لضمان الامتثال الكامل للقوانين واللوائح المعمول بها.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
