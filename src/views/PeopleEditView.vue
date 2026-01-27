<template>
  <div v-if="loaded && formData">
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="goBack">
          Назад
        </v-btn>
      </v-col>
      <v-col cols="12" md="6" class="text-md-right text-start">
        <h1 class="text-h5 mb-0">Редактирование человека</h1>
      </v-col>
    </v-row>

    <v-card>
      <v-card-text>
        <person-form
          :value="formData"
          @update:value="formData = $event"
          ref="formRef"
          @validity-change="onValidityChange"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          :loading="saving"
          :disabled="!isValid || saving"
          @click="save"
        >
          Сохранить изменения
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>

  <div v-else-if="loading">
    <v-skeleton-loader type="article" />
  </div>

  <div v-else>
    <v-alert type="error" variant="outlined">
      Человек не найден.
    </v-alert>
    <v-btn class="mt-2" @click="goBack">Вернуться</v-btn>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePeopleStore } from '../stores/people';
import PersonForm from '../components/PersonForm.vue';

const route = useRoute();
const router = useRouter();
const peopleStore = usePeopleStore();

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

onMounted(() => {
  loadPerson();
});

const goBack = () => {
  router.push({
    name: 'PeopleDetail',
    params: { id: route.params.id },
  });
};

const onValidityChange = (val) => {
  isValid.value = val;
};

const save = async () => {
  if (!formRef.value || !(await formRef.value.validate())) {
    return;
  }
  saving.value = true;
  try {
    await peopleStore.updatePerson(String(route.params.id), formData.value);
    router.push({
      name: 'PeopleDetail',
      params: { id: route.params.id },
    });
  } catch (e) {
    console.error('Ошибка при обновлении человека:', e);
  } finally {
    saving.value = false;
  }
};
</script>