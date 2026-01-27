<template>
  <div v-if="address">
    <!-- Навигация и кнопка редактирования -->
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
          Редактировать адрес
        </v-btn>
      </v-col>
    </v-row>

    <!-- 1. Карточка адреса -->
    <address-card :address="address" class="mb-4" />

    <!-- 2. Муж и жена + информация о браке -->
    <v-card class="mb-4">
      <v-card-title>
        Супруги по этому адресу
      </v-card-title>
      <v-card-text>
        <div v-if="mainCouple">
          <v-row>
            <!-- Муж -->
            <v-col cols="12" md="6" v-if="mainHusband">
              <h3 class="text-subtitle-1 mb-2">
                Муж
              </h3>
              <div class="mb-1">
                <strong>ФИО:</strong>
                <v-btn
                  variant="text"
                  class="px-0"
                  @click="goToPerson(mainHusband.id)"
                >
                  {{ fullName(mainHusband) }}
                </v-btn>
              </div>
              <div class="mb-1">
                <strong>Дата рождения:</strong>
                <span v-if="mainHusband.birthDate">{{ mainHusband.birthDate }}</span>
                <span v-else class="text-disabled">не указана</span>
              </div>
              <div class="mb-1">
                <strong>Профессия:</strong>
                <span v-if="mainHusband.profession">{{ mainHusband.profession }}</span>
                <span v-else class="text-disabled">не указана</span>
              </div>
              <div class="mb-1">
                <strong>Место работы:</strong>
                <span v-if="mainHusband.workplace">{{ mainHusband.workplace }}</span>
                <span v-else class="text-disabled">не указано</span>
              </div>
              <div class="mb-1">
                <strong>Вероисповедание:</strong>
                <span v-if="mainHusband.religion">{{ mainHusband.religion }}</span>
                <span v-else class="text-disabled">не указано</span>
              </div>
              <div class="mb-1">
                <strong>Исповедь и месса:</strong>
                <span v-if="mainHusband.massAndConfession">{{ mainHusband.massAndConfession }}</span>
                <span v-else class="text-disabled">нет данных</span>
              </div>
            </v-col>

            <!-- Жена -->
            <v-col cols="12" md="6" v-if="mainWife">
              <h3 class="text-subtitle-1 mb-2">
                Жена
              </h3>
              <div class="mb-1">
                <strong>ФИО:</strong>
                <v-btn
                  variant="text"
                  class="px-0"
                  @click="goToPerson(mainWife.id)"
                >
                  {{ fullName(mainWife) }}
                </v-btn>
              </div>
              <div class="mb-1">
                <strong>Дата рождения:</strong>
                <span v-if="mainWife.birthDate">{{ mainWife.birthDate }}</span>
                <span v-else class="text-disabled">не указана</span>
              </div>
              <div class="mb-1">
                <strong>Профессия:</strong>
                <span v-if="mainWife.profession">{{ mainWife.profession }}</span>
                <span v-else class="text-disabled">не указана</span>
              </div>
              <div class="mb-1">
                <strong>Место работы:</strong>
                <span v-if="mainWife.workplace">{{ mainWife.workplace }}</span>
                <span v-else class="text-disabled">не указано</span>
              </div>
              <div class="mb-1">
                <strong>Вероисповедание:</strong>
                <span v-if="mainWife.religion">{{ mainWife.religion }}</span>
                <span v-else class="text-disabled">не указано</span>
              </div>
              <div class="mb-1">
                <strong>Исповедь и месса:</strong>
                <span v-if="mainWife.massAndConfession">{{ mainWife.massAndConfession }}</span>
                <span v-else class="text-disabled">нет данных</span>
              </div>
            </v-col>
          </v-row>

          <!-- Информация о браке супругов -->
          <v-divider class="my-3" />
          <h3 class="text-subtitle-1 mb-2">
            Брак
          </h3>
          <div v-if="mainMarriage">
            <div class="mb-1">
              <strong>Статус:</strong>
              <span>{{ mainMarriage.status }}</span>
            </div>
            <div class="mb-1">
              <strong>Год гражданского брака:</strong>
              <span v-if="mainMarriage.civilMarriageYear">{{ mainMarriage.civilMarriageYear }}</span>
              <span v-else class="text-disabled">не указан</span>
            </div>
            <div class="mb-1">
              <strong>Год венчания:</strong>
              <span v-if="mainMarriage.churchMarriageYear">{{ mainMarriage.churchMarriageYear }}</span>
              <span v-else class="text-disabled">нет данных</span>
            </div>
            <div class="mb-1">
              <strong>Венчанный брак:</strong>
              <span v-if="mainMarriage.isChurchMarried === true">да</span>
              <span v-else-if="mainMarriage.isChurchMarried === false">нет</span>
              <span v-else class="text-disabled">нет данных</span>
            </div>
            <div class="mb-1">
              <strong>Развод / вдовство:</strong>
              <span v-if="mainMarriage.status !== 'active' && mainMarriage.divorceYear">
                {{ mainMarriage.divorceYear }}
              </span>
              <span v-else-if="mainMarriage.status !== 'active'">
                статус: {{ mainMarriage.status }}
              </span>
              <span v-else class="text-disabled">нет данных</span>
            </div>
          </div>
          <div v-else class="text-disabled">
            Данных о браке супругов нет (или брак записан не в системе).
          </div>

          <!-- Предыдущие браки супругов -->
          <v-divider class="my-3" />
          <h3 class="text-subtitle-1 mb-2">
            Предыдущие браки супругов
          </h3>
          <div v-if="previousMarriages.length">
            <v-list density="compact">
              <v-list-item
                v-for="m in previousMarriages"
                :key="m.id"
              >
                <v-list-item-title>
                  <v-icon
                    :icon="m.status === 'divorced' ? 'mdi-account-cancel' : 'mdi-account-heart-broken'"
                    size="small"
                    class="mr-1"
                  />
                  <span>
                    {{ marriageSummary(m) }}
                  </span>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
          <div v-else class="text-disabled">
            Предыдущих браков у супругов не найдено.
          </div>
        </div>

        <div v-else>
          <v-alert type="info" variant="outlined">
            По этому адресу не найдено пары "муж-жена". Возможно, семья не заведена
            как брак в системе или люди ещё не добавлены.
          </v-alert>
        </div>
      </v-card-text>
    </v-card>
