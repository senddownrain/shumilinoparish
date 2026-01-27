// src/stores/marriages.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'marriages';

export const useMarriagesStore = defineStore('marriages', () => {
  const marriages = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchMarriages = async () => {
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
      marriages.value = items;
    } catch (e) {
      console.error('Ошибка при загрузке браков из Firestore:', e);
      error.value = 'Не удалось загрузить список браков';
    } finally {
      loading.value = false;
    }
  };

  const createMarriage = async ({ husbandId, wifeId, civilMarriageYear, churchMarriageYear, isChurchMarried }) => {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const data = {
        husbandId,
        wifeId,
        status: 'active',
        civilMarriageYear: civilMarriageYear || null,
        churchMarriageYear: churchMarriageYear || null,
        isChurchMarried: typeof isChurchMarried === 'boolean' ? isChurchMarried : null,
        divorceYear: null,
        notes: null,
      };
      const docRef = await addDoc(colRef, data);
      marriages.value.push({
        id: docRef.id,
        ...data,
      });
      return docRef.id;
    } catch (e) {
      console.error('Ошибка при создании брака:', e);
      throw e;
    }
  };

  const updateMarriageStatus = async (id, payload) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, payload);
      const index = marriages.value.findIndex((m) => m.id === id);
      if (index !== -1) {
        marriages.value[index] = {
          ...marriages.value[index],
          ...payload,
        };
      }
    } catch (e) {
      console.error('Ошибка при обновлении брака:', e);
      throw e;
    }
  };

  return {
    marriages,
    loading,
    error,
    fetchMarriages,
    createMarriage,
    updateMarriageStatus,
  };
});