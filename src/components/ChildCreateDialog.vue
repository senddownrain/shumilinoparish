<template>
  <v-dialog
    v-model="model"
    :fullscreen="smAndDown"
    :max-width="smAndDown ? undefined : 560"
    scrollable
  >
    <v-card>
      <!-- Header -->
      <v-toolbar color="primary" density="comfortable">
        <v-btn icon="mdi-close" variant="text" @click="cancel" />
        <v-toolbar-title>Добавить ребёнка</v-toolbar-title>
        <v-spacer />
        <v-btn
          variant="text"
          :loading="saving"
          :disabled="saving"
          @click="save"
        >
          Сохранить
        </v-btn>
      </v-toolbar>

      <v-card-text class="pt-4">
        <v-alert v-if="error" type="error" variant="outlined" class="mb-3">
          {{ error }}
        </v-alert>

        <!-- Контекст -->
        <v-sheet class="pa-3 mb-4" rounded="lg" border>
          <div class="text-body-2 text-medium-emphasis">
            Адрес:
            <strong>{{ addressSummary }}</strong>
          </div>

          <div class="text-body-2 text-medium-emphasis mt-1">
            Родители (по адресу):
            <template v-if="props.father || props.mother">
              <strong v-if="props.father">{{ fullName(props.father) }}</strong>
              <span v-if="props.father && props.mother"> и </span>
              <strong v-if="props.mother">{{ fullName(props.mother) }}</strong>
            </template>
            <template v-else>
              <span class="text-error">не определены</span>
            </template>
          </div>
        </v-sheet>

        <v-form ref="formRef" v-model="isValid">
          <!-- 1) Основное -->
          <div class="text-subtitle-1 mb-2">Основное</div>
          <v-row>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.lastName"
                label="Фамилия"
                :rules="[required]"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.firstName"
                label="Имя"
                :rules="[required]"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.middleName"
                label="Отчество"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" sm="4">
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

            <v-col cols="12" sm="8">
              <v-text-field
                v-model="form.birthDate"
                label="Дата рождения"
                
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4">
        <v-text-field
          v-model="form.phone"
          label="Телефон"
          prepend-inner-icon="mdi-phone"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

            <v-col cols="12" sm="6">
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
          </v-row>

          <v-divider class="my-4" />

          <!-- 2) Родители (можно выбрать вручную) -->
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="text-subtitle-1">Родители</div>
            <v-switch
              v-model="manualParents"
              density="compact"
              inset
              label="Выбрать вручную"
            />
          </div>

          <v-alert
            v-if="!manualParents"
            type="info"
            variant="tonal"
            class="mb-3"
          >
            Родители будут проставлены автоматически из адреса (если они переданы в диалог).
            Включите “Выбрать вручную”, чтобы указать других.
          </v-alert>

          <v-row v-if="manualParents">
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="fatherModel"
                :items="fatherOptions"
                label="Отец"
                item-title="label"
                item-value="value"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                density="comfortable"
                clearable
                hide-selected
                return-object
                hint="Начните вводить фамилию или имя"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-combobox
                v-model="motherModel"
                :items="motherOptions"
                label="Мать"
                item-title="label"
                item-value="value"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                density="comfortable"
                clearable
                hide-selected
                return-object
                hint="Начните вводить фамилию или имя"
                persistent-hint
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <!-- 3) Таинства -->
<div class="text-subtitle-1 mb-2">Таинства</div>

