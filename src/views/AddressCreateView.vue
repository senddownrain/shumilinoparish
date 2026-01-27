<template>
  <div>
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
    </v-row>

    <v-card>
      <v-card-title>
        Новый адрес
      </v-card-title>
      <v-card-text>
        <v-alert
          v-if="error"
          type="error"
          variant="outlined"
          class="mb-3"
        >
          {{ error }}
        </v-alert>

        <!-- Форма адреса -->
        <v-form ref="formRef" v-model="isValid">
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="form.localityType"
                :items="localityTypeOptions"
                label="Тип населённого пункта"
                :rules="[required]"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.localityName"
                label="Название населённого пункта"
                :rules="[required]"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.street"
                label="Улица"
                :rules="[required]"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.house"
                label="Дом"
                :rules="[required]"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.apartment"
                label="Квартира"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.phoneHome"
                label="Домашний телефон"
                prepend-inner-icon="mdi-phone"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-form>

        <v-divider class="my-4" />

        <!-- Блок добавления супругов -->
        <v-switch
          v-model="withSpouses"
          label="Сразу добавить супругов (муж и жена)"
          inset
          class="mb-2"
        />

        <v-expand-transition>
          <div v-if="withSpouses">
            <v-alert type="info" variant="outlined" class="mb-3">
              При сохранении будут созданы:
              <ul class="pl-6">
                <li>муж и жена, привязанные к этому адресу;</li>
                <li>брак между ними в коллекции "marriages".</li>
              </ul>
            </v-alert>

            <v-row>
              <!-- Муж -->
              <v-col cols="12" md="6">
                <h3 class="text-subtitle-1 mb-2">Муж</h3>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="husband.lastName"
                      label="Фамилия"
                      :rules="[requiredIfSpouses]"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="husband.firstName"
                      label="Имя"
                      :rules="[requiredIfSpouses]"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="husband.middleName"
                      label="Отчество"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="husband.birthDate"
                      label="Дата рождения"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-select
                      v-model="husband.religion"
                      :items="religionOptions"
                      label="Вероисповедание"
                      item-title="label"
                      item-value="value"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="husband.massAndConfession"
                      :items="massConfessionOptions"
                      label="Исповедь и месса"
                      item-title="label"
                      item-value="value"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <!-- Жена -->
              <v-col cols="12" md="6">
                <h3 class="text-subtitle-1 mb-2">Жена</h3>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="wife.lastName"
                      label="Фамилия"
                      :rules="[requiredIfSpouses]"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="wife.firstName"
                      label="Имя"
                      :rules="[requiredIfSpouses]"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="wife.middleName"
                      label="Отчество"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="wife.birthDate"
                      label="Дата рождения"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-select
                      v-model="wife.religion"
                      :items="religionOptions"
                      label="Вероисповедание"
                      item-title="label"
                      item-value="value"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="wife.massAndConfession"
                      :items="massConfessionOptions"
                      label="Исповедь и месса"
                      item-title="label"
                      item-value="value"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- Минимальные данные брака -->
            <v-divider class="my-3" />
            <h3 class="text-subtitle-1 mb-2">Брак</h3>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="marriage.civilMarriageYear"
                  label="Год гражданского брака"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="marriage.churchMarriageYear"
                  label="Год венчания"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="4" class="d-flex align-center">
                <v-switch
                  v-model="marriage.isChurchMarried"
                  label="Венчанный брак"
                  inset
                />
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="goBack">
          Отмена
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="saving"
          :disabled="saving"
          @click="save"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAddressesStore } from '../stores/addresses';
import { usePeopleStore } from '../stores/people';
import { useMarriagesStore } from '../stores/marriages';

const router = useRouter();
const addressesStore = useAddressesStore();
const peopleStore = usePeopleStore();
const marriagesStore = useMarriagesStore();

const formRef = ref(null);
const isValid = ref(false);
const saving = ref(false);
const error = ref('');

const withSpouses = ref(false);

const form = reactive({
  localityType: 'посёлок',
  localityName: '',
  street: '',
  house: '',
  apartment: '',
  phoneHome: '',
});

const husband = reactive({
  lastName: '',
  firstName: '',
  middleName: '',
  birthDate: '',
  religion: '',
  massAndConfession: '',
});

const wife = reactive({
  lastName: '',
  firstName: '',
  middleName: '',
  birthDate: '',
  religion: '',
  massAndConfession: '',
});

