<template>
  <v-dialog v-model="model" max-width="520">
    <v-card>
      <v-card-title class="text-h6">
        Добавить ребёнка
      </v-card-title>
      <v-card-text>
        <v-alert
          v-if="error"
          type="error"
          variant="outlined"
          class="mb-3"
        >
          {{ error }}
        </v-alert>

        <v-form ref="formRef" v-model="isValid">
          <v-row>
            <v-col cols="12">
              <div class="text-body-2 text-medium-emphasis mb-2">
                Адрес: <strong>{{ addressSummary }}</strong>
              </div>
              <div
                v-if="father && mother"
                class="text-body-2 text-medium-emphasis mb-2"
              >
                Родители:
                <strong>{{ fullName(father) }}</strong> и
                <strong>{{ fullName(mother) }}</strong>
              </div>
              <div v-else class="text-body-2 text-error mb-2">
                Внимание: по этому адресу не определены родители (муж и жена).
                Ребёнок всё равно будет привязан к адресу, но без родителей.
              </div>
            </v-col>

            <!-- ФИО -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.lastName"
                label="Фамилия"
                :rules="[required]"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.firstName"
                label="Имя"
                :rules="[required]"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.middleName"
                label="Отчество"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- Пол и дата рождения -->
            <v-col cols="12" md="4">
              <v-select
                v-model="form.sex"
                :items="sexOptions"
                label="Пол"
                :rules="[required]"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field
                v-model="form.birthDate"
                label="Дата рождения"
                type="date"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- Вероисповедание -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.religion"
                :items="religionOptions"
                label="Вероисповедание"
                :rules="[required]"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- Таинства -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.baptismYear"
                label="Год крещения"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.chrismationYear"
                label="Год миропомазания"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.firstCommunionYear"
                label="Год первого причастия"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12">
              <v-switch
                v-model="form.catechesis"
                label="Ходит на катехезы"
                inset
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="cancel">
          Отмена
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="saving"
          :disabled="saving"
          @click="save"
        >
          Добавить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { usePeopleStore } from '../stores/people';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  address: {
    type: Object,
    required: true,
  },
  father: {
    type: Object,
    default: null,
  },
  mother: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'created']);

const peopleStore = usePeopleStore();

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const formRef = ref(null);
const isValid = ref(false);
const saving = ref(false);
const error = ref('');

const sexOptions = [
  { label: 'Мужской', value: 'male' },
  { label: 'Женский', value: 'female' },
];

const religionOptions = [
  { label: 'Католик', value: 'католик' },
  { label: 'Православный', value: 'православный' },
  { label: 'Старовер', value: 'старовер' },
  { label: 'Некрещенный', value: 'некрещенный' },
  { label: 'Протестант', value: 'протестант' },
];

const form = reactive({
  lastName: '',
  firstName: '',
  middleName: '',
  sex: '',
  birthDate: '',
  religion: '',
  baptismYear: null,
  chrismationYear: null,
  firstCommunionYear: null,
  catechesis: null,
});

const required = (v) => !!v || 'Обязательное поле';

const fullName = (p) =>
  p ? [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ') : '';

const addressSummary = computed(() => {
  if (!props.address) return '';
  const a = props.address;
  const apt = a.apartment ? `, кв. ${a.apartment}` : '';
  return `${a.localityType} ${a.localityName}, ${a.street}, д. ${a.house}${apt}`;
});

// При открытии диалога — подставляем фамилию от родителей (если можно)
// При открытии диалога — подставляем фамилию: сначала отца, если есть, иначе матери
// При открытии диалога — подставляем фамилию: сначала отца, если есть, иначе матери
watch(
  () => model.value,
  (open) => {
    if (open) {
      resetForm();
      if (props.father?.lastName) {
        form.lastName = props.father.lastName;
      } else if (props.mother?.lastName) {
        form.lastName = props.mother.lastName;
      }
    }
  }
);

const resetForm = () => {
  form.lastName = '';
  form.firstName = '';
  form.middleName = '';
  form.sex = '';
  form.birthDate = '';
  form.religion = '';
  form.baptismYear = null;
  form.chrismationYear = null;
  form.firstCommunionYear = null;
  form.catechesis = null;
  error.value = '';
};

const cancel = () => {
  model.value = false;
};

const save = async () => {
  error.value = '';

  if (!formRef.value) return;
  const res = await formRef.value.validate();
  const valid = res.valid ?? res;
  if (!valid) return;

  if (!props.address?.id) {
    error.value = 'Не удалось определить адрес.';
    return;
  }

  const payload = {
    lastName: form.lastName,
    firstName: form.firstName,
    middleName: form.middleName,
    sex: form.sex,
    birthDate: form.birthDate || '',
    religion: form.religion,
    baptismYear: form.baptismYear || null,
    chrismationYear: form.chrismationYear || null,
    firstCommunionYear: form.firstCommunionYear || null,
    catechesis: form.catechesis,
    massAndConfession: '', // пока пусто
    profession: '',
    workplace: '',
    phone: '',
    addressId: props.address.id,
    fatherId: props.father?.id || null,
    motherId: props.mother?.id || null,
    childrenIds: [],
    isDeceased: false,
    deathYear: null,
    marriageIds: [],
  };

  saving.value = true;
  try {
    const childId = await peopleStore.addPerson(payload);

    // updatePerson уже умеет обновлять childrenIds у родителей,
    // но мы только что задали fatherId/motherId сразу при добавлении.
    // Если хочешь гарантированную синхронизацию, можно дополнительно вызвать:
    if (payload.fatherId || payload.motherId) {
      await peopleStore.updatePerson(childId, {
        fatherId: payload.fatherId,
        motherId: payload.motherId,
      });
    }

    emit('created', childId);
    model.value = false;
  } catch (e) {
    console.error('Ошибка при добавлении ребёнка:', e);
    error.value = 'Не удалось добавить ребёнка. Попробуйте ещё раз.';
  } finally {
    saving.value = false;
  }
};
</script>