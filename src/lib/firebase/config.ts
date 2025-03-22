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


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
