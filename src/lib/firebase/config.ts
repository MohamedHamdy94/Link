// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7r6P3ydH7RA6m-G49CKK-4l0DciEW_vk",
  authDomain: "manlift-612fa.firebaseapp.com",
  projectId: "manlift-612fa",
  storageBucket: "manlift-612fa.firebasestorage.app",
  messagingSenderId: "967855846959",
  appId: "1:967855846959:web:a84a9364cb0d39b661b8da",
  measurementId: "G-JS35DN9NRG"
};

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

// تهيئة التطبيق الأساسي
const app1 = initializeApp(firebaseConfig);

// تهيئة التطبيق الثاني باسم مختلف
const app2 = initializeApp(firebaseConfig2, 'app2');

// الحصول على الخدمات لكل تطبيق
const db = getFirestore(app1);

const storage = getStorage(app2);

export { db, storage };
