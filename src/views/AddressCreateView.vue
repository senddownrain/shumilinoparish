<template>
  <div>
    <v-card>
      <v-card-title>Новый адрес</v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" variant="outlined" class="mb-3">
          {{ error }}
        </v-alert>

        <!-- ЕДИНАЯ форма адреса -->
        <AddressForm
          :value="addressForm"
          @update:value="addressForm = $event"
          ref="addressFormRef"
          @validity-change="(v) => (isAddressValid = v)"
        />

        <v-divider class="my-4" />

        <!-- Взрослые жители (опционально) -->
        <v-switch
          v-model="withAdults"
          label="Добавить взрослых жителей (муж и/или жена)"
          inset
          class="mb-2"
        />

        <v-expand-transition>
          <div v-if="withAdults">
            <v-alert type="info" variant="outlined" class="mb-3">
              Можно выбрать существующих людей или создать новых. Брак создаётся
              <strong>только</strong> если добавлены и муж, и жена.
            </v-alert>

            <v-row>
              <!-- Муж -->
              <v-col cols="12" md="6">
                <v-card variant="outlined" rounded="lg">
                  <v-card-title class="text-subtitle-1">Муж</v-card-title>
                  <v-card-text>
                    <v-switch v-model="includeHusband" label="Добавить мужа" inset class="mb-2" />

                    <v-expand-transition>
                      <div v-if="includeHusband">
                        <v-radio-group v-model="husbandMode" inline class="mb-2">
                          <v-radio label="Выбрать существующего" value="existing" />
                          <v-radio label="Создать нового" value="new" />
                        </v-radio-group>

                        <div v-if="husbandMode === 'existing'">
                          <v-autocomplete
                            v-model="husbandExistingId"
                            :items="malePeopleOptions"
                            item-title="title"
                            item-value="id"
                            label="Существующий мужчина"
                            variant="outlined"
                            density="comfortable"
                            clearable
                          />
                        </div>

                        <div v-else>
                          <v-row>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="husband.lastName"
                                label="Фамилия"
                                :rules="[requiredIfHusbandNew]"
                                variant="outlined"
                                density="comfortable"
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="husband.firstName"
                                label="Имя"
                                :rules="[requiredIfHusbandNew]"
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
                                
                                variant="outlined"
                                density="comfortable"
                              />
                            </v-col>
                                                   <!-- Профессия / работа -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="husband.profession"
          label="Профессия"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="husband.workplace"
          label="Место работы"
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
                        </div>
                      </div>
                    </v-expand-transition>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Жена -->
              <v-col cols="12" md="6">
                <v-card variant="outlined" rounded="lg">
                  <v-card-title class="text-subtitle-1">Жена</v-card-title>
                  <v-card-text>
                    <v-switch v-model="includeWife" label="Добавить жену" inset class="mb-2" />

                    <v-expand-transition>
                      <div v-if="includeWife">
                        <v-radio-group v-model="wifeMode" inline class="mb-2">
                          <v-radio label="Выбрать существующую" value="existing" />
                          <v-radio label="Создать новую" value="new" />
                        </v-radio-group>

                        <div v-if="wifeMode === 'existing'">
                          <v-autocomplete
                            v-model="wifeExistingId"
                            :items="femalePeopleOptions"
                            item-title="title"
                            item-value="id"
                            label="Существующая женщина"
                            variant="outlined"
                            density="comfortable"
                            clearable
                          />
                        </div>

                        <div v-else>
                          <v-row>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="wife.lastName"
                                label="Фамилия"
                                :rules="[requiredIfWifeNew]"
                                variant="outlined"
                                density="comfortable"
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="wife.firstName"
                                label="Имя"
                                :rules="[requiredIfWifeNew]"
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
                                
                                variant="outlined"
                                density="comfortable"
                              />
                            </v-col>

                            <!-- Профессия / работа -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="wife.profession"
          label="Профессия"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="wife.workplace"
          label="Место работы"
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
                        </div>
                      </div>
                    </v-expand-transition>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Брак: только если добавили обоих -->
            <v-expand-transition>
              <div v-if="includeHusband && includeWife" class="mt-4">
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
                    <v-switch v-model="marriage.isChurchMarried" label="Венчанный брак" inset />
                  </v-col>
                </v-row>
              </div>
            </v-expand-transition>
          </div>
        </v-expand-transition>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";

