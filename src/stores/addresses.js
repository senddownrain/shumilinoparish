// src/stores/addresses.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'addresses';

export const useAddressesStore = defineStore('addresses', () => {
  const addresses = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchAddresses = async () => {
    loading.value = true;
    error.value = null;
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(colRef);
      const items = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() || {};
        items.push({
          id: docSnap.id,
          ...data,
          visitYears: Array.isArray(data.visitYears) ? data.visitYears : [],
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

  const getAddressById = (id) =>
    computed(() => addresses.value.find((a) => a.id === id) || null);

  const addAddress = async (address) => {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const payload = {
        ...address,
        visitYears: Array.isArray(address.visitYears) ? address.visitYears : [],
      };
      const docRef = await addDoc(colRef, payload);
      addresses.value.push({
        ...payload,
        id: docRef.id,
      });
      return docRef.id;
    } catch (e) {
      console.error('Ошибка при добавлении адреса в Firestore:', e);
      throw e;
    }
  };

  const updateAddress = async (id, payload) => {
    try {
      // НЕ пишем id в документ
      const { id: _id, ...clean } = payload || {};
      const docRef = doc(db, COLLECTION_NAME, id);

      await updateDoc(docRef, clean);

      const index = addresses.value.findIndex((a) => a.id === id);
      if (index !== -1) {
        addresses.value[index] = {
          ...addresses.value[index],
          ...clean,
        };
      }
    } catch (e) {
      console.error('Ошибка при обновлении адреса в Firestore:', e);
      throw e;
    }
  };

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

  // ===== Визиты (атомарно) =====
  const markVisitedYear = async (addressId, year) => {
    if (!addressId || !year) return;

    const y = Number(year);
    if (!Number.isFinite(y)) return;

    const docRef = doc(db, COLLECTION_NAME, addressId);
    await updateDoc(docRef, { visitYears: arrayUnion(y) });

    // локально
    const idx = addresses.value.findIndex((a) => a.id === addressId);
    if (idx !== -1) {
      const current = Array.isArray(addresses.value[idx].visitYears)
        ? addresses.value[idx].visitYears
        : [];
      const set = new Set(current);
      set.add(y);
      addresses.value[idx] = {
        ...addresses.value[idx],
        visitYears: Array.from(set).sort((a, b) => a - b),
      };
    }
  };

  const unmarkVisitedYear = async (addressId, year) => {
    if (!addressId || !year) return;

    const y = Number(year);
    if (!Number.isFinite(y)) return;

    const docRef = doc(db, COLLECTION_NAME, addressId);
    await updateDoc(docRef, { visitYears: arrayRemove(y) });

    // локально
    const idx = addresses.value.findIndex((a) => a.id === addressId);
    if (idx !== -1) {
      const current = Array.isArray(addresses.value[idx].visitYears)
        ? addresses.value[idx].visitYears
        : [];
      const set = new Set(current);
      set.delete(y);
      addresses.value[idx] = {
        ...addresses.value[idx],
        visitYears: Array.from(set).sort((a, b) => a - b),
      };
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
    markVisitedYear,
    unmarkVisitedYear,
  };
});