<template>
  <div v-if="person">
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          @click="goBack"
        >
          Назад к списку
        </v-btn>
      </v-col>
      <v-col cols="12" md="6" class="text-md-right text-start">
        <v-btn
          color="primary"
          prepend-icon="mdi-pencil"
          @click="goToEdit"
        >
          Редактировать
        </v-btn>
      </v-col>
    </v-row>

    <v-card class="mb-4">
      <v-card-title>
        {{ fullName(person) }}
      </v-card-title>
      <v-card-subtitle>
        <span v-if="person.religion">{{ person.religion }}</span>
      </v-card-subtitle>
      <v-card-text>
        <v-row>
          <!-- Основные данные -->
          <v-col cols="12" md="6">
            <div class="mb-2">
              <strong>Пол:</strong>
              <span v-if="person.sex === 'male'">мужской</span>
              <span v-else-if="person.sex === 'female'">женский</span>
              <span v-else class="text-disabled">не указан</span>
            </div>
            <div class="mb-2">
              <strong>Дата рождения:</strong>
              <span v-if="person.birthDate">{{ person.birthDate }}</span>
              <span v-else class="text-disabled">не указана</span>
            </div>
            <div class="mb-2">
              <strong>Телефон:</strong>
              <span v-if="person.phone">{{ person.phone }}</span>
              <span v-else class="text-disabled">не указан</span>
            </div>
            <div class="mb-2">
              <strong>Профессия:</strong>
              <span v-if="person.profession">{{ person.profession }}</span>
              <span v-else class="text-disabled">не указана</span>
            </div>
            <div class="mb-2">
              <strong>Место работы:</strong>
              <span v-if="person.workplace">{{ person.workplace }}</span>
              <span v-else class="text-disabled">не указано</span>
            </div>
            <div class="mb-2">
              <strong>Статус:</strong>
              <span v-if="person.isDeceased">
                умер(ла)
                <span v-if="person.deathYear">в {{ person.deathYear }} г.</span>
              </span>
              <span v-else>
                жив(а)
              </span>
            </div>
          </v-col>

          <!-- Таинства и адрес -->
          <v-col cols="12" md="6">
            <div class="mb-2">
              <strong>Крещение:</strong>
              <span v-if="person.baptismYear">{{ person.baptismYear }}</span>
              <span v-else class="text-disabled">нет данных</span>
            </div>
            <div class="mb-2">
              <strong>Миропомазание:</strong>
              <span v-if="person.chrismationYear">{{ person.chrismationYear }}</span>
              <span v-else class="text-disabled">нет данных</span>
            </div>
            <div class="mb-2">
              <strong>Первое причастие:</strong>
              <span v-if="person.firstCommunionYear">{{ person.firstCommunionYear }}</span>
              <span v-else class="text-disabled">нет данных</span>
            </div>
            <div class="mb-2">
              <strong>Катехезы:</strong>
              <span v-if="person.catechesis === true">ходит</span>
              <span v-else-if="person.catechesis === false">не ходит</span>
              <span v-else class="text-disabled">нет данных</span>
            </div>
            <div class="mb-2">
              <strong>Исповедь и месса:</strong>
              <span v-if="person.massAndConfession">{{ person.massAndConfession }}</span>
              <span v-else class="text-disabled">нет данных</span>
            </div>

            <div class="mb-2">
              <strong>Адрес проживания:</strong>
              <div v-if="personAddress">
                <span>{{ shortAddress }}</span>
                <v-btn
                  size="small"
                  variant="text"
                  prepend-icon="mdi-home-map-marker"
                  class="ml-2"
                  @click.stop="goToAddress"
                >
                  Открыть адрес
                </v-btn>
              </div>
              <div v-else class="text-disabled">
                не указан
              </div>
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <!-- Семья: родители и дети (как раньше) -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <h3 class="text-subtitle-1 mb-2">Родители</h3>
            <div class="mb-1">
              <strong>Отец:</strong>
              <span v-if="father">
                <v-btn
                  variant="text"
                  class="px-0"
                  @click="goToPerson(father.id)"
                >
                  {{ fullName(father) }}
                </v-btn>
              </span>
              <span v-else class="text-disabled">не указан</span>
            </div>
            <div>
              <strong>Мать:</strong>
              <span v-if="mother">
                <v-btn
                  variant="text"
                  class="px-0"
                  @click="goToPerson(mother.id)"
                >
                  {{ fullName(mother) }}
                </v-btn>
              </span>
              <span v-else class="text-disabled">не указана</span>
            </div>
          </v-col>

          <v-col cols="12" md="8">
            <h3 class="text-subtitle-1 mb-2">Дети</h3>
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
            <div v-else class="text-disabled">
              нет данных о детях
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <!-- Браки -->
        <v-row>
          <v-col cols="12" md="6">
            <h3 class="text-subtitle-1 mb-2">Текущий брак</h3>
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
                <span v-else class="text-disabled">
                  данные о супруге отсутствуют
                </span>
              </div>
              <div class="mb-1">
                <strong>Год гражданского брака:</strong>
                <span v-if="currentMarriage.civilMarriageYear">
                  {{ currentMarriage.civilMarriageYear }}
                </span>
                <span v-else class="text-disabled">не указан</span>
              </div>
              <div class="mb-1">
                <strong>Год венчания:</strong>
                <span v-if="currentMarriage.churchMarriageYear">
                  {{ currentMarriage.churchMarriageYear }}
                </span>
                <span v-else class="text-disabled">нет данных</span>
              </div>
              <div class="mb-1">
                <strong>Венчанный брак:</strong>
                <span v-if="currentMarriage.isChurchMarried === true">
                  да
                </span>
                <span v-else-if="currentMarriage.isChurchMarried === false">
                  нет
                </span>
                <span v-else class="text-disabled">
                  нет данных
                </span>
              </div>
            </div>
            <div v-else class="text-disabled">
              нет активного брака
            </div>
            <div class="mt-2" v-if="currentMarriage">
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
          </v-col>

          <v-col cols="12" md="6">
            <h3 class="text-subtitle-1 mb-2">Прошлые браки</h3>
            <div v-if="pastMarriages.length">
              <v-list density="compact">
                <v-list-item
                  v-for="m in pastMarriages"
                  :key="m.id"
                >
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
                    <span v-else class="text-disabled">
                      супруг(а) неизвестен
                    </span>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <span>Статус: {{ m.status }}</span>
                    <span v-if="m.civilMarriageYear">
                      · гражданский брак: {{ m.civilMarriageYear }}
                    </span>
                    <span v-if="m.churchMarriageYear">
                      · венчание: {{ m.churchMarriageYear }}
                    </span>
                    <span v-if="m.divorceYear">
                      · развод: {{ m.divorceYear }}
                    </span>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
            <div v-else class="text-disabled">
              прошлых браков нет
            </div>
          </v-col>
        </v-row>
