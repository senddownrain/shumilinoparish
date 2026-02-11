// src/stores/appUi.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppUiStore = defineStore('appUi', () => {
  const title = ref('');
  const showBack = ref(false);

  // Куда вести "Назад" (у тебя: всегда список адресов)
  const backTo = ref({ name: 'AddressList' });

  // Action-кнопки справа в app-bar
  // Формат: { icon, label?, to?, disabled? }
  const actions = ref([]);

  const set = (payload = {}) => {
    if ('title' in payload) title.value = payload.title || '';
    if ('showBack' in payload) showBack.value = !!payload.showBack;
    if ('backTo' in payload && payload.backTo) backTo.value = payload.backTo;
    if ('actions' in payload) actions.value = Array.isArray(payload.actions) ? payload.actions : [];
  };

  const reset = () => {
    title.value = '';
    showBack.value = false;
    backTo.value = { name: 'AddressList' };
    actions.value = [];
  };

  return {
    title,
    showBack,
    backTo,
    actions,
    set,
    reset,
  };
});