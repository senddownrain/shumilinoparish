<template>
  <div>
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="goBack">
          Назад к списку
        </v-btn>
      </v-col>
      <v-col cols="12" md="6" class="text-md-right text-start">
        <h1 class="text-h5 mb-0">Новый человек</h1>
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
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePeopleStore } from '../stores/people';
import PersonForm from '../components/PersonForm.vue';

const router = useRouter();
const peopleStore = usePeopleStore();

const formData = ref({
  firstName: '',
  lastName: '',
  middleName: '',
  birthDate: '',
  profession: '',
  workplace: '',
  religion: '',
  phone: '',
  baptismYear: null,
  chrismationYear: null,
  firstCommunionYear: null,
  catechesis: null,
  massAndConfession: '',
  maritalStatus: '',
  marriageCivilYear: null,
  marriageChurchYear: null,
  isChurchMarried: null,
  addressId: null,
  spouseId: null,
  fatherId: null,
  motherId: null,
  childrenIds: [],
});

const formRef = ref(null);
const saving = ref(false);
const isValid = ref(false);

const goBack = () => {
  router.push({ name: 'PeopleList' });
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
    const id = await peopleStore.addPerson(formData.value);
    router.push({ name: 'PeopleDetail', params: { id } });
  } catch (e) {
    console.error('Ошибка при создании человека:', e);
  } finally {
    saving.value = false;
  }
};
</script>