<v-row>
  <!-- Крещение -->
  <v-col cols="12" sm="4">
    <div class="d-flex align-center justify-space-between">
      <v-switch v-model="baptismBool" label="Крещён(а)" inset />
      <v-btn size="x-small" variant="text" @click="form.baptism = null">
        очистить
      </v-btn>
    </div>

    <div class="text-caption text-medium-emphasis mb-2">
      <span v-if="form.baptism === null">не указано</span>
      <span v-else-if="form.baptism === true">да</span>
      <span v-else>нет</span>
    </div>

    <v-text-field
      v-if="form.baptism === true"
      v-model.number="form.baptismYear"
      label="Год (если известен)"
      type="number"
      variant="outlined"
      density="comfortable"
      clearable
    />
  </v-col>

  <!-- Миропомазание -->
  <v-col cols="12" sm="4">
    <div class="d-flex align-center justify-space-between">
      <v-switch v-model="chrismationBool" label="Миропомаз." inset />
      <v-btn size="x-small" variant="text" @click="form.chrismation = null">
        очистить
      </v-btn>
    </div>

    <div class="text-caption text-medium-emphasis mb-2">
      <span v-if="form.chrismation === null">не указано</span>
      <span v-else-if="form.chrismation === true">да</span>
      <span v-else>нет</span>
    </div>

    <v-text-field
      v-if="form.chrismation === true"
      v-model.number="form.chrismationYear"
      label="Год (если известен)"
      type="number"
      variant="outlined"
      density="comfortable"
      clearable
    />
  </v-col>

  <!-- Причастие -->
  <v-col cols="12" sm="4">
    <div class="d-flex align-center justify-space-between">
      <v-switch v-model="firstCommunionBool" label="Причастие" inset />
      <v-btn size="x-small" variant="text" @click="form.firstCommunion = null">
        очистить
      </v-btn>
    </div>

    <div class="text-caption text-medium-emphasis mb-2">
      <span v-if="form.firstCommunion === null">не указано</span>
      <span v-else-if="form.firstCommunion === true">да</span>
      <span v-else>нет</span>
    </div>

    <v-text-field
      v-if="form.firstCommunion === true"
      v-model.number="form.firstCommunionYear"
      label="Год (если известен)"
      type="number"
      variant="outlined"
      density="comfortable"
      clearable
    />
  </v-col>

  <v-col cols="12">
    <v-switch v-model="form.catechesis" label="Ходит на катехезы" inset />
  </v-col>
</v-row>
        </v-form>
      </v-card-text>

      <!-- Footer (на десктопе удобно оставить явные кнопки) -->
      <v-card-actions v-if="!smAndDown">
        <v-spacer />
        <v-btn variant="text" @click="cancel">Отмена</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="saving"
          :disabled="saving"
          @click="save"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { usePeopleStore } from '../stores/people';

const { smAndDown } = useDisplay();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  address: { type: Object, required: true },
  father: { type: Object, default: null },
  mother: { type: Object, default: null },
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

/** режим выбора родителей */
const manualParents = ref(false);
const fatherModel = ref(null);
const motherModel = ref(null);

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

const required = (v) => !!v || 'Обязательное поле';
const form = reactive({
  lastName: "",
  firstName: "",
  middleName: "",
  sex: "",
  birthDate: "",
  religion: "",
  phone: "",
  baptism: null,              // true/false/null
  baptismYear: null,

  chrismation: null,          // true/false/null
  chrismationYear: null,

  firstCommunion: null,       // true/false/null
  firstCommunionYear: null,

  catechesis: null,
});

const baptismBool = computed({
  get: () => form.baptism === true,
  set: (v) => (form.baptism = v ? true : false),
});
const chrismationBool = computed({
  get: () => form.chrismation === true,
  set: (v) => (form.chrismation = v ? true : false),
});
const firstCommunionBool = computed({
  get: () => form.firstCommunion === true,
  set: (v) => (form.firstCommunion = v ? true : false),
});

// если флаг не true — год очищаем
watch(
  () => form.baptism,
  (v) => {
    if (v !== true) form.baptismYear = null;
  }
);
watch(
  () => form.chrismation,
  (v) => {
    if (v !== true) form.chrismationYear = null;
  }
);
watch(
  () => form.firstCommunion,
  (v) => {
    if (v !== true) form.firstCommunionYear = null;
  }
);

// если ввели год — автоматически ставим "да"
watch(
  () => form.baptismYear,
  (y) => {
    if (y != null && form.baptism !== true) form.baptism = true;
  }
);
watch(
  () => form.chrismationYear,
  (y) => {
    if (y != null && form.chrismation !== true) form.chrismation = true;
  }
);
watch(
  () => form.firstCommunionYear,
  (y) => {
    if (y != null && form.firstCommunion !== true) form.firstCommunion = true;
  }
);

