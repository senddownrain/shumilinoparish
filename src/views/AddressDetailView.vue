<!-- src/views/AddressDetailView.vue -->
<template>
  <div v-if="address">
    <!-- 1) Адрес и телефон + кнопки -->
    <v-card class="mb-4" rounded="lg" border>
      <v-card-title class="text-h6">
        {{ addressTitle }}
      </v-card-title>

      <v-card-subtitle>
        <span class="text-medium-emphasis">
          {{ address.localityType }} ·
          <span v-if="address.phoneHome">тел: {{ address.phoneHome }}</span>
          <span v-else>телефон не указан</span>
        </span>
      </v-card-subtitle>

      <v-card-text>
        <v-row class="ga-2" align="center">
          <v-col cols="12" sm="6">
            <v-btn
              block
              color="primary"
              variant="flat"
              :loading="isBusy(address.id)"
              :disabled="isBusy(address.id)"
              @click="toggleCurrentYear(address)"
            >
              <v-icon start>
                {{ visitedThisYear ? "mdi-check-circle" : "mdi-check-circle-outline" }}
              </v-icon>
              {{ visitedThisYear ? `Посещено (${currentYear})` : `Отметить визит (${currentYear})` }}
            </v-btn>
          </v-col>

          <v-col cols="6" sm="3">
            <v-btn
              block
              variant="tonal"
              prepend-icon="mdi-calendar-edit"
              :disabled="isBusy(address.id)"
              @click="openVisitSheet()"
            >
              Годы
            </v-btn>
          </v-col>

          <v-col cols="6" sm="3">
            <v-btn
              block
              variant="tonal"
              prepend-icon="mdi-phone"
              :disabled="!address.phoneHome"
              @click="callHome"
            >
              Позвонить
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 2) Супруги либо Жители -->
    <v-card class="mb-4" rounded="lg" border>
      <v-card-title class="text-subtitle-1">
        {{ mainCouple ? "Супруги" : `Жители (${residentsSorted.length})` }}
      </v-card-title>

      <v-card-text>
        <div v-if="mainCouple">
          <v-row>
            <v-col cols="12" md="6">
              <PersonInfoCard
                v-if="mainHusband"
                :person="mainHusband"
                role-label="Муж"
                mode="compact"
                @open="goToPerson"
              />
            </v-col>

            <v-col cols="12" md="6">
              <PersonInfoCard
                v-if="mainWife"
                :person="mainWife"
                role-label="Жена"
                mode="compact"
                @open="goToPerson"
              />
            </v-col>
          </v-row>

          <v-divider class="my-3" />

          <div class="text-body-2">
            <strong>Брак:</strong>
            <v-chip
              class="ml-2"
              size="small"
              :color="mainMarriage?.status === 'active' ? 'green' : 'grey'"
              variant="tonal"
            >
              {{ marriageStatusLabel(mainMarriage?.status) }}
            </v-chip>
          </div>

          <div class="d-flex flex-wrap ga-2 mt-2" v-if="mainMarriage">
            <v-chip v-if="mainMarriage.civilMarriageYear" size="small" variant="tonal">
              гражданский: {{ mainMarriage.civilMarriageYear }}
            </v-chip>

            <v-chip v-if="mainMarriage.churchMarriageYear" size="small" variant="tonal">
              венчание: {{ mainMarriage.churchMarriageYear }}
            </v-chip>

            <v-chip
              v-if="mainMarriage.isChurchMarried === true"
              size="small"
              color="primary"
              variant="tonal"
            >
              венчанный
            </v-chip>

            <v-chip
              v-if="mainMarriage.status !== 'active' && mainMarriage.divorceYear"
              size="small"
              variant="tonal"
            >
              год: {{ mainMarriage.divorceYear }}
            </v-chip>
          </div>
        </div>

        <div v-else>
          <v-alert v-if="!residentsSorted.length" type="info" variant="tonal">
            По этому адресу пока нет записанных людей.
          </v-alert>

          <v-row v-else>
            <v-col v-for="p in residentsSorted" :key="p.id" cols="12" md="6">
              <PersonInfoCard :person="p" mode="compact" @open="goToPerson" />
            </v-col>
          </v-row>
        </div>
      </v-card-text>

  
    </v-card>

    <!-- 3) Дети -->
    <v-card class="mb-4" rounded="lg" border>
      <v-card-title class="text-subtitle-1">
        Дети
        <span class="text-body-2 text-medium-emphasis ml-2">
          ({{ childrenToShow.length }})
        </span>
      </v-card-title>

      <v-card-text>
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="text-body-2 text-medium-emphasis">
            {{ childrenHint }}
          </div>

          <v-btn
            color="primary"
            variant="tonal"
            prepend-icon="mdi-plus"
            @click="showChildDialog = true"
          >
            Добавить
          </v-btn>
        </div>

        <v-alert
          v-if="!mainCouple"
          type="info"
          variant="outlined"
          class="mb-3"
        >
          Супруги по адресу не определены — поэтому список детей строится по признакам:
          “есть родители” или “возраст &lt; 18” (если есть дата рождения).
        </v-alert>

        <v-alert v-if="!childrenToShow.length" type="info" variant="tonal">
          Детей не найдено.
        </v-alert>

        <v-row v-else>
          <v-col v-for="c in childrenToShow" :key="c.id" cols="12" md="6">
            <ChildInfoCard
              :child="c"
              :father="getPerson(c.fatherId)"
              :mother="getPerson(c.motherId)"
              @open="goToPerson"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 4) Другие жители (только если есть супруги и есть другие) -->
    <v-card
      v-if="mainCouple && otherResidentsSorted.length"
      class="mb-4"
      rounded="lg"
      border
    >
      <v-card-title class="text-subtitle-1">
        Другие жители
        <span class="text-body-2 text-medium-emphasis ml-2">
          ({{ otherResidentsSorted.length }})
        </span>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col v-for="p in otherResidentsSorted" :key="p.id" cols="12" md="6">
            <PersonInfoCard :person="p" mode="compact" @open="goToPerson" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 5) Визиты -->
    <v-card class="mb-4" rounded="lg" border>
      <v-card-title class="text-subtitle-1">
        Визиты
      </v-card-title>

      <v-card-text>
        <div class="mb-2">
          <strong>Годы визитов:</strong>
          <span v-if="visitYearsSorted.length">{{ visitYearsSorted.join(", ") }}</span>
          <span v-else class="text-medium-emphasis">ещё не посещали</span>
        </div>

        <div class="d-flex ga-2 flex-wrap">
          <v-btn
            color="primary"
            variant="flat"
            :loading="isBusy(address.id)"
            :disabled="isBusy(address.id)"
            @click="toggleCurrentYear(address)"
          >
            {{ visitedThisYear ? `Снять (${currentYear})` : `Навестить (${currentYear})` }}
          </v-btn>

          <v-btn
            variant="tonal"
            prepend-icon="mdi-calendar-edit"
            :disabled="isBusy(address.id)"
            @click="openVisitSheet()"
          >
            Задним числом
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Bottom sheet: визиты -->
    <v-bottom-sheet v-model="visitSheet">
      <v-card v-if="address">
        <v-card-title class="text-h6">
          Визиты: {{ addressTitle }}
        </v-card-title>

        <v-card-text>
          <div class="text-body-2 text-medium-emphasis mb-3">
            Нажимайте на год, чтобы поставить или убрать отметку.
          </div>

          <div class="d-flex flex-wrap ga-2 mb-4">
            <v-chip
              v-for="y in yearChips"
              :key="y"
              :color="hasVisitedYear(address, y) ? 'primary' : undefined"
              :variant="hasVisitedYear(address, y) ? 'flat' : 'outlined'"
              :disabled="isBusy(address.id)"
              @click="toggleYear(address, y)"
            >
              {{ y }}
            </v-chip>
          </div>

          <v-divider class="my-3" />

          <v-row>
            <v-col cols="7">
              <v-text-field
                v-model.number="customYear"
                label="Год (вручную)"
                type="number"
                variant="outlined"
                density="comfortable"
                placeholder="например, 2024"
              />
            </v-col>

            <v-col cols="5" class="d-flex align-center">
              <v-btn
                color="primary"
                variant="flat"
                block
                :disabled="!isValidCustomYear || isBusy(address.id)"
                @click="toggleYear(address, customYear)"
              >
                Применить
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="visitSheet = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- Диалог добавления ребёнка -->
    <ChildCreateDialog
      v-if="address"
      v-model="showChildDialog"
      :address="address"
      :father="mainHusband"
      :mother="mainWife"
      @created="onChildCreated"
    />

    <!-- Snackbar Undo -->
    <v-snackbar v-model="snackbar.open" :timeout="3500">
      {{ snackbar.text }}
      <template #actions>
        <v-btn
          v-if="snackbar.undo"
          variant="text"
          color="primary"
          @click="snackbar.undo()"
        >
          Отменить
        </v-btn>
        <v-btn variant="text" @click="snackbar.open = false">OK</v-btn>
      </template>
    </v-snackbar>
  </div>

  <div v-else>
    <v-alert type="error" variant="outlined">
      Адрес не найден.
    </v-alert>
    <v-btn class="mt-3" color="primary" variant="flat" @click="goBackToList">
      Назад к списку адресов
    </v-btn>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAddressesStore } from "../stores/addresses";
