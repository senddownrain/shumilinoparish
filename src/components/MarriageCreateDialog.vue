<template>
  <v-dialog
    v-model="model"
    :fullscreen="smAndDown"
    :max-width="smAndDown ? undefined : 560"
    scrollable
  >
    <v-card>
      <v-toolbar color="primary" density="comfortable">
        <v-btn icon="mdi-close" variant="text" @click="cancel" />
        <v-toolbar-title>Новый брак</v-toolbar-title>
        <v-spacer />
        <v-btn
          variant="text"
          :loading="saving"
          :disabled="saving"
          @click="save"
        >
          Сохранить
        </v-btn>
      </v-toolbar>

      <v-card-text class="pt-4">
        <v-alert v-if="error" type="error" variant="outlined" class="mb-3">
          {{ error }}
        </v-alert>

        <v-sheet class="pa-3 mb-4" rounded="lg" border>
          <div class="text-body-2">
            <strong>Текущая персона:</strong>
            {{ personFullName }}
            <span class="text-medium-emphasis">
              ({{ props.person.sex === 'male' ? 'мужчина' : 'женщина' }})
            </span>
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Новый брак создаётся со статусом <strong>активный</strong>.
          </div>
        </v-sheet>

        <v-form ref="formRef" v-model="isValid">
          <v-row>
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

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="civilYear"
                label="Год гражданского брака"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" sm="6">
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

      <v-card-actions v-if="!smAndDown">
        <v-spacer />
        <v-btn variant="text" @click="cancel">Отмена</v-btn>
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
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { usePeopleStore } from '../stores/people';
import { useMarriagesStore } from '../stores/marriages';

const { smAndDown } = useDisplay();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  person: { type: Object, required: true },
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

// active браки по personId
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

// все браки по паре (чтобы не повторяться)
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
  const myChildrenIds = new Set(Array.isArray(current.childrenIds) ? current.childrenIds : []);

  return peopleStore.people
    .filter((p) => {
      if (p.id === current.id) return false;
      if (p.sex !== wantSex) return false;
      if (p.isDeceased) return false;

      // у кандидата не должно быть активного брака
      if (activeMarriageByPersonId.value.has(p.id)) return false;

      // нельзя с ребёнком
      if (myChildrenIds.has(p.id)) return false;

      // нельзя с родителем
      if (current.fatherId && p.id === current.fatherId) return false;
      if (current.motherId && p.id === current.motherId) return false;

      // нельзя повторно с тем же человеком
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

// при открытии — сброс
watch(
  () => model.value,
  (open) => {
    if (!open) return;
    spouseModel.value = null;
    civilYear.value = null;
    churchYear.value = null;
    isChurchMarried.value = false;
    error.value = '';
  }
);

const cancel = () => {
  model.value = false;
};

const save = async () => {
  error.value = '';

  if (!formRef.value) return;
  const res = await formRef.value.validate();
  const valid = res.valid ?? res;
  if (!valid) return;

  // сам человек не должен иметь активный брак
  if (activeMarriageByPersonId.value.has(props.person.id)) {
    error.value = 'У данного человека уже есть активный брак.';
    return;
  }

  if (!spouseModel.value || !spouseModel.value.value) {
    error.value = 'Выберите супруга(у).';
    return;
  }

  const spouseId = spouseModel.value.value;
  const spouse = peopleStore.people.find((p) => p.id === spouseId);
  if (!spouse) {
    error.value = 'Выбранный супруг не найден.';
    return;
  }

  // повторная защита пары
  const pairKey = [props.person.id, spouse.id].sort().join('-');
  if (marriagesByPairKey.value.has(pairKey)) {
    error.value = 'Между этими людьми уже был брак. Повторный брак недопустим.';
    return;
  }

  // пол
  const wantSex = props.person.sex === 'male' ? 'female' : 'male';
  if (spouse.sex !== wantSex) {
    error.value = 'Пол выбранного супруга не соответствует.';
    return;
  }

  // у супруга не должно быть активного брака
  if (activeMarriageByPersonId.value.has(spouse.id)) {
    error.value = 'У выбранного супруга уже есть активный брак.';
    return;
  }

  saving.value = true;
  try {
    const husbandId = props.person.sex === 'male' ? props.person.id : spouse.id;
    const wifeId = props.person.sex === 'female' ? props.person.id : spouse.id;

    const marriageId = await marriagesStore.createMarriage({
      husbandId,
      wifeId,
      civilMarriageYear: civilYear.value,
      churchMarriageYear: churchYear.value,
      isChurchMarried: isChurchMarried.value,
    });

    // обновляем marriageIds у обоих людей
    const updateIdsFor = async (personId) => {
      const p = peopleStore.people.find((x) => x.id === personId);
      if (!p) return;

      const ids = Array.isArray(p.marriageIds) ? [...p.marriageIds] : [];
      if (!ids.includes(marriageId)) ids.push(marriageId);

      await peopleStore.updatePerson(personId, { marriageIds: ids });
    };

    await updateIdsFor(husbandId);
    await updateIdsFor(wifeId);

    emit('created', marriageId);
    model.value = false;
  } catch (e) {
    console.error('Ошибка при создании брака:', e);
    error.value = 'Не удалось создать брак. Попробуйте ещё раз.';
  } finally {
    saving.value = false;
  }
};
</script>