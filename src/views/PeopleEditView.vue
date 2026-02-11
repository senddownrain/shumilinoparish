<template>
  <div v-if="loaded && formData">
    <v-card>
      <v-card-text>
        <PersonForm
          :value="formData"
          @update:value="formData = $event"
          ref="formRef"
          @validity-change="onValidityChange"
        />
      </v-card-text>
    </v-card>
  </div>

  <div v-else-if="loading">
    <v-skeleton-loader type="article" />
  </div>

  <div v-else>
    <v-alert type="error" variant="outlined">Человек не найден.</v-alert>
    <v-btn class="mt-2" @click="goBack">Вернуться</v-btn>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { usePeopleStore } from "../stores/people";
import { useAppUiStore } from "../stores/appUi";
import PersonForm from "../components/PersonForm.vue";

const route = useRoute();
const router = useRouter();

const peopleStore = usePeopleStore();
const appUi = useAppUiStore();

const formData = ref(null);
const formRef = ref(null);

const saving = ref(false);
const isValid = ref(false);

const loading = ref(false);
const loaded = ref(false);

const currentPerson = computed(() => {
  const id = String(route.params.id);
  return peopleStore.getPersonById(id).value;
});

const fullName = (p) => [p?.lastName, p?.firstName, p?.middleName].filter(Boolean).join(" ").trim();

const loadPerson = async () => {
  loading.value = true;

  if (!peopleStore.people.length && !peopleStore.loading) {
    await peopleStore.fetchPeople();
  }

  const p = currentPerson.value;
  if (p) {
    formData.value = { ...p };
    loaded.value = true;
  } else {
    loaded.value = false;
  }

  loading.value = false;
};

const goBack = () => {
  router.push({ name: "PeopleDetail", params: { id: route.params.id } });
};

const onValidityChange = (val) => {
  isValid.value = val;
};

const save = async () => {
  if (!formRef.value || !(await formRef.value.validate())) return;

  saving.value = true;
  try {
    const payload = { ...(formData.value || {}) };
    delete payload.id; // страховка, чтобы не писать id в документ

    await peopleStore.updatePerson(String(route.params.id), payload);

    router.push({ name: "PeopleDetail", params: { id: route.params.id } });
  } catch (e) {
    console.error("Ошибка при обновлении человека:", e);
  } finally {
    saving.value = false;
  }
};

const setAppBar = () => {
  const id = String(route.params.id);

  appUi.set({
    title: loaded.value && currentPerson.value ? `Редактирование: ${fullName(currentPerson.value)}` : "Редактирование",
    showBack: true,
    backTo: { name: "PeopleDetail", params: { id } },
    actions: [
      {
        icon: "mdi-content-save",
        label: "Сохранить",
        onClick: save,
        disabled: !loaded.value || !isValid.value || saving.value,
        loading: saving.value,
      },
    ],
  });
};

onMounted(async () => {
  await loadPerson();
  setAppBar();
});

watch([loaded, isValid, saving, () => route.params.id], () => setAppBar());

onUnmounted(() => {
  appUi.reset();
});
</script>