import { usePeopleStore } from "../stores/people";
import { useMarriagesStore } from "../stores/marriages";
import { useAppUiStore } from "../stores/appUi";

import ChildCreateDialog from "../components/ChildCreateDialog.vue";
import PersonInfoCard from "../components/PersonInfoCard.vue";
import ChildInfoCard from "../components/ChildInfoCard.vue";

const route = useRoute();
const router = useRouter();

const appUi = useAppUiStore();
const addressesStore = useAddressesStore();
const peopleStore = usePeopleStore();
const marriagesStore = useMarriagesStore();

const currentYear = new Date().getFullYear();

const normalize = (s) => String(s || "").toLowerCase().replaceAll("ё", "е").trim();

const birthYear = (value) => {
  const s = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return Number(s.slice(0, 4));
  const y = Number(s);
  return Number.isFinite(y) ? y : null;
};

const estimateAge = (birthDateStr) => {
  const y = birthYear(birthDateStr);
  if (!y) return null;
  return currentYear - y;
};

// ===== Busy + snackbar undo =====
const busyByAddressId = ref(new Set());
const isBusy = (addressId) => busyByAddressId.value.has(addressId);

const snackbar = ref({ open: false, text: "", undo: null });
const showUndo = ({ text, undo }) => {
  snackbar.value = { open: true, text, undo };
};

