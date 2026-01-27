<template>
  <v-form ref="formRef" v-model="isValid">
    <v-row>
      <!-- ФИО -->
      <v-col cols="12" md="4">
        <v-text-field
          v-model="localValue.lastName"
          label="Фамилия"
          :rules="[required]"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="localValue.firstName"
          label="Имя"
          :rules="[required]"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="localValue.middleName"
          label="Отчество"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <!-- Пол -->
      <v-col cols="12" md="4">
        <v-select
          v-model="localValue.sex"
          :items="sexOptions"
          label="Пол"
          :rules="[required]"
          item-title="label"
          item-value="value"
          prepend-inner-icon="mdi-gender-male-female"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <!-- Дата рождения -->
      <v-col cols="12" md="4">
        <v-text-field
          v-model="localValue.birthDate"
          label="Дата рождения"
          type="date"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <!-- Жив/умер -->
      <v-col cols="12" md="4" class="d-flex align-center">
        <v-switch
          v-model="localValue.isDeceased"
          label="Умер(ла)"
          inset
        />
        <v-text-field
          v-if="localValue.isDeceased"
          class="ml-4"
          v-model.number="localValue.deathYear"
          label="Год смерти"
          type="number"
          variant="outlined"
          density="comfortable"
          style="max-width: 140px;"
        />
      </v-col>

      <!-- Профессия / работа -->
      <v-col cols="12" md="4">
        <v-text-field
          v-model="localValue.profession"
          label="Профессия"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="localValue.workplace"
          label="Место работы"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <!-- Вероисповедание / телефон -->
      <v-col cols="12" md="4">
        <v-select
          v-model="localValue.religion"
          :items="religionOptions"
          label="Вероисповедание"
          :rules="[required]"
          item-title="label"
          item-value="value"
          prepend-inner-icon="mdi-church"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field
          v-model="localValue.phone"
          label="Телефон"
          prepend-inner-icon="mdi-phone"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <!-- Адрес проживания (COMBOBOX с поиском) -->
      <v-col cols="12" md="4">
        <v-combobox
          v-model="addressModel"
          :items="addressOptions"
          label="Адрес проживания"
          item-title="label"
          item-value="value"
          prepend-inner-icon="mdi-home-map-marker"
          variant="outlined"
          density="comfortable"
          clearable
          hide-selected
          return-object
          hint="Начните вводить название населённого пункта, улицу или дом"
          persistent-hint
        />
      </v-col>

      <!-- Таинства -->
      <v-col cols="12" md="4">
        <v-text-field
          v-model.number="localValue.baptismYear"
          label="Год крещения"
          type="number"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model.number="localValue.chrismationYear"
          label="Год миропомазания"
          type="number"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model.number="localValue.firstCommunionYear"
          label="Год первого причастия"
          type="number"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <!-- Катехезы / месса и исповедь -->
      <v-col cols="12" md="4">
        <v-switch
          v-model="localValue.catechesis"
          label="Ходит на катехезы"
          inset
        />
      </v-col>
      <v-col cols="12" md="8">
        <v-select
          v-model="localValue.massAndConfession"
          :items="massConfessionOptions"
          label="Исповедь и месса в воскресенье"
          item-title="label"
          item-value="value"
          prepend-inner-icon="mdi-church-outline"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <!-- Родители: отец и мать (COMBOBOX) -->
      <v-col cols="12" md="6">
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

      <v-col cols="12" md="6">
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

      <!-- Брачных полей здесь НЕТ — вся логика браков в коллекции marriages -->
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useAddressesStore } from '../stores/addresses';
import { usePeopleStore } from '../stores/people';

