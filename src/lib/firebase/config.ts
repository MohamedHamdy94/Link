// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; // ← 👈 إضافة

// App 1: قاعدة البيانات والمصادقة
const firebaseConfig = {
  apiKey: "AIzaSyD7r6P3ydH7RA6m-G49CKK-4l0DciEW_vk",
  authDomain: "manlift-612fa.firebaseapp.com",
  projectId: "manlift-612fa",
  storageBucket: "manlift-612fa.firebasestorage.app",
  messagingSenderId: "967855846959",
  appId: "1:967855846959:web:a84a9364cb0d39b661b8da",
  measurementId: "G-JS35DN9NRG"
};

// App 2: التخزين فقط
const firebaseConfig2 = {
  apiKey: "AIzaSyDttPdopekjqxZd1jgikyAYHeMq-FWmp0Q",
  authDomain: "manlift-36e37.firebaseapp.com",
  databaseURL: "https://manlift-36e37.firebaseio.com", 
  projectId: "manlift-36e37",
  storageBucket: "manlift-36e37.appspot.com",
  messagingSenderId: "982378961801",
  appId: "1:982378961801:web:4f68d5325a135983025f58",
  measurementId: "G-KWXVK0MSW1"
};

// تهيئة التطبيقات
const app1 = initializeApp(firebaseConfig); // ← قاعدة البيانات والمصادقة
const app2 = initializeApp(firebaseConfig2, 'app2'); // ← التخزين فقط

// الحصول على الخدمات
const db = getFirestore(app1);
const auth = getAuth(app1); // ← 👈 تهيئة Firebase Auth
const storage = getStorage(app2);

export { db, auth, storage };
