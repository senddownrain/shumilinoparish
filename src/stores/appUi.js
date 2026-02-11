// src/stores/appUi.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppUiStore = defineStore("appUi", () => {
  const title = ref("");
  const showBack = ref(false);
  const backTo = ref(null);
  const actions = ref([]);

  // счётчик изменений: каждый set его увеличивает
  const rev = ref(0);

  function set(payload) {
    rev.value++;

    title.value = payload?.title || "";
    showBack.value = !!payload?.showBack;
    backTo.value = payload?.backTo || null;
    actions.value = Array.isArray(payload?.actions) ? payload.actions : [];
  }

  function reset() {
    // запоминаем “ревизию” на момент вызова reset
    // const myRev = rev.value;

    // // сбрасываем НЕ сразу, а в microtask и только если после reset никто не делал set()
    // queueMicrotask(() => {
    //   if (rev.value !== myRev) return; // уже пришла новая страница и сделала set()

    //   title.value = "";
    //   showBack.value = false;
    //   backTo.value = null;
    //   actions.value = [];

    //   rev.value++; // фиксируем изменение
    // });
  }

  function clear() {
    title.value = "";
    showBack.value = false;
    backTo.value = null;
    actions.value = [];
  }

   return { title, showBack, backTo, actions, set, reset, clear };
});