<template>
  <div>
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="4">
        <h1 class="text-h5 mb-0">Список адресов</h1>
        <div class="text-body-2 text-medium-emphasis">
          <span v-if="!addressesStore.loading">
            Всего: {{ filteredAddresses.length }}
          </span>
          <span v-else>
            Загрузка...
          </span>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Поиск по улице, дому, телефону"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          clearable
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model="localityFilter"
          :items="localityOptions"
          label="Тип населённого пункта"
          item-title="label"
          item-value="value"
          prepend-inner-icon="mdi-map-marker"
          variant="outlined"
          hide-details
          density="comfortable"
          clearable
        />
      </v-col>
    </v-row>

    <v-alert
      v-if="addressesStore.error"
      type="error"
      variant="outlined"
      class="mb-4"
    >
      {{ addressesStore.error }}
    </v-alert>

    <v-row v-if="addressesStore.loading">
      <v-col
        v-for="n in 3"
        :key="n"
        cols="12"
        md="6"
        lg="4"
      >
        <v-skeleton-loader type="card" class="mb-4" />
      </v-col>
    </v-row>

    <v-row v-else-if="filteredAddresses.length">
      <v-col
        v-for="addr in filteredAddresses"
        :key="addr.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          class="mb-4"
          hover
          elevation="2"
          @click="goToDetail(addr.id)"
        >
          <v-card-title class="d-flex justify-space-between align-center text-body-1">
            <span>{{ formatShortAddress(addr) }}</span>
            <v-btn
              icon="mdi-delete"
              size="small"
              color="red"
              variant="text"
              @click.stop="confirmDelete(addr)"
            />
          </v-card-title>

          <v-card-subtitle>
            <v-icon
              v-if="addr.phoneHome"
              icon="mdi-phone"
              size="small"
              class="mr-1"
            />
            <span v-if="addr.phoneHome">{{ addr.phoneHome }}</span>
            <span v-else class="text-disabled">Телефон не указан</span>
          </v-card-subtitle>

          <v-card-text>
            <div class="mb-1 text-body-2">
              <v-icon icon="mdi-home-map-marker" size="small" class="mr-1" />
              {{ addr.localityType }} {{ addr.localityName }}
            </div>

            <div class="text-body-2">
              <v-icon icon="mdi-calendar" size="small" class="mr-1" />
              Визиты:
              <span v-if="addr.visitYears?.length">
                {{ addr.visitYears.join(', ') }}
              </span>
              <span v-else class="text-disabled">нет данных</span>
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
          <v-icon icon="mdi-home-search-outline" size="48" class="mb-2" />
          <div class="text-h6 mb-1">Адреса не найдены</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Попробуйте изменить условия поиска или добавить новый адрес.
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

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6">
          Удалить адрес?
        </v-card-title>
        <v-card-text>
          <p>
            Вы действительно хотите удалить этот адрес:
          </p>
          <p v-if="addressToDelete" class="font-weight-medium">
            {{ formatShortAddress(addressToDelete) }}
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

    <v-snackbar v-model="deleteError" color="red">
  Не удалось удалить адрес. Попробуйте ещё раз.
</v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAddressesStore } from '../stores/addresses';

const router = useRouter();
const addressesStore = useAddressesStore();

const search = ref('');
const deleteError = ref(false);
const localityFilter = ref(null);

const deleteDialog = ref(false);
const addressToDelete = ref(null);
const deleting = ref(false);

const localityOptions = [
  { label: 'Город', value: 'город' },
  { label: 'Посёлок', value: 'посёлок' },
  { label: 'Деревня', value: 'деревня' },
];

const filteredAddresses = computed(() => {
  const term = search.value.trim().toLowerCase();
  return addressesStore.addresses.filter((a) => {
    if (localityFilter.value && a.localityType !== localityFilter.value) {
      return false;
    }

    if (!term) return true;

    const haystack = [
      a.localityName,
      a.street,
      a.house,
      a.apartment,
      a.phoneHome,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(term);
  });
});

const goToDetail = (id) => {
  router.push({ name: 'AddressDetail', params: { id } });
};

const goToCreate = () => {
  router.push({ name: 'AddressCreate' });
};

const formatShortAddress = (a) => {
  const apt = a.apartment ? `, кв. ${a.apartment}` : '';
  return `${a.localityType} ${a.localityName}, ${a.street}, д. ${a.house}${apt}`;
};

const confirmDelete = (addr) => {
  addressToDelete.value = addr;
  deleteDialog.value = true;
};

const performDelete = async () => {
  if (!addressToDelete.value) return;
  deleting.value = true;
  try {
    await addressesStore.deleteAddress(addressToDelete.value.id);
  } catch (e) {
    console.error('Ошибка при удалении адреса:', e);
    deleteError.value = true;
    // можно добавить v-snackbar с ошибкой
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
    addressToDelete.value = null;
  }
};

onMounted(() => {
  if (!addressesStore.addresses.length && !addressesStore.loading) {
    addressesStore.fetchAddresses();
  }
});
</script>