<!-- 3. Дети -->
<v-card class="mb-4">
  <v-card-title>
    Дети
  </v-card-title>
  <v-card-text>
    <v-row class="mb-3">
  <v-col cols="12">
    <v-btn
      color="primary"
      variant="text"
      prepend-icon="mdi-baby-face-outline"
      :disabled="!canAddChild || !mainHusband || !mainWife"
      @click="showChildDialog = true"
    >
      Добавить ребёнка
    </v-btn>
    <span
      v-if="!mainHusband || !mainWife"
      class="text-body-2 text-medium-emphasis ml-2"
    >
      Чтобы автоматически проставить родителей, нужна пара "муж-жена" по этому адресу.
    </span>
  </v-col>
</v-row>
    <!-- Desktop / tablet: таблица -->
    <div v-if="childrenOfMainCouple.length && !isMobile">
      <v-table density="comfortable">
        <thead>
          <tr>
            <th class="text-left">Имя</th>
            <th class="text-left">Дата рождения</th>
            <th class="text-left">Вероисповедание</th>
            <th class="text-left">Крещение</th>
            <th class="text-left">Миропомазание</th>
            <th class="text-left">Первое причастие</th>
            <th class="text-left">Катехезы</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="child in childrenOfMainCouple"
            :key="child.id"
            class="cursor-pointer"
            @click="goToPerson(child.id)"
          >
            <td>
              {{ childDisplayName(child) }}
            </td>
            <td>
              <span v-if="child.birthDate">{{ child.birthDate }}</span>
              <span v-else class="text-disabled">—</span>
            </td>
            <td>
              <span v-if="child.religion">{{ child.religion }}</span>
              <span v-else class="text-disabled">—</span>
            </td>
            <td>
              <span v-if="child.baptismYear">{{ child.baptismYear }}</span>
              <span v-else class="text-disabled">—</span>
            </td>
            <td>
              <span v-if="child.chrismationYear">{{ child.chrismationYear }}</span>
              <span v-else class="text-disabled">—</span>
            </td>
            <td>
              <span v-if="child.firstCommunionYear">{{ child.firstCommunionYear }}</span>
              <span v-else class="text-disabled">—</span>
            </td>
            <td>
              <span v-if="child.catechesis === true">ходит</span>
              <span v-else-if="child.catechesis === false">не ходит</span>
              <span v-else class="text-disabled">нет данных</span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- Mobile: карточки -->
    <div v-else-if="childrenOfMainCouple.length && isMobile">
      <v-list density="comfortable">
        <v-list-item
          v-for="child in childrenOfMainCouple"
          :key="child.id"
          class="cursor-pointer"
          @click="goToPerson(child.id)"
        >
          <v-list-item-title>
            <strong>{{ childDisplayName(child) }}</strong>
          </v-list-item-title>
          <v-list-item-subtitle>
            <div>
              <strong>Дата рождения:</strong>
              <span v-if="child.birthDate">{{ child.birthDate }}</span>
              <span v-else class="text-disabled">не указана</span>
            </div>
            <div>
              <strong>Вероисповедание:</strong>
              <span v-if="child.religion">{{ child.religion }}</span>
              <span v-else class="text-disabled">не указано</span>
            </div>
            <div>
              <strong>Крещение:</strong>
              <span v-if="child.baptismYear">{{ child.baptismYear }}</span>
              <span v-else class="text-disabled">нет данных</span>
            </div>
            <div>
              <strong>Миропомазание:</strong>
              <span v-if="child.chrismationYear">{{ child.chrismationYear }}</span>
              <span v-else class="text-disabled">нет данных</span>
            </div>
            <div>
              <strong>Первое причастие:</strong>
              <span v-if="child.firstCommunionYear">{{ child.firstCommunionYear }}</span>
              <span v-else class="text-disabled">нет данных</span>
            </div>
            <div>
              <strong>Катехезы:</strong>
              <span v-if="child.catechesis === true">ходит</span>
              <span v-else-if="child.catechesis === false">не ходит</span>
              <span v-else class="text-disabled">нет данных</span>
            </div>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </div>

    <div v-else class="text-disabled">
      Дети не найдены.
    </div>
  </v-card-text>