const withBusy = async (addressId, fn) => {
  busyByAddressId.value = new Set([...busyByAddressId.value, addressId]);
  try {
    await fn();
  } finally {
    const next = new Set(busyByAddressId.value);
    next.delete(addressId);
    busyByAddressId.value = next;
  }
};

// ===== Address =====
const address = computed(() => {
  const id = String(route.params.id);
  return addressesStore.getAddressById(id).value;
});

const addressTitle = computed(() => {
  const a = address.value;
  if (!a) return "Адрес";
  const apt = a.apartment ? `-${a.apartment}` : "";
  return `${a.localityName}, ${a.street} ${a.house}${apt}`;
});

// ===== AppBar =====
const setAppBar = () => {
  appUi.set({
    title: addressTitle.value || "Адрес",
    showBack: true,
    backTo: { name: "AddressList" },
    actions: [
      {
        icon: "mdi-pencil",
        label: "Редактировать",
        to: { name: "AddressEdit", params: { id: String(route.params.id) } },
        disabled: !address.value,
      },
    ],
  });
};

watch(addressTitle, () => setAppBar());
watch(
  () => route.params.id,
  () => setAppBar()
);

onMounted(async () => {
  setAppBar();

  if (!addressesStore.addresses.length && !addressesStore.loading) {
    await addressesStore.fetchAddresses();
  }
  if (!peopleStore.people.length && !peopleStore.loading) {
    await peopleStore.fetchPeople();
  }
  if (!marriagesStore.marriages.length && !marriagesStore.loading) {
    await marriagesStore.fetchMarriages();
  }
});

