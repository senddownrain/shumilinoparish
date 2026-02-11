<template>
  <v-form ref="formRef" v-model="isValid">
    <v-row>
      <v-col cols="12" md="6">
        <v-select
          v-model="localValue.localityType"
          :items="localityOptions"
          label="Тип населённого пункта"
          item-title="label"
          item-value="value"
          :rules="[required]"
          prepend-inner-icon="mdi-map-marker"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="localValue.localityName"
          label="Название населённого пункта"
          :rules="[required]"
          prepend-inner-icon="mdi-city"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="localValue.street"
          label="Улица"
          :rules="[required]"
          prepend-inner-icon="mdi-road"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <v-col cols="6" md="3">
        <v-text-field
          v-model="localValue.house"
          label="Дом"
          :rules="[required]"
          prepend-inner-icon="mdi-home"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <v-col cols="6" md="3">
        <v-text-field
          v-model="localValue.apartment"
          label="Квартира"
          prepend-inner-icon="mdi-door"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="localValue.phoneHome"
          label="Домашний телефон"
          prepend-inner-icon="mdi-phone"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-combobox
          v-model="visitYearsInput"
          label="Годы визитов (через Enter)"
          prepend-inner-icon="mdi-calendar"
          variant="outlined"
          density="comfortable"
          multiple
          chips
          small-chips
          clearable
          hint="Например: 2018, 2019, 2022"
          persistent-hint
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  value: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:value", "validity-change"]);

const formRef = ref(null);
const isValid = ref(false);

const currentYear = new Date().getFullYear();

const localityOptions = [
  { label: "Город", value: "город" },
  { label: "Посёлок", value: "посёлок" },
  { label: "Деревня", value: "деревня" },
];

const localValue = ref({
  localityType: "",
  localityName: "",
  street: "",
  house: "",
  apartment: "",
  phoneHome: "",
  visitYears: [],
});

const visitYearsInput = ref([]);

const required = (v) => !!v || "Обязательное поле";

function normalizeVisitYears(input) {
  const arr = Array.isArray(input) ? input : [];
  const years = arr
    .map((x) => String(x ?? "").trim())
    .filter((s) => s !== "")
    .map((s) => {
      // берём только целое (чтобы "2022 " и "2022" были одинаковыми)
      const n = Number.parseInt(s, 10);
      return Number.isFinite(n) ? n : null;
    })
    .filter((n) => n != null)
    .filter((n) => n >= 1900 && n <= currentYear + 1);

  // уникально + сортировка по возрастанию
  return Array.from(new Set(years)).sort((a, b) => a - b);
}

// Инициализация из props.value однократно
onMounted(() => {
  setLocalFromProps(props.value);
});

// Любое изменение локального состояния → эмитим наверх (с защитой от одинаковых значений)
watch(
  [localValue, visitYearsInput],
  () => {
    const normalizedYears = normalizeVisitYears(visitYearsInput.value);

    const result = {
      ...localValue.value,
      visitYears: normalizedYears,
    };

    const prev = props.value || {};
    const same =
      (prev.localityType || "") === (result.localityType || "") &&
      (prev.localityName || "") === (result.localityName || "") &&
      (prev.street || "") === (result.street || "") &&
      (prev.house || "") === (result.house || "") &&
      (prev.apartment || "") === (result.apartment || "") &&
      (prev.phoneHome || "") === (result.phoneHome || "") &&
      JSON.stringify(Array.isArray(prev.visitYears) ? prev.visitYears : []) ===
        JSON.stringify(result.visitYears || []);

    if (!same) {
      emit("update:value", result);
    }
  },
  { deep: true }
);

// валидность формы
watch(isValid, (val) => {
  emit("validity-change", val);
});

function setLocalFromProps(src) {
  const v = src || {};
  const years = Array.isArray(v.visitYears) ? v.visitYears : [];

  localValue.value = {
    localityType: v.localityType || "",
    localityName: v.localityName || "",
    street: v.street || "",
    house: v.house || "",
    apartment: v.apartment || "",
    phoneHome: v.phoneHome || "",
    visitYears: normalizeVisitYears(years),
  };

  visitYearsInput.value = [...localValue.value.visitYears];
}

async function validate() {
  if (!formRef.value) return false;
  const res = await formRef.value.validate();
  return res.valid ?? res;
}

defineExpose({ validate });
</script>