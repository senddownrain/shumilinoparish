<template>
  <v-dialog v-model="model" max-width="520">
    <v-card>
      <v-card-title class="text-h6">
        Новый брак
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

        <v-form ref="formRef" v-model="isValid">
          <v-row>
            <!-- Показываем, кто текущий человек (муж или жена) -->
            <v-col cols="12">
              <div class="mb-2">
                <strong>Текущая персона:</strong>
                <span>{{ personFullName }}</span>
                <span class="text-medium-emphasis">
                  ({{ person.sex === 'male' ? 'мужчина' : 'женщина' }})
                </span>
              </div>
            </v-col>

            <!-- Выбор супруга из подходящих людей -->
            <v-col cols="12">
              <v-combobox
                v-model="spouseModel"
                :items="spouseOptions"
                label="Супруг(а)"
                item-title="label"
                item-value="value"
                prepend-inner-icon="mdi-heart"
                variant="outlined"
                density="comfortable"
                clearable
                hide-selected
                return-object
                :rules="[required]"
                hint="Начните вводить фамилию или имя"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="civilYear"
                label="Год гражданского брака"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="churchYear"
                label="Год венчания"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12">
              <v-switch
                v-model="isChurchMarried"
                label="Венчанный брак"
                inset
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="cancel">
          Отмена
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="saving"
          :disabled="saving"
          @click="save"
        >
          Создать
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from 'vue';
import { usePeopleStore } from '../stores/people';
import { useMarriagesStore } from '../stores/marriages';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  person: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'created']);

const peopleStore = usePeopleStore();
const marriagesStore = useMarriagesStore();

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const formRef = ref(null);
const isValid = ref(false);
const saving = ref(false);
const error = ref('');

const spouseModel = ref(null);
const civilYear = ref(null);
const churchYear = ref(null);
const isChurchMarried = ref(false);

const required = (v) => !!v || 'Обязательное поле';

const personFullName = computed(() =>
  [props.person.lastName, props.person.firstName, props.person.middleName]
    .filter(Boolean)
    .join(' ')
);

// активные браки всех людей
const activeMarriageByPersonId = computed(() => {
  const map = new Map();
  marriagesStore.marriages.forEach((m) => {
    if (m.status === 'active') {
      map.set(m.husbandId, m);
      map.set(m.wifeId, m);
    }
  });
  return map;
});
// все браки между парами людей (для запрета повторного брака с тем же человеком)
const marriagesByPairKey = computed(() => {
  const map = new Map();
  marriagesStore.marriages.forEach((m) => {
    const pair = [m.husbandId, m.wifeId].sort().join('-');
    map.set(pair, m);
  });
  return map;
});

const spouseOptions = computed(() => {
  const current = props.person;
  if (!current) return [];

  const wantSex = current.sex === 'male' ? 'female' : 'male';

  // множество id детей текущего человека
  const myChildrenIds = new Set(
    Array.isArray(current.childrenIds) ? current.childrenIds : []
  );

  return peopleStore.people
    .filter((p) => {
      if (p.id === current.id) return false;
      if (p.sex !== wantSex) return false;
      if (p.isDeceased) return false;
      // не должен иметь активный брак
      if (activeMarriageByPersonId.value.has(p.id)) return false;

      // нельзя жениться на собственном ребёнке
      if (myChildrenIds.has(p.id)) return false;

      // нельзя жениться на собственном родителе
      if (
        current.fatherId &&
        p.id === current.fatherId
      ) return false;
      if (
        current.motherId &&
        p.id === current.motherId
      ) return false;

      // нельзя повторно жениться на том же человеке (любой брак в истории)
      const pairKey = [current.id, p.id].sort().join('-');
      if (marriagesByPairKey.value.has(pairKey)) return false;

      return true;
    })
    .map((p) => ({
      value: p.id,
      label: [
        p.lastName,
        p.firstName,
        p.middleName,
        p.birthDate ? `(${p.birthDate})` : '',
      ]
        .filter(Boolean)
        .join(' '),
    }));
});

const cancel = () => {
  model.value = false;
  resetForm();
};

const resetForm = () => {
  spouseModel.value = null;
  civilYear.value = null;
  churchYear.value = null;
  isChurchMarried.value = false;
  error.value = '';
};

const save = async () => {
  error.value = '';

  if (!formRef.value) return;
  const res = await formRef.value.validate();
  const valid = res.valid ?? res;
  if (!valid) return;

  // доп. проверка: сам человек не должен иметь активный брак
  if (activeMarriageByPersonId.value.has(props.person.id)) {
    error.value = 'У данного человека уже есть активный брак.';
    return;
  }

  if (!spouseModel.value || !spouseModel.value.value) {
    error.value = 'Выберите супруга(у).';
    return;
  }

  const spouseId = spouseModel.value.value;

  // безопасность: ещё раз проверим кандидата
  const spouse = peopleStore.people.find((p) => p.id === spouseId);
  if (!spouse) {
    error.value = 'Выбранный супруг не найден.';
    return;
  }
 const pairKey = [props.person.id, spouse.id].sort().join('-');
if (marriagesByPairKey.value.has(pairKey)) {
  error.value = 'Между этими людьми уже был брак. Повторный брак недопустим.';
  return;
}

  const wantSex = props.person.sex === 'male' ? 'female' : 'male';
  if (spouse.sex !== wantSex) {
    error.value = 'Пол выбранного супруга не соответствует.';
    return;
  }
  if (activeMarriageByPersonId.value.has(spouse.id)) {
    error.value = 'У выбранного супруга уже есть активный брак.';
    return;
  }

  saving.value = true;
  try {
    const husbandId =
      props.person.sex === 'male' ? props.person.id : spouse.id;
    const wifeId =
      props.person.sex === 'female' ? props.person.id : spouse.id;

    const marriageId = await marriagesStore.createMarriage({
      husbandId,
      wifeId,
      civilMarriageYear: civilYear.value,
      churchMarriageYear: churchYear.value,
      isChurchMarried: isChurchMarried.value,
    });

    // обновляем marriageIds у обоих людей
    const { updatePerson } = usePeopleStore(); // уже использованный store, можно взять метод напрямую
    // но лучше не переинициализировать store, возьмём существующий:
    const people = peopleStore;

    const updateIdsFor = async (personId) => {
      const p = people.people.find((x) => x.id === personId);
      if (!p) return;
      const ids = Array.isArray(p.marriageIds) ? [...p.marriageIds] : [];
      if (!ids.includes(marriageId)) {
        ids.push(marriageId);
      }
      // используем updatePerson из store
      await people.updatePerson(personId, { marriageIds: ids });
    };

    await updateIdsFor(husbandId);
    await updateIdsFor(wifeId);

    emit('created', marriageId);
    model.value = false;
    resetForm();
  } catch (e) {
    console.error('Ошибка при создании брака:', e);
    error.value = 'Не удалось создать брак. Попробуйте ещё раз.';
  } finally {
    saving.value = false;
  }
};
</script>