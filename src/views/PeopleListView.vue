<!-- src/views/PeopleListView.vue -->
<template>
  <div>
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
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

      <v-col cols="12" md="6" class="d-flex align-center justify-space-between">
        <div class="text-body-2 text-medium-emphasis">
          <span v-if="!peopleStore.loading">Всего: {{ filteredPeople.length }}</span>
          <span v-else>Загрузка...</span>
        </div>

        <v-btn
          variant="tonal"
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
      </v-col>
    </v-row>

    <v-alert v-if="peopleStore.error" type="error" variant="outlined" class="mb-4">
      {{ peopleStore.error }}
    </v-alert>

    <v-row v-if="peopleStore.loading">
      <v-col v-for="n in 3" :key="n" cols="12" md="6" lg="4">
        <v-skeleton-loader type="card" class="mb-4" />
      </v-col>
    </v-row>

    <v-row v-else-if="filteredPeople.length">
      <v-col v-for="person in filteredPeople" :key="person.id" cols="12" md="6" lg="4">
        <v-card class="mb-4" hover elevation="2" @click="goToDetail(person.id)">
          <v-card-title class="d-flex justify-space-between align-center text-body-1">
            <span>{{ formatFullName(person) }}</span>
            <v-btn
              icon="mdi-delete"
              size="small"
              color="red"
              variant="text"
              @click.stop="confirmDelete(person)"
            />
          </v-card-title>

          <v-card-subtitle class="pb-0">
            <div class="d-flex flex-wrap align-center ga-2">
              <v-chip v-if="person.isDeceased" size="x-small" color="grey" variant="tonal">
                умер(ла){{ person.deathYear ? ` · ${person.deathYear}` : "" }}
              </v-chip>

              <span v-if="person.religion" class="text-medium-emphasis">
                {{ person.religion }}
              </span>

              <span v-if="person.phone" class="text-medium-emphasis">
                <v-icon icon="mdi-phone" size="small" class="mr-1" />
                {{ person.phone }}
              </span>
            </div>
          </v-card-subtitle>

          <v-card-text>
            <div class="text-body-2 mb-1">
              <v-icon icon="mdi-home-map-marker" size="small" class="mr-1" />
              <span v-if="personAddressTitle(person)" class="text-medium-emphasis">
                {{ personAddressTitle(person) }}
              </span>
              <span v-else class="text-disabled">Адрес не указан</span>
            </div>

            <div class="text-body-2">
              <v-icon icon="mdi-briefcase" size="small" class="mr-1" />
              <span v-if="person.profession || person.workplace">
                {{ person.profession }}
                {{ person.workplace ? "(" + person.workplace + ")" : "" }}
              </span>
              <span v-else class="text-disabled">Нет данных о работе</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12">
        <v-sheet class="pa-6 text-center" color="grey-lighten-4" elevation="1" rounded="lg">
          <v-icon icon="mdi-account-search-outline" size="48" class="mb-2" />
          <div class="text-h6 mb-1">Люди не найдены</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Попробуйте изменить условия поиска или добавить нового человека.
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Bottom sheet: фильтры (как на адресах) -->
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
          <p class="text-body-2 text-medium-emphasis">Это действие нельзя будет отменить.</p>
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
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
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

// фильтры
const filters = ref({
  religion: null,
  sex: "any",
  lifeStatus: "any",
  ageGroup: "any",
  hasPhone: false,
  hasAddress: false,
});

// фильтр населённого пункта (строка)
const settlementFilter = ref(null);

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

const personAddressTitle = (p) => {
  const a = personAddress(p);
  if (!a) return "";
  const apt = a.apartment ? `-${a.apartment}` : "";
  return `${a.localityName}, ${a.street} ${a.house}${apt}`;
};

// список населённых пунктов для combobox (уникальные)
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

  const base = [...(peopleStore.people || [])];

  base.sort((a, b) => {
    const aa = `${a.lastName || ""} ${a.firstName || ""} ${a.middleName || ""}`.trim().toLowerCase();
    const bb = `${b.lastName || ""} ${b.firstName || ""} ${b.middleName || ""}`.trim().toLowerCase();
    return aa.localeCompare(bb, "ru");
  });

  return base.filter((p) => {
    // религия
    if (filters.value.religion && p.religion !== filters.value.religion) return false;

    // пол
    if (filters.value.sex !== "any" && p.sex !== filters.value.sex) return false;

    // статус
    if (filters.value.lifeStatus === "alive" && p.isDeceased) return false;
    if (filters.value.lifeStatus === "deceased" && !p.isDeceased) return false;

    // наличие телефона/адреса
    if (filters.value.hasPhone && !String(p.phone || "").trim()) return false;
    if (filters.value.hasAddress && !String(p.addressId || "").trim()) return false;

    // возрастная группа
    if (filters.value.ageGroup !== "any") {
      const age = estimateAge(p.birthDate);
      if (age == null) return false;
      if (filters.value.ageGroup === "child" && age >= 18) return false;
      if (filters.value.ageGroup === "adult" && age < 18) return false;
    }

    // населённый пункт (по адресу)
    if (settlementTerm) {
      const a = personAddress(p);
      const name = String(a?.localityName || "").trim().toLowerCase();
      if (!name) return false;
      if (!name.includes(settlementTerm)) return false;
    }

    // поиск
    if (!term) return true;

    const haystack = [
      p.lastName,
      p.firstName,
      p.middleName,
      p.phone,
      p.profession,
      p.workplace,
      p.religion,
      personAddressTitle(p),
      personAddress(p)?.localityName,
      personAddress(p)?.street,
      personAddress(p)?.house,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

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

const setAppBar = () => {
  appUi.set({
    title: "Люди",
    showBack: true,
    backTo: { name: "AddressList" }, // поменяй если нужно
    actions: [
      {
        icon: "mdi-account-plus",
        label: "Добавить",
        onClick: goToCreate, // если у AppBar нет onClick — замени на to
      },
    ],
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

watch([() => peopleStore.people.length, () => addressesStore.addresses.length], () => setAppBar());

onUnmounted(() => {
  appUi.reset();
});
</script>