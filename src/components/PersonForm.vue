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
        <v-switch v-model="localValue.isDeceased" label="Умер(ла)" inset />
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

      <!-- Адрес проживания -->
      <v-col cols="12" md="8">
        <v-autocomplete
          v-model="localValue.addressId"
          :items="addressOptions"
          label="Адрес проживания"
          item-title="label"
          item-value="value"
          prepend-inner-icon="mdi-home-map-marker"
          variant="outlined"
          density="comfortable"
          clearable
          hide-selected
          hint="Начните вводить населённый пункт, улицу или дом"
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
          v-model="catechesisBool"
          label="Ходит на катехезы"
          inset
        />
        <div class="text-caption text-medium-emphasis mt-1">
          <span v-if="localValue.catechesis === null">сейчас: не указано</span>
          <span v-else-if="localValue.catechesis === true">сейчас: да</span>
          <span v-else>сейчас: нет</span>
          <v-btn
            size="x-small"
            variant="text"
            class="ml-2"
            @click="localValue.catechesis = null"
          >
            очистить
          </v-btn>
        </div>
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
          clearable
        />
      </v-col>

      <!-- Родители -->
      <v-col cols="12" md="6">
        <v-autocomplete
          v-model="localValue.fatherId"
          :items="fatherOptions"
          label="Отец"
          item-title="label"
          item-value="value"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
          density="comfortable"
          clearable
          hide-selected
          hint="Начните вводить фамилию или имя"
          persistent-hint
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-autocomplete
          v-model="localValue.motherId"
          :items="motherOptions"
          label="Мать"
          item-title="label"
          item-value="value"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
          density="comfortable"
          clearable
          hide-selected
          hint="Начните вводить фамилию или имя"
          persistent-hint
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useAddressesStore } from "../stores/addresses";
import { usePeopleStore } from "../stores/people";

const props = defineProps({
  value: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:value", "validity-change"]);

const formRef = ref(null);
const isValid = ref(false);

const addressesStore = useAddressesStore();
const peopleStore = usePeopleStore();

const religionOptions = [
  { label: "Католик", value: "католик" },
  { label: "Православный", value: "православный" },
  { label: "Старовер", value: "старовер" },
  { label: "Некрещенный", value: "некрещенный" },
  { label: "Протестант", value: "протестант" },
];

const massConfessionOptions = [
  { label: "Часто", value: "часто" },
  { label: "Регулярно", value: "регулярно" },
  { label: "Редко", value: "редко" },
  { label: "Раз в год", value: "раз в год" },
  { label: "Давно", value: "давно" },
];

const sexOptions = [
  { label: "Мужской", value: "male" },
  { label: "Женский", value: "female" },
];

const required = (v) => !!v || "Обязательное поле";

const localValue = ref({
  id: null,
  firstName: "",
  lastName: "",
  middleName: "",
  sex: "",
  birthDate: "",
  profession: "",
  workplace: "",
  religion: "",
  phone: "",
  baptismYear: null,
  chrismationYear: null,
  firstCommunionYear: null,
  catechesis: null, // true/false/null
  massAndConfession: "",
  addressId: null,
  fatherId: null,
  motherId: null,
  childrenIds: [],
  isDeceased: false,
  deathYear: null,
  marriageIds: [],
});

function formatShortAddress(a) {
  const apt = a.apartment ? `, кв. ${a.apartment}` : "";
  return `${a.localityType} ${a.localityName}, ${a.street}, д. ${a.house}${apt}`;
}

const addressOptions = computed(() =>
  (addressesStore.addresses || []).map((a) => ({
    value: a.id,
    label: formatShortAddress(a),
  }))
);

const fullNameWithYear = (p) => {
  const base = [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ");
  const year = p.birthDate && String(p.birthDate).length >= 4 ? String(p.birthDate).slice(0, 4) : null;
  return year ? `${base} (${year})` : base;
};

const currentBirthYear = computed(() => {
  const bd = localValue.value.birthDate;
  if (!bd || String(bd).length < 4) return null;
  const y = parseInt(String(bd).slice(0, 4), 10);
  return Number.isNaN(y) ? null : y;
});

const myChildrenIds = computed(() => new Set(Array.isArray(localValue.value.childrenIds) ? localValue.value.childrenIds : []));

const isOlderThanChild = (candidate) => {
  const childYear = currentBirthYear.value;
  if (!childYear) return true;
  if (!candidate.birthDate || String(candidate.birthDate).length < 4) return true;
  const candYear = parseInt(String(candidate.birthDate).slice(0, 4), 10);
  if (Number.isNaN(candYear)) return true;
  return candYear < childYear;
};

const currentId = computed(() => localValue.value.id || props.value?.id || null);

const fatherOptions = computed(() => {
  const cid = currentId.value;
  return (peopleStore.people || [])
    .filter((p) => {
      if (!p) return false;
      if (p.sex !== "male") return false;
      if (cid && p.id === cid) return false;
      if (myChildrenIds.value.has(p.id)) return false;
      if (!isOlderThanChild(p)) return false;
      return true;
    })
    .map((p) => ({ value: p.id, label: fullNameWithYear(p) }))
    .sort((a, b) => a.label.localeCompare(b.label, "ru"));
});

const motherOptions = computed(() => {
  const cid = currentId.value;
  return (peopleStore.people || [])
    .filter((p) => {
      if (!p) return false;
      if (p.sex !== "female") return false;
      if (cid && p.id === cid) return false;
      if (myChildrenIds.value.has(p.id)) return false;
      if (!isOlderThanChild(p)) return false;
      return true;
    })
    .map((p) => ({ value: p.id, label: fullNameWithYear(p) }))
    .sort((a, b) => a.label.localeCompare(b.label, "ru"));
});

// tri-state catechesis через switch + “очистить”
const catechesisBool = computed({
  get() {
    return localValue.value.catechesis === true;
  },
  set(v) {
    localValue.value.catechesis = v ? true : false;
  },
});

watch(
  () => localValue.value.isDeceased,
  (v) => {
    if (!v) localValue.value.deathYear = null;
  }
);

onMounted(async () => {
  if (!addressesStore.addresses.length && !addressesStore.loading) {
    await addressesStore.fetchAddresses();
  }
  if (!peopleStore.people.length && !peopleStore.loading) {
    await peopleStore.fetchPeople();
  }

  setLocalFromProps(props.value);
});

// если вдруг открыли другого человека в той же форме (редко, но полезно)
watch(
  () => props.value && props.value.id,
  (newId, oldId) => {
    if (!newId || newId === oldId) return;
    setLocalFromProps(props.value || {});
  }
);

// любое изменение localValue → наружу
watch(
  () => localValue.value,
  () => {
    emit("update:value", { ...localValue.value });
  },
  { deep: true }
);

watch(isValid, (val) => {
  emit("validity-change", val);
});

function setLocalFromProps(src) {
  const s = src || {};
  localValue.value = {
    ...localValue.value,
    ...s,
    // гарантируем типы
    isDeceased: Boolean(s.isDeceased),
    deathYear: s.isDeceased ? (s.deathYear ?? null) : null,
    childrenIds: Array.isArray(s.childrenIds) ? s.childrenIds : [],
    marriageIds: Array.isArray(s.marriageIds) ? s.marriageIds : [],
    addressId: s.addressId ?? null,
    fatherId: s.fatherId ?? null,
    motherId: s.motherId ?? null,
    catechesis: s.catechesis === true ? true : s.catechesis === false ? false : null,
  };
}

async function validate() {
  if (!formRef.value) return false;
  const res = await formRef.value.validate();
  return res.valid ?? res;
}

defineExpose({ validate });
</script>