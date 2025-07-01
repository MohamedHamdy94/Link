هل ترغب أن أساعدك أيضًا على تعديل getUserType() ليأخذ البيانات من Firestore بناءً على user.uid؟

هل ترغب أن أعدل لك أيضًا ملف إنشاء المستخدم (مثل createDriver) ليقوم بتسجيل حساب في Firebase Auth تلقائيًا؟

هل ترغب أن أساعدك بإنشاء حساب المستخدم تلقائيًا في Firebase Auth عند إنشاء السائق؟


Now that firebase-admin is installed and src/lib/firebase/auth.ts is updated to use it for server-side session management, the updateSecretNumber
  server action should work correctly.

  To summarize the changes and next steps:


   1. `src/app/admin/actions.ts`: Contains the server action updateSecretNumber for securely updating the secret number in Firestore. It now uses the
      updated getSession for authorization.
   2. `src/app/admin/secret-number-management/page.tsx`: Provides the UI for admins to manage secret numbers.
   3. `src/lib/firebase/auth.ts`: Modified to include firebase-admin for server-side session verification using ID tokens from cookies. It assumes a
      cookie named __session holds the Firebase ID token.
   4. `firebase-admin`: Installed as a dependency.


  Important Considerations for Deployment:


   * `FIREBASE_ADMIN_SDK_CONFIG` Environment Variable: You must set the FIREBASE_ADMIN_SDK_CONFIG environment variable in your deployment environment.
     This variable should contain the JSON string of your Firebase service account key. Never commit this key directly to your repository.
   * Session Cookie (`__session`): Ensure that your client-side authentication flow correctly sets an __session cookie containing the Firebase ID token
     after a user logs in. This is crucial for the server-side getSession function to work.
   * User ID in Firestore: The getSession function now attempts to find the user's document in drivers, equipmentOwners, or admins collections using the
     Firebase uid as the document ID. Ensure your user documents in Firestore are structured this way.
   * "Secret Number" Field: The code assumes a secretNumber field in your drivers and equipmentOwners Firestore documents. You'll need to ensure this
     field exists or adjust the code accordingly.

  You can now access the new page at /admin/secret-number-management (assuming your Next.js app is running).












