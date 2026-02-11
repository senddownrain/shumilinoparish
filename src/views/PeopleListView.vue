<!-- src/views/PeopleListView.vue -->
<template>
  <div>
    <v-row class="mb-4" align="center">
      

      <v-col cols="12" class="align-center">
        
     <div class="d-flex align-center justify-space-between">
            <div>
            <div class="text-h6">Люди</div>
            <div class="text-body-2 text-medium-emphasis">
              <span v-if="!peopleStore.loading">
                Всего: {{ filteredPeople.length }}
              </span>
              <span v-else>Загрузка…</span>
            </div>
          </div>

        <v-btn
            variant="text"
            prepend-icon="mdi-filter-variant"
            @click="filtersSheet = true"
          >
          
            Фильтры
            <v-badge
            v-if="activeFiltersCount"
            :content="activeFiltersCount"
            color="primary"
            class="ml-2"
            inline
          />
          </v-btn>
</div>
      </v-col>

      <v-col cols="12" >
        <v-text-field
          v-model="search"
          label="Поиск по ФИО, телефону, работе, адресу"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          clearable
          density="comfortable"
        />
      </v-col>
    </v-row>

    <v-alert v-if="peopleStore.error" type="error" variant="outlined" class="mb-4">
      {{ peopleStore.error }}
    </v-alert>

    <v-row v-if="peopleStore.loading">
      <v-col v-for="n in 3" :key="n" cols="12">
        <v-skeleton-loader type="list-item-two-line" class="mb-2" />
      </v-col>
    </v-row>

    <!-- ТОНКИЙ СПИСОК -->
    <v-card v-else rounded="lg" border>
      <v-list v-if="filteredPeople.length" density="compact">
        <v-list-item
          v-for="p in filteredPeople"
          :key="p.id"
          @click="goToDetail(p.id)"
          class="cursor-pointer"
        >
          <v-list-item-title class="text-body-2">
            {{ formatFullName(p) }}
          </v-list-item-title>

          <template #append>
            <v-btn
              icon="mdi-delete"
              size="small"
              color="red"
              variant="text"
              @click.stop="confirmDelete(p)"
            />
          </template>
        </v-list-item>
      </v-list>

      <v-card-text v-else class="text-center text-medium-emphasis">
        Люди не найдены
      </v-card-text>
    </v-card>

    <!-- FAB добавления (как на адресах) -->
    <v-btn
      color="primary"
      icon="mdi-plus"
      class="position-fixed"
      style="right: 20px; bottom: 84px;"
      size="large"
      @click="goToCreate"
    />

    <!-- Bottom sheet: фильтры -->
    <v-bottom-sheet v-model="filtersSheet">
      <v-card>
        <v-card-title class="text-h6">Фильтры</v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="filters.religion"
                :items="religionOptions"
                label="Вероисповедание"
                item-title="label"
                item-value="value"
                prepend-inner-icon="mdi-church"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12">
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
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="filters.sex"
                :items="sexOptions"
                label="Пол"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="filters.lifeStatus"
                :items="lifeStatusOptions"
                label="Статус"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="filters.ageGroup"
                :items="ageGroupOptions"
                label="Возраст"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-switch v-model="filters.hasPhone" label="Только с телефоном" inset />
              <v-switch v-model="filters.hasAddress" label="Только с адресом" inset />
            </v-col>
          </v-row>
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

    <!-- Диалог удаления -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6">Удалить человека?</v-card-title>
        <v-card-text>
          <p>Вы действительно хотите удалить:</p>
          <p v-if="personToDelete" class="font-weight-medium">
            {{ formatFullName(personToDelete) }}
          </p>
          <p class="text-body-2 text-medium-emphasis">
            Это действие нельзя будет отменить.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Отмена</v-btn>
          <v-btn color="red" variant="flat" :loading="deleting" @click="performDelete">
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

import { usePeopleStore } from "../stores/people";
import { useAddressesStore } from "../stores/addresses";
import { useAppUiStore } from "../stores/appUi";

const router = useRouter();

const peopleStore = usePeopleStore();
const addressesStore = useAddressesStore();
const appUi = useAppUiStore();

const search = ref("");

const filtersSheet = ref(false);
const settlementFilter = ref(null);

const filters = ref({
  religion: null,
  sex: "any",
  lifeStatus: "any",
  ageGroup: "any",
  hasPhone: false,
  hasAddress: false,
});

const religionOptions = [
  { label: "Католик", value: "католик" },
  { label: "Православный", value: "православный" },
  { label: "Старовер", value: "старовер" },
  { label: "Некрещенный", value: "некрещенный" },
  { label: "Протестант", value: "протестант" },
];

const sexOptions = [
  { title: "Любой", value: "any" },
  { title: "Мужской", value: "male" },
  { title: "Женский", value: "female" },
];