onUnmounted(() => {
  appUi.reset();
});

const goBackToList = () => router.push({ name: "AddressList" });
const goToPerson = (personId) => router.push({ name: "PeopleDetail", params: { id: personId } });

// ===== People (residents) =====
const residents = computed(() => {
  const id = String(route.params.id);
  return peopleStore.people.filter((p) => p.addressId === id);
});

const residentsSorted = computed(() => {
  return [...residents.value].sort((a, b) => {
    const da = a.isDeceased ? 1 : 0;
    const db = b.isDeceased ? 1 : 0;
    if (da !== db) return da - db;

    const aa = normalize(`${a.lastName} ${a.firstName} ${a.middleName}`);
    const bb = normalize(`${b.lastName} ${b.firstName} ${b.middleName}`);
    return aa.localeCompare(bb, "ru");
  });
});

// ===== Main couple =====
const mainCouple = computed(() => {
  for (const m of marriagesStore.marriages) {
    if (m.status !== "active") continue;
    const husband = residents.value.find((p) => p.id === m.husbandId);
    const wife = residents.value.find((p) => p.id === m.wifeId);
    if (husband && wife) return { marriage: m, husband, wife };
  }
  return null;
});

const mainMarriage = computed(() => mainCouple.value?.marriage || null);
const mainHusband = computed(() => mainCouple.value?.husband || null);
const mainWife = computed(() => mainCouple.value?.wife || null);

const marriageStatusLabel = (status) => {
  if (status === "active") return "активный";
  if (status === "divorced") return "разведены";
  if (status === "widowed") return "вдовство";
  return status || "неизвестно";
};

// ===== Children =====
const childrenOfMainCouple = computed(() => {
  if (!mainHusband.value || !mainWife.value) return [];
  const fatherId = mainHusband.value.id;
  const motherId = mainWife.value.id;

  return residents.value
    .filter((p) => p.fatherId === fatherId && p.motherId === motherId)
    .sort((a, b) => (a.birthDate || "").localeCompare(b.birthDate || ""));
});

const childrenFallback = computed(() => {
  // если нет супругов: ребёнок = есть родители ИЛИ возраст < 18 (если знаем дату)
  return residents.value
    .filter((p) => {
      const hasParents = !!(p.fatherId || p.motherId);
      const age = estimateAge(p.birthDate);
      const isChildByAge = age != null ? age < 18 : false;
      return hasParents || isChildByAge;
    })
    .sort((a, b) => (a.birthDate || "").localeCompare(b.birthDate || ""));
});

const childrenToShow = computed(() => (mainCouple.value ? childrenOfMainCouple.value : childrenFallback.value));

const childrenHint = computed(() => {
  if (mainCouple.value) return "Дети, у которых отец и мать совпадают с супругами по адресу.";
  return "Авто-режим: есть родители или возраст < 18 (если указана дата рождения).";
});

// ===== Other residents (only when couple exists) =====
const otherResidents = computed(() => {
  if (!mainCouple.value) return [];

  const excludeIds = new Set();
  if (mainHusband.value) excludeIds.add(mainHusband.value.id);
  if (mainWife.value) excludeIds.add(mainWife.value.id);
  childrenOfMainCouple.value.forEach((c) => excludeIds.add(c.id));

  return residents.value.filter((p) => !excludeIds.has(p.id));
});