const props = defineProps({
  value: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:value', 'validity-change']);

const formRef = ref(null);
const isValid = ref(false);

const addressesStore = useAddressesStore();
const peopleStore = usePeopleStore();

const religionOptions = [
  { label: 'Католик', value: 'католик' },
  { label: 'Православный', value: 'православный' },
  { label: 'Старовер', value: 'старовер' },
  { label: 'Некрещенный', value: 'некрещенный' },
  { label: 'Протестант', value: 'протестант' },
];

const massConfessionOptions = [
  { label: 'Часто', value: 'часто' },
  { label: 'Регулярно', value: 'регулярно' },
  { label: 'Редко', value: 'редко' },
  { label: 'Раз в год', value: 'раз в год' },
  { label: 'Давно', value: 'давно' },
];

const sexOptions = [
  { label: 'Мужской', value: 'male' },
  { label: 'Женский', value: 'female' },
];

const localValue = ref({
  firstName: '',
  lastName: '',
  middleName: '',
  sex: '',
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
  addressId: null,
  fatherId: null,
  motherId: null,
  childrenIds: [],
  isDeceased: null,
  deathYear: null,
  marriageIds: [],
});

const required = (v) => !!v || 'Обязательное поле';

// ===== Адрес: combobox-модель и опции =====

const addressModel = ref(null);

const addressOptions = computed(() =>
  addressesStore.addresses.map((a) => ({
    value: a.id,
    label: formatShortAddress(a),
  }))
);

function formatShortAddress(a) {
  const apt = a.apartment ? `, кв. ${a.apartment}` : '';
  return `${a.localityType} ${a.localityName}, ${a.street}, д. ${a.house}${apt}`;
}

watch(
  () => addressModel.value,
  (val) => {
    if (!val) {
      localValue.value.addressId = null;
    } else if (typeof val === 'object' && val.value) {
      localValue.value.addressId = val.value;
    }
  }
);

const syncAddressModelFromLocal = () => {
  if (!localValue.value.addressId) {
    addressModel.value = null;
    return;
  }
  const found = addressOptions.value.find(
    (o) => o.value === localValue.value.addressId
  );
  addressModel.value = found || null;
};

// ===== Родители: combobox-модели и опции =====

const fatherModel = ref(null);
const motherModel = ref(null);

// удобный хелпер ФИО + год рождения
const fullNameWithYear = (p) => {
  const base = [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ');
  const year =
    p.birthDate && p.birthDate.length >= 4
      ? p.birthDate.slice(0, 4)
      : null;
  return year ? `${base} (${year})` : base;
};

// год рождения текущего человека (если есть)
const currentBirthYear = computed(() => {
  const bd = localValue.value.birthDate;
  if (!bd || bd.length < 4) return null;
  const y = parseInt(bd.slice(0, 4), 10);
  return Number.isNaN(y) ? null : y;
});

// множество id детей текущего человека (чтобы не выбрать ребёнка как родителя)
const myChildrenIds = computed(() => {
  return new Set(
    Array.isArray(localValue.value.childrenIds)
      ? localValue.value.childrenIds
      : []
  );
});

// кандидат в родителя не должен быть младше или ровесником
// если у ребёнка есть год рождения, а у кандидата нет — формально разрешаем.
// при желании можно наоборот запретить, но тогда будет много "пустых" случаев.
const isOlderThanChild = (candidate) => {
  const childYear = currentBirthYear.value;
  if (!childYear) return true; // нет инфы по ребёнку — не проверяем возраст

  if (!candidate.birthDate || candidate.birthDate.length < 4) return true;
  const candYear = parseInt(candidate.birthDate.slice(0, 4), 10);
  if (Number.isNaN(candYear)) return true;

  // родитель должен быть старше: год рождения строго меньше
  return candYear < childYear;
};

// кандидаты в отцы: male, не сам, не дети, старше
const fatherOptions = computed(() => {
  const currentId = localValue.value.id || props.value?.id || null;

  return peopleStore.people
    .filter((p) => {
      if (!p) return false;
      if (p.sex !== 'male') return false;               // мужчина
      if (currentId && p.id === currentId) return false; // не сам
      if (myChildrenIds.value.has(p.id)) return false;  // не ребёнок
      if (!isOlderThanChild(p)) return false;           // не младше/ровесник
      return true;
    })
    .map((p) => ({
      value: p.id,
      label: fullNameWithYear(p),
    }));
});

// кандидаты в матери: female, не сама, не дети, старше
const motherOptions = computed(() => {
  const currentId = localValue.value.id || props.value?.id || null;

  return peopleStore.people
    .filter((p) => {
      if (!p) return false;
      if (p.sex !== 'female') return false;              // женщина
      if (currentId && p.id === currentId) return false; // не сама
      if (myChildrenIds.value.has(p.id)) return false;   // не ребёнок
      if (!isOlderThanChild(p)) return false;            // не младше/ровесница
      return true;
    })
    .map((p) => ({
      value: p.id,
      label: fullNameWithYear(p),
    }));
});

// fatherModel <-> fatherId
watch(
  () => fatherModel.value,
  (val) => {
    if (!val) {
      localValue.value.fatherId = null;
    } else if (typeof val === 'object' && val.value) {
      localValue.value.fatherId = val.value;
    }
  }
);

const syncFatherModelFromLocal = () => {
  if (!localValue.value.fatherId) {
    fatherModel.value = null;
    return;
  }
  const found = fatherOptions.value.find(
    (o) => o.value === localValue.value.fatherId
  );
  fatherModel.value = found || null;
};

// motherModel <-> motherId
watch(
  () => motherModel.value,
  (val) => {
    if (!val) {
      localValue.value.motherId = null;
    } else if (typeof val === 'object' && val.value) {
      localValue.value.motherId = val.value;
    }
  }
);

const syncMotherModelFromLocal = () => {
  if (!localValue.value.motherId) {
    motherModel.value = null;
    return;
  }
  const found = motherOptions.value.find(
    (o) => o.value === localValue.value.motherId
  );
  motherModel.value = found || null;
};

// ===== Жизненный цикл и связь с пропсами =====
onMounted(async () => {
  if (!addressesStore.addresses.length && !addressesStore.loading) {
    await addressesStore.fetchAddresses();
  }
  if (!peopleStore.people.length && !peopleStore.loading) {
    await peopleStore.fetchPeople();
  }

  // Инициализация локального состояния из пропсов один раз
  setLocalFromProps(props.value);
  syncAddressModelFromLocal();
  syncFatherModelFromLocal();
  syncMotherModelFromLocal();
});

// Следим только за сменой id записи (например, открыли другого человека)
watch(
  () => props.value && props.value.id,
  (newId, oldId) => {
    if (!newId || newId === oldId) return;
    setLocalFromProps(props.value || {});
    syncAddressModelFromLocal();
    syncFatherModelFromLocal();
    syncMotherModelFromLocal();
  }
);

// любое изменение localValue → наружу
watch(
  () => localValue.value,
  () => {
    emit('update:value', { ...localValue.value });
  },
  { deep: true }
);

// валидность формы
watch(isValid, (val) => {
  emit('validity-change', val);
});

function setLocalFromProps(src) {
  const base = {
    ...localValue.value,
    ...src,
  };

  // гарантируем, что id не потеряется (если он есть в src)
  if (src && src.id) {
    base.id = src.id;
  }

  localValue.value = base;
}

async function validate() {
  if (!formRef.value) return false;
  const res = await formRef.value.validate();
  return res.valid ?? res;
}

defineExpose({ validate });
</script>