// src/stores/people.js
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

const COLLECTION_NAME = 'people';

export const usePeopleStore = defineStore('people', () => {
  const people = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchPeople = async () => {
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
      people.value = items;
    } catch (e) {
      console.error('Ошибка при загрузке людей из Firestore:', e);
      error.value = 'Не удалось загрузить список людей';
    } finally {
      loading.value = false;
    }
  };

  const getPersonById = (id) =>
    computed(() => people.value.find((p) => p.id === id) || null);

  const addPerson = async (person) => {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(colRef, person);
      people.value.push({
        ...person,
        id: docRef.id,
      });
      return docRef.id;
    } catch (e) {
      console.error('Ошибка при добавлении человека в Firestore:', e);
      throw e;
    }
  };

  const updatePerson = async (id, payload) => {
    try {
      const index = people.value.findIndex((p) => p.id === id);
      const oldPerson = index !== -1 ? people.value[index] : null;

      // если человека нет в локальном кеше, просто обновляем документ
      if (!oldPerson) {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, payload);
        // при желании можно refetch сделать, но пока просто выходим
        return;
      }

      // будем обновлять связи только если изменяется fatherId/motherId
      const newFatherId =
        'fatherId' in payload ? payload.fatherId : oldPerson.fatherId;
      const newMotherId =
        'motherId' in payload ? payload.motherId : oldPerson.motherId;

      const oldFatherId = oldPerson.fatherId || null;
      const oldMotherId = oldPerson.motherId || null;

      const fatherChanged = oldFatherId !== newFatherId;
      const motherChanged = oldMotherId !== newMotherId;

      // сначала обновим сам документ ребёнка
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, payload);

      // локально обновим человека
      const updatedPerson = {
        ...oldPerson,
        ...payload,
        fatherId: newFatherId,
        motherId: newMotherId,
      };
      people.value[index] = updatedPerson;

      // вспомогательная функция: обновить childrenIds у родителя
      const updateChildrenForParent = async (parentId, childId, action) => {
        if (!parentId) return;
        const parentIndex = people.value.findIndex((p) => p.id === parentId);
        if (parentIndex === -1) return;

        const parent = people.value[parentIndex];
        const currentChildren = Array.isArray(parent.childrenIds)
          ? [...parent.childrenIds]
          : [];

        let newChildren;
        if (action === 'add') {
          if (!currentChildren.includes(childId)) {
            newChildren = [...currentChildren, childId];
          } else {
            return;
          }
        } else if (action === 'remove') {
          if (!currentChildren.includes(childId)) return;
          newChildren = currentChildren.filter((cid) => cid !== childId);
        } else {
          return;
        }

        const parentRef = doc(db, COLLECTION_NAME, parentId);
        await updateDoc(parentRef, { childrenIds: newChildren });
        people.value[parentIndex] = {
          ...parent,
          childrenIds: newChildren,
        };
      };

      // если поменялся отец
      if (fatherChanged) {
        // убрать из старого отца
        if (oldFatherId && oldFatherId !== newFatherId) {
          await updateChildrenForParent(oldFatherId, id, 'remove');
        }
        // добавить к новому отцу
        if (newFatherId) {
          await updateChildrenForParent(newFatherId, id, 'add');
        }
      }

      // если поменялась мать
      if (motherChanged) {
        // убрать из старой матери
        if (oldMotherId && oldMotherId !== newMotherId) {
          await updateChildrenForParent(oldMotherId, id, 'remove');
        }
        // добавить к новой матери
        if (newMotherId) {
          await updateChildrenForParent(newMotherId, id, 'add');
        }
      }
    } catch (e) {
      console.error('Ошибка при обновлении человека в Firestore:', e);
      throw e;
    }
  };

  const deletePerson = async (id) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      people.value = people.value.filter((p) => p.id !== id);
      // В идеале, здесь тоже надо бы очистить ссылки в childrenIds/fatherId/motherId,
      // но это можно сделать отдельным шагом.
    } catch (e) {
      console.error('Ошибка при удалении человека из Firestore:', e);
      throw e;
    }
  };

  return {
    people,
    loading,
    error,
    fetchPeople,
    getPersonById,
    addPerson,
    updatePerson,
    deletePerson,
  };
});