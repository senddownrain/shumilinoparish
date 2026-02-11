<template>
  <div v-if="loaded && formData">
    <v-card>
      <v-card-text>
        <AddressForm
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
    <v-alert type="error" variant="outlined">
      Адрес не найден.
    </v-alert>
    <v-btn class="mt-2" @click="goBack">Вернуться</v-btn>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAddressesStore } from "../stores/addresses";
import { useAppUiStore } from "../stores/appUi";
import AddressForm from "../components/AddressForm.vue";

const route = useRoute();
const router = useRouter();

const addressesStore = useAddressesStore();
const appUi = useAppUiStore();

const formData = ref(null);
const formRef = ref(null);

const saving = ref(false);
const isValid = ref(false);

const loading = ref(false);
const loaded = ref(false);

const currentYear = new Date().getFullYear();
const normalizeVisitYears = (years) => {
  const arr = Array.isArray(years) ? years : [];
  const out = arr
    .map((x) => Number.parseInt(String(x ?? "").trim(), 10))
    .filter((n) => Number.isFinite(n))
    .filter((n) => n >= 1900 && n <= currentYear + 1);
  return Array.from(new Set(out)).sort((a, b) => a - b);
};

const currentAddress = computed(() => {
  const id = String(route.params.id);
  return addressesStore.getAddressById(id).value;
});

const addressTitle = computed(() => {
  const a = currentAddress.value;
  if (!a) return "Адрес";
  const apt = a.apartment ? `-${a.apartment}` : "";
  return `${a.localityName}, ${a.street} ${a.house}${apt}`;
});

const goBack = () => {
  router.push({ name: "AddressDetail", params: { id: route.params.id } });
};

const onValidityChange = (val) => {
  isValid.value = val;
};

const loadAddress = async () => {
  loading.value = true;

  if (!addressesStore.addresses.length && !addressesStore.loading) {
    await addressesStore.fetchAddresses();
  }

  const addr = currentAddress.value;
  if (addr) {
    formData.value = { ...addr }; // не трогаем стор напрямую
    loaded.value = true;
  } else {
    loaded.value = false;
  }

  loading.value = false;
};

const save = async () => {
  if (!formRef.value || !(await formRef.value.validate())) return;

  saving.value = true;
  try {
    const payload = { ...(formData.value || {}) };
    delete payload.id; // страховка

    payload.visitYears = normalizeVisitYears(payload.visitYears);

    await addressesStore.updateAddress(String(route.params.id), payload);
    goBack();
  } catch (e) {
    console.error("Ошибка при обновлении адреса:", e);
  } finally {
    saving.value = false;
  }
};

const setAppBar = () => {
  appUi.set({
    title: `Редактирование: ${addressTitle.value}`,
    showBack: true,
    backTo: { name: "AddressDetail", params: { id: String(route.params.id) } },
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
  await loadAddress();
  setAppBar();
});

watch([addressTitle, loaded, isValid, saving], () => setAppBar());

onUnmounted(() => {
  appUi.reset();
});
</script>