const otherResidentsSorted = computed(() => {
  return [...otherResidents.value].sort((a, b) => {
    const aa = normalize(`${a.lastName} ${a.firstName} ${a.middleName}`);
    const bb = normalize(`${b.lastName} ${b.firstName} ${b.middleName}`);
    return aa.localeCompare(bb, "ru");
  });
});

// ===== Visits =====
const hasVisitedYear = (a, year) => {
  const years = Array.isArray(a?.visitYears) ? a.visitYears : [];
  return years.includes(Number(year));
};

const visitedThisYear = computed(() => {
  if (!address.value) return false;
  return hasVisitedYear(address.value, currentYear);
});

const visitYearsSorted = computed(() => {
  const years = Array.isArray(address.value?.visitYears) ? address.value.visitYears : [];
  return [...years].sort((a, b) => a - b);
});

const visitSheet = ref(false);
const customYear = ref(null);

const yearChips = computed(() => {
  const yearsExisting = Array.isArray(address.value?.visitYears) ? address.value.visitYears : [];
  const base = [];
  for (let y = currentYear; y >= currentYear - 10; y--) base.push(y);

  const set = new Set([...base, ...yearsExisting.map(Number).filter(Number.isFinite)]);
  return Array.from(set).sort((x, y) => y - x);
});

const isValidCustomYear = computed(() => {
  const y = Number(customYear.value);
  if (!Number.isFinite(y)) return false;
  if (y < 1900) return false;
  if (y > currentYear + 1) return false;
  return true;
});

const openVisitSheet = () => {
  customYear.value = null;
  visitSheet.value = true;
};

const toggleCurrentYear = async (addr) => {
  const id = addr.id;
  const year = currentYear;
  const already = hasVisitedYear(addr, year);

  await withBusy(id, async () => {
    if (!already) {
      await addressesStore.markVisitedYear(id, year);
      showUndo({
        text: `Визит отмечен: ${year}`,
        undo: async () => {
          await withBusy(id, async () => {
            await addressesStore.unmarkVisitedYear(id, year);
            showUndo({ text: `Отменено: ${year}`, undo: null });
          });
        },
      });
    } else {
      await addressesStore.unmarkVisitedYear(id, year);
      showUndo({
        text: `Визит снят: ${year}`,
        undo: async () => {
          await withBusy(id, async () => {
            await addressesStore.markVisitedYear(id, year);
            showUndo({ text: `Возвращено: ${year}`, undo: null });
          });
        },
      });
    }
  });
};

const toggleYear = async (addr, year) => {
  const id = addr.id;
  const y = Number(year);
  if (!Number.isFinite(y)) return;

  const already = hasVisitedYear(addr, y);

  await withBusy(id, async () => {
    if (!already) {
      await addressesStore.markVisitedYear(id, y);
      showUndo({
        text: `Визит отмечен: ${y}`,
        undo: async () => {
          await withBusy(id, async () => {
            await addressesStore.unmarkVisitedYear(id, y);
            showUndo({ text: `Отменено: ${y}`, undo: null });
          });
        },
      });
    } else {
      await addressesStore.unmarkVisitedYear(id, y);
      showUndo({
        text: `Визит снят: ${y}`,
        undo: async () => {
          await withBusy(id, async () => {
            await addressesStore.markVisitedYear(id, y);
            showUndo({ text: `Возвращено: ${y}`, undo: null });
          });
        },
      });
    }
  });
};

// ===== Person lookup for child cards =====
const personById = computed(() => {
  const map = new Map();
  peopleStore.people.forEach((p) => map.set(p.id, p));
  return map;
});
const getPerson = (id) => (id ? personById.value.get(id) || null : null);

// ===== Call =====
const callHome = () => {
  const phone = String(address.value?.phoneHome || "").trim();
  if (!phone) return;
  const tel = phone.replace(/\s+/g, "");
  window.location.href = `tel:${tel}`;
};

// ===== Child dialog =====
const showChildDialog = ref(false);
const onChildCreated = async () => {
  await peopleStore.fetchPeople();
};
</script>

<style scoped>
/* ничего критичного; оставлено пустым намеренно */
</style>