import AddressForm from "../components/AddressForm.vue";
import { useAddressesStore } from "../stores/addresses";
import { usePeopleStore } from "../stores/people";
import { useMarriagesStore } from "../stores/marriages";
import { useAppUiStore } from "../stores/appUi";

const router = useRouter();

const appUi = useAppUiStore();
const addressesStore = useAddressesStore();
const peopleStore = usePeopleStore();
const marriagesStore = useMarriagesStore();

const addressFormRef = ref(null);
const isAddressValid = ref(false);

const saving = ref(false);
const error = ref("");

const withAdults = ref(false);

// адрес
const addressForm = ref({
  localityType: "посёлок",
  localityName: "",
  street: "",
  house: "",
  apartment: "",
  phoneHome: "",
  visitYears: [],
});

// муж/жена включены?
const includeHusband = ref(true);
const includeWife = ref(true);

// режимы: existing/new
const husbandMode = ref("new");
const wifeMode = ref("new");

// выбранные существующие
const husbandExistingId = ref(null);
const wifeExistingId = ref(null);

// новые
const husband = reactive({
  lastName: "",
  firstName: "",
  middleName: "",
  birthDate: "",
  religion: "",
  massAndConfession: "",
});

const wife = reactive({
  lastName: "",
  firstName: "",
  middleName: "",
  birthDate: "",
  religion: "",
  massAndConfession: "",
});

const marriage = reactive({
  civilMarriageYear: null,
  churchMarriageYear: null,
  isChurchMarried: false,
});

const religionOptions = [
  { label: "Католик", value: "католик" },
  { label: "Греко-католик", value: "греко-католик" },
  { label: "Православный", value: "православный" },
  { label: "Старовер", value: "старовер" },
  { label: "Некрещенный", value: "некрещенный" },
  { label: "Протестант", value: "протестант" },
];

const massConfessionOptions = [
  { label: "Часто", value: "часто" },
  { label: "Регулярно", value: "регулярно" },
  { label: "Редко", value: "редко" },
  { label: "Раз в год", value: "раз в год" },
  { label: "Давно", value: "давно" },
];