const marriage = reactive({
  civilMarriageYear: null,
  churchMarriageYear: null,
  isChurchMarried: false,
});

const localityTypeOptions = ['посёлок', 'город', 'деревня'];

const religionOptions = [
  { label: 'Католик', value: 'католик' },
  { label: 'Православный', value: 'православный' },
  { label: 'Старовер', value: 'старовер' },
  { label: 'Некрещенный', value: 'некрещенный' },
  { label: 'Протестант', value: 'протестант' },
];

const massConfessionOptions = [
  { label: 'Часто', value: 'часто' },
  { label: 'Регулярно', value: 'регулярно' },
  { label: 'Редко', value: 'редко' },
  { label: 'Раз в год', value: 'раз в год' },
  { label: 'Давно', value: 'давно' },
];

const required = (v) => !!v || 'Обязательное поле';
const requiredIfSpouses = (v) =>
  !withSpouses.value || !!v || 'Обязательное поле';

const goBack = () => {
  router.push({ name: 'AddressList' });
};

const save = async () => {
  error.value = '';

  if (!formRef.value) return;
  const res = await formRef.value.validate();
  const valid = res.valid ?? res;
  if (!valid) return;

  // Если надо создать супругов — минимальная проверка, что есть имена
  if (withSpouses.value) {
    if (!husband.firstName || !husband.lastName || !wife.firstName || !wife.lastName) {
      error.value = 'Для супругов нужно указать как минимум фамилию и имя.';
      return;
    }
  }

  saving.value = true;

  try {
    // 1. Создаём адрес
    const addressPayload = {
      localityType: form.localityType,
      localityName: form.localityName,
      street: form.street,
      house: form.house,
      apartment: form.apartment,
      phoneHome: form.phoneHome,
      visitYears: [],
    };

    const addressId = await addressesStore.addAddress(addressPayload);

    // 2. Если не нужно создавать супругов — просто переходим к адресу
    if (!withSpouses.value) {
      router.push({ name: 'AddressDetail', params: { id: addressId } });
      return;
    }

    // 3. Создаём мужа и жену
    const husbandPayload = {
      firstName: husband.firstName,
      lastName: husband.lastName,
      middleName: husband.middleName,
      sex: 'male',
      birthDate: husband.birthDate || '',
      profession: '',
      workplace: '',
      religion: husband.religion || '',
      phone: '',
      baptismYear: null,
      chrismationYear: null,
      firstCommunionYear: null,
      catechesis: null,
      massAndConfession: husband.massAndConfession || '',
      addressId,
      fatherId: null,
      motherId: null,
      childrenIds: [],
      isDeceased: false,
      deathYear: null,
      marriageIds: [],
    };

    const wifePayload = {
      firstName: wife.firstName,
      lastName: wife.lastName,
      middleName: wife.middleName,
      sex: 'female',
      birthDate: wife.birthDate || '',
      profession: '',
      workplace: '',
      religion: wife.religion || '',
      phone: '',
      baptismYear: null,
      chrismationYear: null,
      firstCommunionYear: null,
      catechesis: null,
      massAndConfession: wife.massAndConfession || '',
      addressId,
      fatherId: null,
      motherId: null,
      childrenIds: [],
      isDeceased: false,
      deathYear: null,
      marriageIds: [],
    };

    const husbandId = await peopleStore.addPerson(husbandPayload);
    const wifeId = await peopleStore.addPerson(wifePayload);

    // 4. Создаём брак
    const marriageId = await marriagesStore.createMarriage({
      husbandId,
      wifeId,
      civilMarriageYear: marriage.civilMarriageYear,
      churchMarriageYear: marriage.churchMarriageYear,
      isChurchMarried: marriage.isChurchMarried,
    });

    // 5. Добавляем marriageIds обоим
    const addMarriageToPerson = async (personId) => {
      const p = peopleStore.people.find((x) => x.id === personId);
      const ids = Array.isArray(p?.marriageIds) ? [...p.marriageIds] : [];
      if (!ids.includes(marriageId)) ids.push(marriageId);
      await peopleStore.updatePerson(personId, { marriageIds: ids });
    };

    await addMarriageToPerson(husbandId);
    await addMarriageToPerson(wifeId);

    router.push({ name: 'AddressDetail', params: { id: addressId } });
  } catch (e) {
    console.error('Ошибка при создании адреса и супругов:', e);
    error.value = 'Не удалось сохранить адрес или супругов. Попробуйте ещё раз.';
  } finally {
    saving.value = false;
  }
};
</script>