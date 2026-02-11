<!-- src/views/AddressListView.vue -->
<template>
  <div>
    <!-- Верхняя панель: поиск + режим -->
    <v-row class="mb-3" align="center">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="text-h6">Адреса</div>
            <div class="text-body-2 text-medium-emphasis">
              <span v-if="!addressesStore.loading">
                Найдено: {{ filteredAddresses.length }}
              </span>
              <span v-else>Загрузка…</span>
            </div>
          </div>
          <v-btn variant="text" prepend-icon="mdi-filter-variant" @click="filtersSheet = true">
            Фильтры
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="search"
          label="Поиск адреса (улица, дом, телефон)"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
        />
      </v-col>

      <v-col cols="12">
        <v-btn-toggle v-model="mode" mandatory divided density="comfortable">
          <v-btn value="search" prepend-icon="mdi-text-search">Поиск</v-btn>
          <v-btn value="todo" prepend-icon="mdi-calendar-alert">
            Нужно посетить ({{ currentYear }})
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <v-alert v-if="addressesStore.error" type="error" variant="outlined" class="mb-3">
      {{ addressesStore.error }}
    </v-alert>

    <!-- Скелетоны -->
    <div v-if="addressesStore.loading">
      <v-skeleton-loader type="list-item-two-line" class="mb-2" />
      <v-skeleton-loader type="list-item-two-line" class="mb-2" />
      <v-skeleton-loader type="list-item-two-line" class="mb-2" />
    </div>

    <!-- Список -->
    <div v-else>
      <v-sheet v-if="!filteredAddresses.length" class="pa-6" rounded="lg" border>
        <div class="text-subtitle-1 mb-1">Ничего не найдено</div>
        <div class="text-body-2 text-medium-emphasis">
          Попробуйте изменить запрос или фильтры.
        </div>
      </v-sheet>

      <v-list v-else lines="two" density="compact" class="pa-0" border rounded="lg">
        <v-list-item
          v-for="addr in filteredAddresses"
          :key="addr.id"
          @click="goToDetail(addr.id)"
        >
          <template #title>
            <div class="d-flex align-center justify-space-between">
              <div class="text-body-1 font-weight-medium">
                {{ shortTitle(addr) }}
              </div>

              <v-chip
                v-if="mode === 'todo' && !hasVisitedYear(addr, currentYear)"
                size="x-small"
                color="orange"
                variant="tonal"
              >
                не посещали
              </v-chip>

              <v-chip
                v-else-if="hasVisitedYear(addr, currentYear)"
                size="x-small"
                color="green"
                variant="tonal"
              >
                {{ currentYear }} ✓
              </v-chip>
            </div>
          </template>

          <template #subtitle>
            <div class="text-body-2 text-medium-emphasis">
              <span>{{ subtitleLine(addr) }}</span>
            </div>
          </template>

          <template #append>
            <!-- Быстро: отметить/снять текущий год -->
            <v-btn
              :icon="hasVisitedYear(addr, currentYear) ? 'mdi-check-circle' : 'mdi-check-circle-outline'"
              variant="text"
              color="primary"
              :loading="isBusy(addr.id)"
              :disabled="isBusy(addr.id)"
              @click.stop="toggleCurrentYear(addr)"
            />

            <!-- Удалить -->
            <v-btn
              icon="mdi-delete"
              size="small"
              color="red"
              variant="text"
              @click.stop="confirmDelete(addr)"
            />
          </template>
        </v-list-item>
      </v-list>

      <!-- FAB добавить адрес -->
      <v-btn
        color="primary"
        icon="mdi-plus"
        class="position-fixed"
        style="right: 20px; bottom: 84px;"
        size="large"
        @click="goToCreate"
      />
    </div>

    <!-- Bottom sheet: фильтры -->
    <v-bottom-sheet v-model="filtersSheet">
      <v-card>
        <v-card-title class="text-h6">Фильтры</v-card-title>
        <v-card-text>
          <v-combobox
            v-model="settlementFilter"
            :items="settlementOptions"
            label="Населённый пункт"
            prepend-inner-icon="mdi-city"
            variant="outlined"
            density="comfortable"
            clearable
            hint="Начните вводить: Шумилино, Витебск…"
            persistent-hint
          />
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="resetFilters">Сбросить</v-btn>
          <v-spacer />
          <v-btn color="primary" variant="flat" @click="filtersSheet = false">
            Готово
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- Диалог удаления адреса -->
    <v-dialog v-model="deleteDialog" max-width="460">
      <v-card>
        <v-card-title class="text-h6">Удалить адрес?</v-card-title>
        <v-card-text>
          <div class="mb-2">
            <strong>{{ addressToDeleteTitle }}</strong>
          </div>

          <v-alert
            v-if="residentsCountAtDelete > 0"
            type="warning"
            variant="outlined"
            class="mb-2"
          >
            По этому адресу есть жители: {{ residentsCountAtDelete }}.
            Сначала перенесите/удалите людей, иначе останутся “сироты”.
          </v-alert>

          <div class="text-body-2 text-medium-emphasis">
            Это действие нельзя будет отменить.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Отмена</v-btn>
          <v-btn
            color="red"
            variant="flat"
            :loading="deleting"
            :disabled="residentsCountAtDelete > 0"
            @click="performDelete"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Bottom sheet: визиты (включая задним числом) -->
    <v-bottom-sheet v-model="visitSheet">
      <v-card v-if="visitAddress">
        <v-card-title class="text-h6">
          Визиты: {{ shortTitle(visitAddress) }}
        </v-card-title>
        <v-card-text>
          <div class="text-body-2 text-medium-emphasis mb-3">
            Нажимайте на год, чтобы поставить или убрать отметку.
          </div>

          <div class="d-flex flex-wrap ga-2 mb-4">
            <v-chip
              v-for="y in yearChips"
              :key="y"
              :color="hasVisitedYear(visitAddress, y) ? 'primary' : undefined"
              :variant="hasVisitedYear(visitAddress, y) ? 'flat' : 'outlined'"
              :disabled="isBusy(visitAddress.id)"
              @click="toggleYear(visitAddress, y)"
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
                :disabled="!isValidCustomYear || isBusy(visitAddress.id)"
                @click="toggleYear(visitAddress, customYear)"
              >
                Применить
              </v-btn>
            </v-col>
          </v-row>

          <v-alert v-if="visitAddress.phoneHome" type="info" variant="tonal" class="mt-2">
            Телефон: <strong>{{ visitAddress.phoneHome }}</strong>
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeVisitSheet">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- Snackbar с отменой -->
    <v-snackbar v-model="snackbar.open" :timeout="3500">
      {{ snackbar.text }}
      <template #actions>
        <v-btn v-if="snackbar.undo" variant="text" color="primary" @click="snackbar.undo()">
          Отменить
        </v-btn>
        <v-btn variant="text" @click="snackbar.open = false">OK</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { useAddressesStore } from "../stores/addresses";