const fullName = (p) => [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ").trim();

const malePeopleOptions = computed(() =>
  peopleStore.people
    .filter((p) => p.sex === "male")
    .map((p) => ({ id: p.id, title: fullName(p) || "(без имени)" }))
    .sort((a, b) => a.title.localeCompare(b.title, "ru"))
);

const femalePeopleOptions = computed(() =>
  peopleStore.people
    .filter((p) => p.sex === "female")
    .map((p) => ({ id: p.id, title: fullName(p) || "(без имени)" }))
    .sort((a, b) => a.title.localeCompare(b.title, "ru"))
);

// Валидация супругов (логическая)
const spouseInputsOk = computed(() => {
  if (!withAdults.value) return true;

  // можно выключить обоих — тогда просто адрес
  if (!includeHusband.value && !includeWife.value) return true;

  // муж
  if (includeHusband.value) {
    if (husbandMode.value === "existing") {
      if (!husbandExistingId.value) return false;
    } else {
      if (!husband.lastName || !husband.firstName) return false;
    }
  }

  // жена
  if (includeWife.value) {
    if (wifeMode.value === "existing") {
      if (!wifeExistingId.value) return false;
    } else {
      if (!wife.lastName || !wife.firstName) return false;
    }
  }

  // защита от выбора одного и того же человека
  if (
    includeHusband.value &&
    includeWife.value &&
    husbandMode.value === "existing" &&
    wifeMode.value === "existing" &&
    husbandExistingId.value &&
    husbandExistingId.value === wifeExistingId.value
  ) {
    return false;
  }

  return true;
});

const canSave = computed(() => {
  return isAddressValid.value && spouseInputsOk.value && !saving.value;
});

// rules для полей (чтобы Vuetify подсвечивал в "new" режиме)
const requiredIfHusbandNew = (v) => {
  if (!withAdults.value || !includeHusband.value) return true;
  if (husbandMode.value !== "new") return true;
  return !!v || "Обязательное поле";
};
const requiredIfWifeNew = (v) => {
  if (!withAdults.value || !includeWife.value) return true;
  if (wifeMode.value !== "new") return true;
  return !!v || "Обязательное поле";
};

const goBack = () => router.push({ name: "AddressList" });

const setAppBar = () => {
  appUi.set({
    title: "Новый адрес",
    showBack: true,
    backTo: { name: "AddressList" },
    actions: [
      {
        icon: "mdi-content-save",
        label: "Сохранить",
        onClick: save,
        disabled: !canSave.value,
        loading: saving.value,
      },
    ],
  });
};

onMounted(async () => {
  // чтобы можно было выбирать из существующих
  if (!peopleStore.people.length && !peopleStore.loading) {
    await peopleStore.fetchPeople();
  }
  setAppBar();
});

watch([isAddressValid, spouseInputsOk, saving], () => setAppBar());

onUnmounted(() => {
  appUi.reset();
});

const resolvePersonId = async ({ mode, existingId, payloadIfNew, addressId }) => {
  if (mode === "none") return null;

  if (mode === "existing") {
    // привязываем существующего человека к новому адресу
    await peopleStore.updatePerson(existingId, { addressId });
    return existingId;
  }

  // new
  return await peopleStore.addPerson({ ...payloadIfNew, addressId });
};

const save = async () => {
  error.value = "";

  // 1) валидируем адрес
  if (!addressFormRef.value || !(await addressFormRef.value.validate())) return;

  // 2) логическая валидность супругов
  if (!spouseInputsOk.value) {
    error.value = "Проверьте данные мужа/жены (или выбор существующих).";
    return;
  }

  saving.value = true;

  try {
    // 1) создаём адрес (visitYears приходит из AddressForm)
    const a = addressForm.value || {};
    const addressId = await addressesStore.addAddress({
      localityType: a.localityType || "",
      localityName: a.localityName || "",
      street: a.street || "",
      house: a.house || "",
      apartment: a.apartment || "",
      phoneHome: a.phoneHome || "",
      visitYears: Array.isArray(a.visitYears) ? a.visitYears : [],
    });

    // 2) если взрослых не добавляем — готово
    if (!withAdults.value || (!includeHusband.value && !includeWife.value)) {
      router.push({ name: "AddressDetail", params: { id: addressId } });
      return;
    }

    // 3) создаём/привязываем мужа/жену (каждый отдельно)
    const husbandId = includeHusband.value
      ? await resolvePersonId({
          mode: husbandMode.value,
          existingId: husbandExistingId.value,
          payloadIfNew: {
            firstName: husband.firstName,
            lastName: husband.lastName,
            middleName: husband.middleName,
            sex: "male",
            birthDate: husband.birthDate || "",
            profession: "",
            workplace: "",
            religion: husband.religion || "",
            phone: "",
            baptismYear: null,
            chrismationYear: null,
            firstCommunionYear: null,
            catechesis: null,
            massAndConfession: husband.massAndConfession || "",
            fatherId: null,
            motherId: null,
            childrenIds: [],
            isDeceased: false,
            deathYear: null,
            marriageIds: [],
          },
          addressId,
        })
      : null;

    const wifeId = includeWife.value
      ? await resolvePersonId({
          mode: wifeMode.value,
          existingId: wifeExistingId.value,
          payloadIfNew: {
            firstName: wife.firstName,
            lastName: wife.lastName,
            middleName: wife.middleName,
            sex: "female",
            birthDate: wife.birthDate || "",
            profession: "",
            workplace: "",
            religion: wife.religion || "",
            phone: "",
            baptismYear: null,
            chrismationYear: null,
            firstCommunionYear: null,
            catechesis: null,
            massAndConfession: wife.massAndConfession || "",
            fatherId: null,
            motherId: null,
            childrenIds: [],
            isDeceased: false,
            deathYear: null,
            marriageIds: [],
          },
          addressId,
        })
      : null;

    // 4) брак создаём ТОЛЬКО если есть оба
    if (husbandId && wifeId) {
      const marriageId = await marriagesStore.createMarriage({
        husbandId,
        wifeId,
        civilMarriageYear: marriage.civilMarriageYear,
        churchMarriageYear: marriage.churchMarriageYear,
        isChurchMarried: marriage.isChurchMarried,
      });

      const addMarriageToPerson = async (personId) => {
        const p = peopleStore.people.find((x) => x.id === personId);
        const ids = Array.isArray(p?.marriageIds) ? [...p.marriageIds] : [];
        if (!ids.includes(marriageId)) ids.push(marriageId);
        await peopleStore.updatePerson(personId, { marriageIds: ids });
      };

      await addMarriageToPerson(husbandId);
      await addMarriageToPerson(wifeId);
    }

    router.push({ name: "AddressDetail", params: { id: addressId } });
  } catch (e) {
    console.error("Ошибка при создании адреса/жителей:", e);
    error.value = "Не удалось сохранить. Попробуйте ещё раз.";
  } finally {
    saving.value = false;
  }
};
</script>