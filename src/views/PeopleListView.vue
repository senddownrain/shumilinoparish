<template>
  <div>
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="4">
        <h1 class="text-h5 mb-0">Список людей</h1>
        <div class="text-body-2 text-medium-emphasis">
          <span v-if="!peopleStore.loading">
            Всего: {{ filteredPeople.length }}
          </span>
          <span v-else>Загрузка...</span>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Поиск по ФИО, телефону"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          clearable
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model="religionFilter"
          :items="religionOptions"
          label="Вероисповедание"
          item-title="label"
          item-value="value"
          prepend-inner-icon="mdi-church"
          variant="outlined"
          hide-details
          density="comfortable"
          clearable
        />
      </v-col>
    </v-row>

    <v-alert
      v-if="peopleStore.error"
      type="error"
      variant="outlined"
      class="mb-4"
    >
      {{ peopleStore.error }}
    </v-alert>

    <v-row v-if="peopleStore.loading">
      <v-col v-for="n in 3" :key="n" cols="12" md="6" lg="4">
        <v-skeleton-loader type="card" class="mb-4" />
      </v-col>
    </v-row>

    <v-row v-else-if="filteredPeople.length">
      <v-col
        v-for="person in filteredPeople"
        :key="person.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          class="mb-4"
          hover
          elevation="2"
          @click="goToDetail(person.id)"
        >
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
          <v-card-subtitle>
            <span v-if="person.religion" class="mr-2">
              {{ person.religion }}
            </span>
            <span v-if="person.phone">
              <v-icon icon="mdi-phone" size="small" class="mr-1" />
              {{ person.phone }}
            </span>
          </v-card-subtitle>
          <v-card-text>
            <div class="text-body-2">
              <v-icon icon="mdi-briefcase" size="small" class="mr-1" />
              <span v-if="person.profession || person.workplace">
                {{ person.profession }} {{ person.workplace ? '(' + person.workplace + ')' : '' }}
              </span>
              <span v-else class="text-disabled">Нет данных о работе</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12">
        <v-sheet
          class="pa-6 text-center"
          color="grey-lighten-4"
          elevation="1"
          rounded="lg"
        >
          <v-icon icon="mdi-account-search-outline" size="48" class="mb-2" />
          <div class="text-h6 mb-1">Люди не найдены</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Попробуйте изменить условия поиска или добавить нового человека.
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Плавающая кнопка добавления -->
    <v-btn
      color="primary"
      icon="mdi-plus"
      class="position-fixed"
      style="right: 24px; bottom: 24px;"
      size="large"
      @click="goToCreate"
    />

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
          <v-btn variant="text" @click="deleteDialog = false">
            Отмена
          </v-btn>
          <v-btn
            color="red"
            variant="flat"
            :loading="deleting"
            @click="performDelete"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePeopleStore } from '../stores/people';

const router = useRouter();
const peopleStore = usePeopleStore();

const search = ref('');
const religionFilter = ref(null);

const deleteDialog = ref(false);
const personToDelete = ref(null);
const deleting = ref(false);

const religionOptions = [
  { label: 'Католик', value: 'католик' },
  { label: 'Православный', value: 'православный' },
  { label: 'Старовер', value: 'старовер' },
  { label: 'Некрещенный', value: 'некрещенный' },
  { label: 'Протестант', value: 'протестант' },
];

const filteredPeople = computed(() => {
  const term = search.value.trim().toLowerCase();

  return peopleStore.people.filter((p) => {
    if (religionFilter.value && p.religion !== religionFilter.value) {
      return false;
    }

    if (!term) return true;

    const haystack = [
      p.lastName,
      p.firstName,
      p.middleName,
      p.phone,
      p.profession,
      p.workplace,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(term);
  });
});

const formatFullName = (p) => {
  return [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ');
};

const goToDetail = (id) => {
  router.push({ name: 'PeopleDetail', params: { id } });
};

const goToCreate = () => {
  router.push({ name: 'PeopleCreate' });
};

const confirmDelete = (person) => {
  personToDelete.value = person;
  deleteDialog.value = true;
};

const performDelete = async () => {
  if (!personToDelete.value) return;
  deleting.value = true;
  try {
    await peopleStore.deletePerson(personToDelete.value.id);
  } catch (e) {
    console.error('Ошибка при удалении человека:', e);
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
    personToDelete.value = null;
  }
};

onMounted(() => {
  if (!peopleStore.people.length && !peopleStore.loading) {
    peopleStore.fetchPeople();
  }
});
</script>