import { usePeopleStore } from "../stores/people";

const router = useRouter();
const addressesStore = useAddressesStore();
const peopleStore = usePeopleStore();

const currentYear = new Date().getFullYear();

const search = ref("");
const mode = ref("search"); // 'search' | 'todo'

const filtersSheet = ref(false);
const settlementFilter = ref(null);

const visitSheet = ref(false);
const visitAddressId = ref(null); // храним id
const customYear = ref(null);

const busyByAddressId = ref(new Set());
const isBusy = (addressId) => busyByAddressId.value.has(addressId);

const snackbar = ref({
  open: false,
  text: "",
  undo: null,
});

// DELETE state
const deleteDialog = ref(false);
const deleting = ref(false);
const addressToDelete = ref(null);

const addressToDeleteTitle = computed(() => {
  const a = addressToDelete.value;
  if (!a) return "";
  const apt = a.apartment ? `-${a.apartment}` : "";
  return `${a.localityName}, ${a.street} ${a.house}${apt}`;
});

const residentsCountAtDelete = computed(() => {
  const a = addressToDelete.value;
  if (!a) return 0;
  return (peopleStore.people || []).filter((p) => p.addressId === a.id).length;
});

const confirmDelete = async (addr) => {
  addressToDelete.value = addr;
  deleteDialog.value = true;

  // чтобы корректно посчитать жителей
  if (!peopleStore.people.length && !peopleStore.loading) {
    await peopleStore.fetchPeople();
  }
};

