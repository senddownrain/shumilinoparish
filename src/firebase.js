import { initializeApp } from "firebase/app";
// ✅ Возвращаем правильную инициализацию Firestore с поддержкой оффлайн-кэширования
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: 'AIzaSyDGuHfQeZ3OPT26UO7xO59KXqy2ZS5LeKk',
  authDomain: 'shumilinoparish.firebaseapp.com',
  projectId: 'shumilinoparish',
  storageBucket: 'shumilinoparish.firebasestorage.app',
  messagingSenderId: '613272050147',
  appId: '1:613272050147:web:43769db3ab5d50b52568d6',
};

const app = initializeApp(firebaseConfig);

// ✅ Используем НОВЫЙ метод инициализации с настройками кэша,
// который заменяет и getFirestore(), и enableIndexedDbPersistence()
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({})
});

// Экспортируем db, как и раньше
export { db };