<v-row class="mt-4">
  <v-col cols="12">
    <v-btn
      color="primary"
      variant="text"
      prepend-icon="mdi-heart-plus"
      :disabled="!canCreateMarriage"
      @click="showMarriageDialog = true"
    >
      Новый брак
    </v-btn>
    <span v-if="!canCreateMarriage" class="text-body-2 text-medium-emphasis ml-2">
      Новый брак можно создать только для живых людей без активного брака.
    </span>
  </v-col>
</v-row>

<marriage-create-dialog
  v-if="person"
  v-model="showMarriageDialog"
  :person="person"
  @created="onMarriageCreated"
/>

<marriage-end-dialog
  v-if="person && currentMarriage"
  v-model="showEndMarriageDialog"
  :marriage="currentMarriage"
  :mode="endMode"
  @updated="onMarriageUpdated"
/>
      </v-card-text>
    </v-card>

    <v-alert type="info" variant="outlined">
      Данные о браках берутся из коллекции "marriages".
      В следующих шагах можно будет добавить интерфейс для создания и редактирования браков
      с учётом пола и статуса (активный, разведён, вдовец/вдова).
    </v-alert>
  </div>

  <div v-else>
    <v-alert type="error" variant="outlined">
      Человек не найден.
    </v-alert>
    <v-btn class="mt-2" @click="goBack">Вернуться к списку</v-btn>
  </div>
</template>

<script setup>
import {  ref,computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePeopleStore } from '../stores/people';
import { useAddressesStore } from '../stores/addresses';
import { useMarriagesStore } from '../stores/marriages';
import MarriageCreateDialog from '../components/MarriageCreateDialog.vue';
import MarriageEndDialog from '../components/MarriageEndDialog.vue';

const route = useRoute();
const router = useRouter();
const peopleStore = usePeopleStore();
const addressesStore = useAddressesStore();
const marriagesStore = useMarriagesStore();

