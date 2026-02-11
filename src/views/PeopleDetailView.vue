<!-- src/views/PeopleDetailView.vue -->
<template>
  <div v-if="person">
    <PersonInfoCard
      :person="person"
      mode="detail"
      :address-title="shortAddress"
      @open="goToEdit"
    >
      <template #address-actions>
        <v-btn
          v-if="personAddress"
          size="small"
          variant="text"
          prepend-icon="mdi-home-map-marker"
          @click.stop="goToAddress"
        >
          Открыть
        </v-btn>
      </template>
    </PersonInfoCard>

    <v-row>
      <!-- Семья -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" border>
          <v-card-title class="text-subtitle-1">Семья</v-card-title>
          <v-card-text>
            <div class="text-subtitle-2 mb-2">Родители</div>

            <div class="mb-1">
              <strong>Отец:</strong>
              <span v-if="father">
                <v-btn variant="text" class="px-0" @click="goToPerson(father.id)">
                  {{ fullName(father) }}
                </v-btn>
              </span>
              <span v-else class="text-disabled">не указан</span>
            </div>

            <div class="mb-3">
              <strong>Мать:</strong>
              <span v-if="mother">
                <v-btn variant="text" class="px-0" @click="goToPerson(mother.id)">
                  {{ fullName(mother) }}
                </v-btn>
              </span>
              <span v-else class="text-disabled">не указана</span>
            </div>

            <v-divider class="my-3" />

            <div class="d-flex align-center justify-space-between">
              <div class="text-subtitle-2">
                Дети
                <span class="text-body-2 text-medium-emphasis ml-2">({{ children.length }})</span>
              </div>
            </div>

            <div v-if="children.length">
              <v-list density="compact">
                <v-list-item
                  v-for="child in children"
                  :key="child.id"
                  @click="goToPerson(child.id)"
                  class="cursor-pointer"
                >
                  <v-list-item-title>
                    <v-icon icon="mdi-baby-face-outline" size="small" class="mr-1" />
                    {{ fullName(child) }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </div>

            <div v-else class="text-disabled">нет данных о детях</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Браки -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" border>
          <v-card-title class="text-subtitle-1">Браки</v-card-title>
          <v-card-text>
            <div class="text-subtitle-2 mb-2">Текущий брак</div>

            <div v-if="currentMarriage">
              <div class="mb-1">
                <strong>Супруг(а):</strong>
                <span v-if="currentSpouse">
                  <v-btn
                    variant="text"
                    class="px-0"
                    prepend-icon="mdi-heart"
                    @click="goToPerson(currentSpouse.id)"
                  >
                    {{ fullName(currentSpouse) }}
                  </v-btn>
                </span>
                <span v-else class="text-disabled">данные о супруге отсутствуют</span>
              </div>

              <div class="mb-1">
                <strong>Гражд. брак:</strong>
                <span v-if="currentMarriage.civilMarriageYear">{{ currentMarriage.civilMarriageYear }}</span>
                <span v-else class="text-disabled">не указан</span>
              </div>

              <div class="mb-1">
                <strong>Венчание:</strong>
                <span v-if="currentMarriage.churchMarriageYear">{{ currentMarriage.churchMarriageYear }}</span>
                <span v-else class="text-disabled">нет данных</span>
              </div>

              <div class="mb-1">
                <strong>Венчанный брак:</strong>
                <span v-if="currentMarriage.isChurchMarried === true">да</span>
                <span v-else-if="currentMarriage.isChurchMarried === false">нет</span>
                <span v-else class="text-disabled">нет данных</span>
              </div>

              <div class="mt-2">
                <v-btn
                  color="red"
                  variant="text"
                  size="small"
                  prepend-icon="mdi-account-cancel"
                  :disabled="!canEndMarriage"
                  @click="() => { endMode = 'divorce'; showEndMarriageDialog = true; }"
                >
                  Развод
                </v-btn>

                <v-btn
                  color="orange"
                  variant="text"
                  size="small"
                  prepend-icon="mdi-account-heart-broken"
                  :disabled="!canEndMarriage"
                  @click="() => { endMode = 'widow'; showEndMarriageDialog = true; }"
                >
                  Вдовство
                </v-btn>
              </div>
            </div>

            <div v-else class="text-disabled">нет активного брака</div>

            <v-divider class="my-3" />

            <div class="text-subtitle-2 mb-2">Прошлые браки</div>

            <div v-if="pastMarriages.length">
              <v-list density="compact">
                <v-list-item v-for="m in pastMarriages" :key="m.id">
                  <v-list-item-title>
                    <v-icon
                      :icon="m.status === 'divorced' ? 'mdi-account-cancel' : 'mdi-account-heart-outline'"
                      size="small"
                      class="mr-1"
                    />
                    <span v-if="pastMarriageSpouse(m)">
                      <span @click="goToPerson(pastMarriageSpouse(m).id)" class="link-like">
                        {{ fullName(pastMarriageSpouse(m)) }}
                      </span>
                    </span>
                    <span v-else class="text-disabled">супруг(а) неизвестен</span>
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <span>Статус: {{ m.status }}</span>
                    <span v-if="m.civilMarriageYear"> · гражданский: {{ m.civilMarriageYear }}</span>
                    <span v-if="m.churchMarriageYear"> · венчание: {{ m.churchMarriageYear }}</span>
                    <span v-if="m.divorceYear"> · год: {{ m.divorceYear }}</span>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
            <div v-else class="text-disabled">прошлых браков нет</div>

            <v-divider class="my-3" />

            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-heart-plus"
              :disabled="!canCreateMarriage"
              @click="showMarriageDialog = true"
            >
              Новый брак
            </v-btn>

            <div v-if="!canCreateMarriage" class="text-caption text-medium-emphasis mt-2">
              Новый брак можно создать только для живых людей без активного брака.
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <MarriageCreateDialog
      v-if="person"
      v-model="showMarriageDialog"
      :person="person"
      @created="onMarriageCreated"
    />

    <MarriageEndDialog
      v-if="person && currentMarriage"
      v-model="showEndMarriageDialog"
      :marriage="currentMarriage"
      :mode="endMode"
      @updated="onMarriageUpdated"
    />
  </div>

  <div v-else>
    <v-alert type="error" variant="outlined">Человек не найден.</v-alert>
    <v-btn class="mt-2" @click="goBack">Вернуться к списку</v-btn>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { usePeopleStore } from "../stores/people";
import { useAddressesStore } from "../stores/addresses";
import { useMarriagesStore } from "../stores/marriages";
import { useAppUiStore } from "../stores/appUi";

import PersonInfoCard from "../components/PersonInfoCard.vue";
import MarriageCreateDialog from "../components/MarriageCreateDialog.vue";
import MarriageEndDialog from "../components/MarriageEndDialog.vue";

const route = useRoute();
const router = useRouter();

const peopleStore = usePeopleStore();
const addressesStore = useAddressesStore();
const marriagesStore = useMarriagesStore();
const appUi = useAppUiStore();

const person = computed(() => {
  const id = String(route.params.id);
  return peopleStore.getPersonById(id).value;
});

const fullName = (p) => [p?.lastName, p?.firstName, p?.middleName].filter(Boolean).join(" ");

const personAddress = computed(() => {
  if (!person.value?.addressId) return null;
  return addressesStore.getAddressById(person.value.addressId).value;
});

const shortAddress = computed(() => {
  const a = personAddress.value;
  if (!a) return "";
  const apt = a.apartment ? `, кв. ${a.apartment}` : "";
  return `${a.localityType} ${a.localityName}, ${a.street}, д. ${a.house}${apt}`;
});

const father = computed(() => (person.value?.fatherId ? peopleStore.getPersonById(person.value.fatherId).value : null));
const mother = computed(() => (person.value?.motherId ? peopleStore.getPersonById(person.value.motherId).value : null));

const children = computed(() => {
  if (!person.value) return [];
  const id = person.value.id;
  return peopleStore.people.filter((p) => p.fatherId === id || p.motherId === id);
});

// marriages
const personMarriages = computed(() => {
  if (!person.value?.marriageIds?.length) return [];
  const ids = new Set(person.value.marriageIds);
  return marriagesStore.marriages.filter((m) => ids.has(m.id));
});

const currentMarriage = computed(() => personMarriages.value.find((m) => m.status === "active") || null);

const currentSpouse = computed(() => {
  if (!person.value || !currentMarriage.value) return null;
  const m = currentMarriage.value;
  const myId = person.value.id;
  const spouseId =
    myId === m.husbandId ? m.wifeId :
    myId === m.wifeId ? m.husbandId :
    null;

  return spouseId ? peopleStore.getPersonById(spouseId).value : null;
});

const pastMarriages = computed(() =>
  personMarriages.value.filter((m) => m.status === "divorced" || m.status === "widowed")
);

const pastMarriageSpouse = (m) => {
  if (!person.value) return null;
  const myId = person.value.id;
  const spouseId =
    myId === m.husbandId ? m.wifeId :
    myId === m.wifeId ? m.husbandId :
    null;

  return spouseId ? peopleStore.getPersonById(spouseId).value : null;
};

onMounted(async () => {
  if (!peopleStore.people.length && !peopleStore.loading) await peopleStore.fetchPeople();
  if (!addressesStore.addresses.length && !addressesStore.loading) await addressesStore.fetchAddresses();
  if (!marriagesStore.marriages.length && !marriagesStore.loading) await marriagesStore.fetchMarriages();
});

const goBack = () => router.push({ name: "PeopleList" });
const goToEdit = () => router.push({ name: "PeopleEdit", params: { id: route.params.id } });
const goToAddress = () => router.push({ name: "AddressDetail", params: { id: person.value.addressId } });
const goToPerson = (id) => router.push({ name: "PeopleDetail", params: { id } });

// dialogs
const showMarriageDialog = ref(false);
const showEndMarriageDialog = ref(false);
const endMode = ref("divorce"); // 'divorce' | 'widow'

const hasActiveMarriage = computed(() => !!currentMarriage.value);

const canCreateMarriage = computed(() => {
  if (!person.value) return false;
  if (person.value.isDeceased) return false;
  if (hasActiveMarriage.value) return false;
  if (person.value.sex !== "male" && person.value.sex !== "female") return false;
  return true;
});

const canEndMarriage = computed(() => {
  if (!person.value || !currentMarriage.value) return false;
  return !person.value.isDeceased;
});

const onMarriageCreated = async () => {
  await marriagesStore.fetchMarriages();
  await peopleStore.fetchPeople();
};

const onMarriageUpdated = async () => {
  await marriagesStore.fetchMarriages();
};

const setAppBar = () => {
  const id = String(route.params.id);
  appUi.set({
    title: person.value ? fullName(person.value) : "Человек",
    showBack: true,
    backTo: { name: "PeopleList" },
    actions: [
      {
        icon: "mdi-pencil",
        label: "Редактировать",
        to: { name: "PeopleEdit", params: { id } },   // <-- ВАЖНО: через to
        disabled: !person.value,
      },
    ],
  });
};
// ВАЖНО: immediate, чтобы кнопки появились сразу
watch([person, () => route.params.id], () => setAppBar(), { immediate: true });

onUnmounted(() => {
  appUi.reset();
});
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.link-like { text-decoration: underline; cursor: pointer; }
</style>