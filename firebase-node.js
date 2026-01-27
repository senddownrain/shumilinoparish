// firebase-node.js — инициализация Firebase для Node-скриптов

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDGuHfQeZ3OPT26UO7xO59KXqy2ZS5LeKk',
  authDomain: 'shumilinoparish.firebaseapp.com',
  projectId: 'shumilinoparish',
  storageBucket: 'shumilinoparish.firebasestorage.app',
  messagingSenderId: '613272050147',
  appId: '1:613272050147:web:43769db3ab5d50b52568d6',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);