const performDelete = async () => {
  if (!addressToDelete.value) return;

  deleting.value = true;
  try {
    await addressesStore.deleteAddress(addressToDelete.value.id);
  } catch (e) {
    console.error("Ошибка при удалении адреса:", e);
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
    addressToDelete.value = null;
  }
};

const normalize = (s) => {
  return String(s || "")
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[.,;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const settlementOptions = computed(() => {
  const set = new Set();
  (addressesStore.addresses || []).forEach((a) => {
    const name = (a.localityName || "").trim();
    if (name) set.add(name);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
});

const shortTitle = (a) => {
  const apt = a.apartment ? `-${a.apartment}` : "";
  return `${a.localityName}, ${a.street} ${a.house}${apt}`;
};

const subtitleLine = (a) => {
  const parts = [];
  if (a.localityType) parts.push(a.localityType);
  if (a.phoneHome) parts.push(`тел: ${a.phoneHome}`);

  const years = Array.isArray(a.visitYears) ? a.visitYears : [];
  if (years.length) {
    const sorted = [...years].sort((x, y) => x - y);
    parts.push(`визиты: ${sorted.join(", ")}`);
  } else {
    parts.push("визитов нет");
  }

  return parts.join(" · ");
};

const hasVisitedYear = (a, year) => {
  const years = Array.isArray(a?.visitYears) ? a.visitYears : [];
  return years.includes(Number(year));
};

const filteredAddresses = computed(() => {
  const term = normalize(search.value);
  const settlement = normalize(settlementFilter.value);

  let list = addressesStore.addresses || [];

  if (settlement) {
    list = list.filter((a) => normalize(a.localityName) === settlement);
  }

  if (mode.value === "todo") {
    list = list.filter((a) => !hasVisitedYear(a, currentYear));
  }

  if (term) {
    list = list.filter((a) => {
      const hay = normalize(
        [a.localityName, a.street, a.house, a.apartment, a.phoneHome]
          .filter(Boolean)
          .join(" ")
      );
      return hay.includes(term);
    });
  }

  return [...list].sort((a, b) => {
    const aa = normalize(`${a.localityName} ${a.street} ${a.house} ${a.apartment}`);
    const bb = normalize(`${b.localityName} ${b.street} ${b.house} ${b.apartment}`);
    return aa.localeCompare(bb, "ru");
  });
});

const visitAddress = computed(() => {
  const id = visitAddressId.value;
  if (!id) return null;
  return (addressesStore.addresses || []).find((a) => a.id === id) || null;
});

const yearChips = computed(() => {
  const a = visitAddress.value;
  const yearsExisting = Array.isArray(a?.visitYears) ? a.visitYears : [];

  const base = [];
  for (let y = currentYear; y >= currentYear - 10; y--) base.push(y);

  const set = new Set([
    ...base,
    ...yearsExisting.map((x) => Number(x)).filter(Number.isFinite),
  ]);

  return Array.from(set).sort((x, y) => y - x);
});

const isValidCustomYear = computed(() => {
  const y = Number(customYear.value);
  if (!Number.isFinite(y)) return false;
  if (y < 1900) return false;
  if (y > currentYear + 1) return false;
  return true;
});

const goToDetail = (id) => router.push({ name: "AddressDetail", params: { id } });
const goToCreate = () => router.push({ name: "AddressCreate" });

const resetFilters = () => {
  settlementFilter.value = null;
};

const closeVisitSheet = () => {
  visitSheet.value = false;
  visitAddressId.value = null;
  customYear.value = null;
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

const showUndo = ({ text, undo }) => {
  snackbar.value = { open: true, text, undo };
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

onMounted(() => {
  if (!addressesStore.addresses.length && !addressesStore.loading) {
    addressesStore.fetchAddresses();
  }
});
</script>