</v-card>

    <!-- 4. Другие жители -->
    <v-card class="mb-4">
      <v-card-title>
        Другие жители
      </v-card-title>
      <v-card-text>
        <div v-if="otherResidents.length">
          <v-list density="comfortable">
            <v-list-item
              v-for="p in otherResidents"
              :key="p.id"
              class="cursor-pointer"
              @click="goToPerson(p.id)"
            >
              <v-list-item-title>
                {{ fullName(p) }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <span v-if="p.religion">{{ p.religion }}</span>
                <span v-if="p.birthDate">
                  · {{ p.birthDate }}
                </span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </div>
        <div v-else class="text-disabled">
          Других жителей нет.
        </div>
      </v-card-text>
    </v-card>

    <!-- 5. Визиты -->
    <v-card class="mb-4">
      <v-card-title>
        Визиты
      </v-card-title>
      <v-card-text>
        <div class="mb-2">
          <strong>Годы визитов:</strong>
          <span v-if="visitYearsSorted.length">
            {{ visitYearsSorted.join(', ') }}
          </span>
          <span v-else class="text-disabled">
            ещё не посещали
          </span>
        </div>
        <v-btn
          color="primary"
          class="mr-2"
          @click="toggleVisitYear(true)"
        >
          Навестить ({{ currentYear }})
        </v-btn>
        <v-btn
          color="secondary"
          @click="toggleVisitYear(false)"
          :disabled="!visitYearsSet.has(currentYear)"
        >
          Убрать посещение ({{ currentYear }})
        </v-btn>
      </v-card-text>
    </v-card>

    <v-alert type="info" variant="outlined">
      На следующих шагах можно будет добавить быстрый ввод новых детей и
      супругов прямо с этой страницы.
    </v-alert>
  <child-create-dialog
  v-if="address"
  v-model="showChildDialog"
  :address="address"
  :father="mainHusband"
  :mother="mainWife"
  @created="onChildCreated"
/>
  </div>


  <div v-else>
    <v-alert type="error" variant="outlined">
      Адрес не найден.
    </v-alert>
    <v-btn class="mt-2" @click="goBack">Вернуться к списку</v-btn>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';   
import { useAddressesStore } from '../stores/addresses';
import { usePeopleStore } from '../stores/people';
import { useMarriagesStore } from '../stores/marriages';
import AddressCard from '../components/AddressCard.vue';
import ChildCreateDialog from '../components/ChildCreateDialog.vue';

const route = useRoute();
const router = useRouter();
const addressesStore = useAddressesStore();
const peopleStore = usePeopleStore();
const marriagesStore = useMarriagesStore();
const { smAndDown } = useDisplay();                // ← НОВОЕ
const isMobile = computed(() => smAndDown.value);  // ← НОВОЕ

const peopleLoading = ref(false);
const currentYear = new Date().getFullYear();

const address = computed(() => {
  const id = String(route.params.id);
  return addressesStore.getAddressById(id).value;
});

// все жители по адресу
const residents = computed(() => {
  const id = String(route.params.id);
  return peopleStore.people.filter((p) => p.addressId === id);
});

const fullName = (p) =>
  [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ');

// браки по id человека
const marriagesByPersonId = computed(() => {
  const map = new Map();
  marriagesStore.marriages.forEach((m) => {
    const arr1 = map.get(m.husbandId) || [];
    arr1.push(m);
    map.set(m.husbandId, arr1);

    const arr2 = map.get(m.wifeId) || [];
    arr2.push(m);
    map.set(m.wifeId, arr2);
  });
  return map;
});

// ищем "основную пару" супружеского брака, живущую по этому адресу
const mainCouple = computed(() => {
  // критерий: активный брак, и оба супруга живут по этому адресу
  for (const m of marriagesStore.marriages) {
    if (m.status !== 'active') continue;
    const husband = residents.value.find((p) => p.id === m.husbandId);
    const wife = residents.value.find((p) => p.id === m.wifeId);
    if (husband && wife) {
      return { marriage: m, husband, wife };
    }
  }
  // если активных нет, можно (по желанию) подобрать первый неактивный,
  // но сейчас будем показывать только активный как "основную" пару
  return null;
});

const mainMarriage = computed(() => mainCouple.value?.marriage || null);
const mainHusband = computed(() => mainCouple.value?.husband || null);
const mainWife = computed(() => mainCouple.value?.wife || null);

// предыдущие браки супругов (все неактивные браки мужа и жены)
const previousMarriages = computed(() => {
  if (!mainHusband.value && !mainWife.value) return [];
  const result = [];
  const pushIf = (arr, personId) => {
    const list = marriagesByPersonId.value.get(personId) || [];
    list.forEach((m) => {
      if (m.status === 'active') return;
      result.push(m);
    });
  };
  if (mainHusband.value) pushIf(result, mainHusband.value.id);
  if (mainWife.value) pushIf(result, mainWife.value.id);

  // чтобы не было дубликатов, если один и тот же брак попал дважды
  const uniq = new Map();
  result.forEach((m) => uniq.set(m.id, m));
  return Array.from(uniq.values());
});

// краткое описание брака
const marriageSummary = (m) => {
  const husband = peopleStore.getPersonById(m.husbandId).value;
  const wife = peopleStore.getPersonById(m.wifeId).value;
  const parts = [];

  if (husband && wife) {
    parts.push(`${fullName(husband)} — ${fullName(wife)}`);
  } else {
    parts.push(`husband=${m.husbandId}, wife=${m.wifeId}`);
  }

  if (m.civilMarriageYear) {
    parts.push(`гражд. брак: ${m.civilMarriageYear}`);
  }
  if (m.churchMarriageYear) {
    parts.push(`венчание: ${m.churchMarriageYear}`);
  }
  if (m.status !== 'active') {
    parts.push(`статус: ${m.status}${m.divorceYear ? ' (' + m.divorceYear + ')' : ''}`);
  }

  return parts.join(' · ');
};

// Дети основной пары:
// дети, у которых fatherId == husband.id и motherId == wife.id
const childrenOfMainCouple = computed(() => {
  if (!mainHusband.value || !mainWife.value) return [];
  const fatherId = mainHusband.value.id;
  const motherId = mainWife.value.id;

  return residents.value.filter(
    (p) => p.fatherId === fatherId && p.motherId === motherId
  );
});

// Имя ребёнка: выводим фамилию только если отличается от одного из родителей
const childDisplayName = (child) => {
  const parentsLastNames = new Set(
    [mainHusband.value?.lastName, mainWife.value?.lastName].filter(Boolean)
  );
  const sameLast = child.lastName && parentsLastNames.has(child.lastName);

  if (sameLast) {
    // только имя + отчество
    return [child.firstName, child.middleName].filter(Boolean).join(' ');
  }
  return fullName(child);
};

// Остальные жители (не входят в основную пару и не их дети)
const otherResidents = computed(() => {
  const excludeIds = new Set();
  if (mainHusband.value) excludeIds.add(mainHusband.value.id);
  if (mainWife.value) excludeIds.add(mainWife.value.id);
  childrenOfMainCouple.value.forEach((c) => excludeIds.add(c.id));

  return residents.value.filter((p) => !excludeIds.has(p.id));
});

// Визиты: работа с visitYears
const visitYearsSet = computed(() => {
  const years = Array.isArray(address.value?.visitYears)
    ? address.value.visitYears
    : [];
  return new Set(years);
});

const visitYearsSorted = computed(() => {
  return Array.from(visitYearsSet.value).sort((a, b) => a - b);
});

const toggleVisitYear = async (add) => {
  if (!address.value) return;
  const id = address.value.id;
  const years = new Set(
    Array.isArray(address.value.visitYears)
      ? address.value.visitYears
      : []
  );

  if (add) {
    years.add(currentYear);
  } else {
    years.delete(currentYear);
  }

  const newYears = Array.from(years).sort((a, b) => a - b);

  try {
    await addressesStore.updateAddress(id, { visitYears: newYears });
  } catch (e) {
    console.error('Ошибка при обновлении визитов:', e);
  }
};

onMounted(async () => {
  if (!addressesStore.addresses.length && !addressesStore.loading) {
    await addressesStore.fetchAddresses();
  }
  if (!peopleStore.people.length && !peopleStore.loading) {
    peopleLoading.value = true;
    await peopleStore.fetchPeople();
    peopleLoading.value = false;
  }
  if (!marriagesStore.marriages.length && !marriagesStore.loading) {
    await marriagesStore.fetchMarriages();
  }
});

const goBack = () => {
  router.push({ name: 'AddressList' });
};

const goToEdit = () => {
  router.push({
    name: 'AddressEdit',
    params: { id: route.params.id },
  });
};

const goToPerson = (personId) => {
  router.push({
    name: 'PeopleDetail',
    params: { id: personId },
  });
};

const showChildDialog = ref(false);

const canAddChild = computed(() => {
  // Можно добавлять ребёнка, если адрес загружен
  // и хотя бы один из родителей есть (лучше оба)
  return !!address.value;
});

const onChildCreated = async () => {
  // После добавления ребёнка обновим людей
  await peopleStore.fetchPeople();
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>