const fullName = (p) =>
  p ? [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ') : '';

const addressSummary = computed(() => {
  if (!props.address) return '';
  const a = props.address;
  const apt = a.apartment ? `, кв. ${a.apartment}` : '';
  return `${a.localityType} ${a.localityName}, ${a.street}, д. ${a.house}${apt}`;
});

const fullNameWithYear = (p) => {
  const base = [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ');
  const year =
    p.birthDate && p.birthDate.length >= 4 ? p.birthDate.slice(0, 4) : null;
  return year ? `${base} (${year})` : base;
};

const fatherOptions = computed(() => {
  return peopleStore.people
    .filter((p) => p && p.sex === 'male' && !p.isDeceased)
    .map((p) => ({ value: p.id, label: fullNameWithYear(p) }));
});

const motherOptions = computed(() => {
  return peopleStore.people
    .filter((p) => p && p.sex === 'female' && !p.isDeceased)
    .map((p) => ({ value: p.id, label: fullNameWithYear(p) }));
});

/** При открытии: сброс + фамилия от родителей */
watch(
  () => model.value,
  async (open) => {
    if (!open) return;

    // подгрузим людей, если ещё нет (для ручного выбора родителей)
    if (!peopleStore.people.length && !peopleStore.loading) {
      await peopleStore.fetchPeople();
    }

    resetForm();

    // фамилия по умолчанию: отец, иначе мать
    if (props.father?.lastName) form.lastName = props.father.lastName;
    else if (props.mother?.lastName) form.lastName = props.mother.lastName;

    // manualParents по умолчанию выключен
    manualParents.value = false;
    fatherModel.value = props.father
      ? { value: props.father.id, label: fullNameWithYear(props.father) }
      : null;
    motherModel.value = props.mother
      ? { value: props.mother.id, label: fullNameWithYear(props.mother) }
      : null;

    error.value = '';
  }
);

const resetForm = () => {
  form.lastName = '';
  form.firstName = '';
  form.middleName = '';
  form.sex = '';
  form.birthDate = '';
  form.religion = '';
 form.phone = '';
  form.catechesis = null;

  form.baptism = null;
form.baptismYear = null;

form.chrismation = null;
form.chrismationYear = null;

form.firstCommunion = null;
form.firstCommunionYear = null;
};

const cancel = () => {
  model.value = false;
};

const resolveParents = () => {
  // Если manualParents выключен — берём то, что пришло из props
  if (!manualParents.value) {
    return {
      fatherId: props.father?.id || null,
      motherId: props.mother?.id || null,
    };
  }

  // Если включен — берём из combobox (можно оставить пустым)
  const fatherId =
    fatherModel.value && typeof fatherModel.value === 'object'
      ? fatherModel.value.value || null
      : null;
  const motherId =
    motherModel.value && typeof motherModel.value === 'object'
      ? motherModel.value.value || null
      : null;

  return { fatherId, motherId };
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

  const { fatherId, motherId } = resolveParents();

  const payload = {
    lastName: form.lastName,
    firstName: form.firstName,
    middleName: form.middleName,
    sex: form.sex,
    birthDate: form.birthDate || '',
    religion: form.religion,
phone: form.phone,
   baptism: form.baptism,
baptismYear: form.baptismYear ?? null,

chrismation: form.chrismation,
chrismationYear: form.chrismationYear ?? null,

firstCommunion: form.firstCommunion,
firstCommunionYear: form.firstCommunionYear ?? null,
    catechesis: form.catechesis,

    massAndConfession: '',
    profession: '',
    workplace: '',
    phone: '',

    addressId: props.address.id,
    fatherId,
    motherId,
    childrenIds: [],
    isDeceased: false,
    deathYear: null,
    marriageIds: [],
  };

  saving.value = true;
  try {
    const childId = await peopleStore.addPerson(payload);

    // ВАЖНО: чтобы childrenIds родителей обновились (логика в updatePerson),
    // вызываем updatePerson только если есть родители.
    if (fatherId || motherId) {
      await peopleStore.updatePerson(childId, { fatherId, motherId });
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