const person = computed(() => {
  const id = String(route.params.id);
  return peopleStore.getPersonById(id).value;
});

const fullName = (p) => {
  if (!p) return '';
  return [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ');
};

// адрес проживания
const personAddress = computed(() => {
  if (!person.value || !person.value.addressId) return null;
  return addressesStore.getAddressById(person.value.addressId).value;
});

const shortAddress = computed(() => {
  const a = personAddress.value;
  if (!a) return '';
  const apt = a.apartment ? `, кв. ${a.apartment}` : '';
  return `${a.localityType} ${a.localityName}, ${a.street}, д. ${a.house}${apt}`;
});

// родители
const father = computed(() => {
  if (!person.value?.fatherId) return null;
  return peopleStore.getPersonById(person.value.fatherId).value;
});

const mother = computed(() => {
  if (!person.value?.motherId) return null;
  return peopleStore.getPersonById(person.value.motherId).value;
});

// дети
const children = computed(() => {
  if (!person.value) return [];
  const id = person.value.id;
  return peopleStore.people.filter(
    (p) => p.fatherId === id || p.motherId === id
  );
});

// браки текущего человека
const personMarriages = computed(() => {
  if (!person.value || !person.value.marriageIds?.length)
    return [];
  const ids = new Set(person.value.marriageIds);
  return marriagesStore.marriages.filter((m) => ids.has(m.id));
});

// текущий активный брак
const currentMarriage = computed(() =>
  personMarriages.value.find((m) => m.status === 'active') || null
);

// супруг в текущем браке
const currentSpouse = computed(() => {
  if (!person.value || !currentMarriage.value) return null;
  const m = currentMarriage.value;
  const myId = person.value.id;
  const spouseId =
    myId === m.husbandId ? m.wifeId :
    myId === m.wifeId ? m.husbandId :
    null;
  if (!spouseId) return null;
  return peopleStore.getPersonById(spouseId).value;
});

// прошлые браки
const pastMarriages = computed(() =>
  personMarriages.value.filter(
    (m) => m.status === 'divorced' || m.status === 'widowed'
  )
);

// супруг для конкретного "прошлого" брака
const pastMarriageSpouse = (m) => {
  if (!person.value) return null;
  const myId = person.value.id;
  const spouseId =
    myId === m.husbandId ? m.wifeId :
    myId === m.wifeId ? m.husbandId :
    null;
  if (!spouseId) return null;
  return peopleStore.getPersonById(spouseId).value;
};

onMounted(async () => {
  if (!peopleStore.people.length && !peopleStore.loading) {
    await peopleStore.fetchPeople();
  }
  if (!addressesStore.addresses.length && !addressesStore.loading) {
    await addressesStore.fetchAddresses();
  }
  if (!marriagesStore.marriages.length && !marriagesStore.loading) {
    await marriagesStore.fetchMarriages();
  }
});

const goBack = () => {
  router.push({ name: 'PeopleList' });
};

const goToEdit = () => {
  router.push({
    name: 'PeopleEdit',
    params: { id: route.params.id },
  });
};

const goToAddress = () => {
  if (!person.value?.addressId) return;
  router.push({
    name: 'AddressDetail',
    params: { id: person.value.addressId },
  });
};

const goToPerson = (id) => {
  router.push({ name: 'PeopleDetail', params: { id } });
};
const showMarriageDialog = ref(false);
const showEndMarriageDialog = ref(false);
const endMode = ref('divorce'); // 'divorce' | 'widow'

// есть ли активный брак
const hasActiveMarriage = computed(() => !!currentMarriage.value);

// можно ли создать новый брак для этого человека
const canCreateMarriage = computed(() => {
  if (!person.value) return false;
  if (person.value.isDeceased) return false;
  if (hasActiveMarriage.value) return false;
  if (person.value.sex !== 'male' && person.value.sex !== 'female') return false;
  return true;
});

const canEndMarriage = computed(() => {
  if (!person.value) return false;
  if (!currentMarriage.value) return false;
  // для развода желательно, чтобы человек был жив
  return !person.value.isDeceased;
});

const onMarriageCreated = async () => {
  await marriagesStore.fetchMarriages();
  await peopleStore.fetchPeople();
};

const onMarriageUpdated = async () => {
  await marriagesStore.fetchMarriages();
  // peopleStore можно не рефрешить, marriageIds не меняются
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.link-like {
  text-decoration: underline;
  cursor: pointer;
}
</style>