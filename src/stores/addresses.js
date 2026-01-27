import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';

// ВАЖНО: имя коллекции должно совпадать с тем,
// что вы создали в Firestore. Если у вас "addresses",
// замените строку ниже.
const COLLECTION_NAME = 'addresses';

export const useAddressesStore = defineStore('addresses', () => {
  const addresses = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // ---------- Загрузка всей коллекции адресов ----------

  const fetchAddresses = async () => {
    loading.value = true;
    error.value = null;

    try {
      const colRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(colRef);
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });
      addresses.value = items;
    } catch (e) {
      console.error('Ошибка при загрузке адресов из Firestore:', e);
      error.value = 'Не удалось загрузить адреса';
    } finally {
      loading.value = false;
    }
  };

  // ---------- Получение адреса по id ----------

  const getAddressById = (id) =>
    computed(() => addresses.value.find((a) => a.id === id) || null);

  // ---------- Добавление нового адреса ----------

  const addAddress = async (address) => {
    // address — объект без id. Пример:
    // { localityType, localityName, street, house, apartment, phoneHome, visitYears }
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(colRef, address);
      addresses.value.push({
        ...address,
        id: docRef.id,
      });
      return docRef.id;
    } catch (e) {
      console.error('Ошибка при добавлении адреса в Firestore:', e);
      throw e;
    }
  };

  // ---------- Обновление адреса ----------

  const updateAddress = async (id, payload) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, payload);

      const index = addresses.value.findIndex((a) => a.id === id);
      if (index !== -1) {
        addresses.value[index] = {
          ...addresses.value[index],
          ...payload,
        };
      }
    } catch (e) {
      console.error('Ошибка при обновлении адреса в Firestore:', e);
      throw e;
    }
  };

  // ---------- Удаление адреса ----------

  const deleteAddress = async (id) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      addresses.value = addresses.value.filter((a) => a.id !== id);
    } catch (e) {
      console.error('Ошибка при удалении адреса в Firestore:', e);
      throw e;
    }
  };

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    getAddressById,
    addAddress,
    updateAddress,
    deleteAddress,
  };
});