const lifeStatusOptions = [
  { title: "Любой", value: "any" },
  { title: "Жив(а)", value: "alive" },
  { title: "Умер(ла)", value: "deceased" },
];

const ageGroupOptions = [
  { title: "Любой", value: "any" },
  { title: "Дети (< 18)", value: "child" },
  { title: "Взрослые (≥ 18)", value: "adult" },
];

const deleteDialog = ref(false);
const personToDelete = ref(null);
const deleting = ref(false);

const formatFullName = (p) =>
  [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ").trim();

const goToDetail = (id) => router.push({ name: "PeopleDetail", params: { id } });
const goToCreate = () => router.push({ name: "PeopleCreate" });

const confirmDelete = (person) => {
  personToDelete.value = person;
  deleteDialog.value = true;
};

const performDelete = async () => {
  if (!personToDelete.value) return;
  deleting.value = true;
  try {
    await peopleStore.deletePerson(personToDelete.value.id);
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
    personToDelete.value = null;
  }
};

// address map
const addressById = computed(() => {
  const map = new Map();
  (addressesStore.addresses || []).forEach((a) => map.set(a.id, a));
  return map;
});

const personAddress = (p) => {
  const id = p?.addressId;
  return id ? addressById.value.get(id) || null : null;
};

const settlementOptions = computed(() => {
  const set = new Set();
  (addressesStore.addresses || []).forEach((a) => {
    const name = String(a.localityName || "").trim();
    if (name) set.add(name);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
});

const birthYear = (value) => {
  const s = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return Number(s.slice(0, 4));
  const y = Number(s);
  return Number.isFinite(y) ? y : null;
};

const estimateAge = (birthDateStr) => {
  const y = birthYear(birthDateStr);
  if (!y) return null;
  return new Date().getFullYear() - y;
};

const filteredPeople = computed(() => {
  const term = search.value.trim().toLowerCase();
  const settlementTerm = String(settlementFilter.value || "").trim().toLowerCase();

  const base = [...(peopleStore.people || [])].sort((a, b) => {
    const aa = `${a.lastName || ""} ${a.firstName || ""} ${a.middleName || ""}`.trim().toLowerCase();
    const bb = `${b.lastName || ""} ${b.firstName || ""} ${b.middleName || ""}`.trim().toLowerCase();
    return aa.localeCompare(bb, "ru");
  });

  return base.filter((p) => {
    if (filters.value.religion && p.religion !== filters.value.religion) return false;
    if (filters.value.sex !== "any" && p.sex !== filters.value.sex) return false;

    if (filters.value.lifeStatus === "alive" && p.isDeceased) return false;
    if (filters.value.lifeStatus === "deceased" && !p.isDeceased) return false;

    if (filters.value.hasPhone && !String(p.phone || "").trim()) return false;
    if (filters.value.hasAddress && !String(p.addressId || "").trim()) return false;

    if (filters.value.ageGroup !== "any") {
      const age = estimateAge(p.birthDate);
      if (age == null) return false;
      if (filters.value.ageGroup === "child" && age >= 18) return false;
      if (filters.value.ageGroup === "adult" && age < 18) return false;
    }

    if (settlementTerm) {
      const a = personAddress(p);
      const name = String(a?.localityName || "").trim().toLowerCase();
      if (!name || !name.includes(settlementTerm)) return false;
    }

    if (!term) return true;

    const a = personAddress(p);
    const haystack = [
      p.lastName, p.firstName, p.middleName,
      p.phone, p.profession, p.workplace, p.religion,
      a?.localityName, a?.street, a?.house,
    ].filter(Boolean).join(" ").toLowerCase();

    return haystack.includes(term);
  });
});

const activeFiltersCount = computed(() => {
  let n = 0;
  if (filters.value.religion) n++;
  if (filters.value.sex !== "any") n++;
  if (filters.value.lifeStatus !== "any") n++;
  if (filters.value.ageGroup !== "any") n++;
  if (filters.value.hasPhone) n++;
  if (filters.value.hasAddress) n++;
  if (String(settlementFilter.value || "").trim()) n++;
  return n;
});

const resetFilters = () => {
  filters.value = {
    religion: null,
    sex: "any",
    lifeStatus: "any",
    ageGroup: "any",
    hasPhone: false,
    hasAddress: false,
  };
  settlementFilter.value = null;
};

// AppBar: без назад и без кнопки добавить
const setAppBar = () => {
  appUi.set({
    title: "Люди",
    showBack: false,
    actions: [],
  });
};

onMounted(async () => {
  setAppBar();

  if (!peopleStore.people.length && !peopleStore.loading) {
    await peopleStore.fetchPeople();
  }
  if (!addressesStore.addresses.length && !addressesStore.loading) {
    await addressesStore.fetchAddresses();
  }
});

onUnmounted(() => appUi.reset());
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>