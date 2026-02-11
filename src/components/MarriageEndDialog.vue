<template>
  <v-dialog
    v-model="model"
    :fullscreen="smAndDown"
    :max-width="smAndDown ? undefined : 520"
    scrollable
  >
    <v-card>
      <v-toolbar :color="props.mode === 'divorce' ? 'red-darken-1' : 'orange-darken-2'" density="comfortable">
        <v-btn icon="mdi-close" variant="text" @click="cancel" />
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          variant="text"
          :loading="saving"
          :disabled="saving"
          @click="confirm"
        >
          Подтвердить
        </v-btn>
      </v-toolbar>

      <v-card-text class="pt-4">
        <v-alert v-if="error" type="error" variant="outlined" class="mb-3">
          {{ error }}
        </v-alert>

        <v-sheet class="pa-3 mb-4" rounded="lg" border>
          <div class="text-body-2">
            Изменить статус брака между
            <strong>{{ fullName(husband) }}</strong> и
            <strong>{{ fullName(wife) }}</strong>
            на <strong>{{ actionLabel }}</strong>.
          </div>
        </v-sheet>

        <v-form ref="formRef" v-model="isValid">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model.number="year"
                :label="yearLabel"
                type="number"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
              />
            </v-col>
          </v-row>
        </v-form>

        <v-alert
          v-if="props.mode === 'widow'"
          type="warning"
          variant="tonal"
          class="mt-2"
        >
          При отметке вдовства у супругов будет установлен статус “умер(ла)” и год смерти,
          если они ещё не указаны.
        </v-alert>
      </v-card-text>

      <v-card-actions v-if="!smAndDown">
        <v-spacer />
        <v-btn variant="text" @click="cancel">Отмена</v-btn>
        <v-btn
          :color="props.mode === 'divorce' ? 'red' : 'orange'"
          variant="flat"
          :loading="saving"
          :disabled="saving"
          @click="confirm"
        >
          Подтвердить
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
  marriage: { type: Object, required: true },
  mode: { type: String, default: 'divorce' }, // 'divorce' | 'widow'
});

const emit = defineEmits(['update:modelValue', 'updated']);

const peopleStore = usePeopleStore();
const marriagesStore = useMarriagesStore();

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const formRef = ref(null);
const isValid = ref(false);
const year = ref(null);
const saving = ref(false);
const error = ref('');

const required = (v) => !!v || 'Обязательное поле';

const husband = computed(() =>
  peopleStore.people.find((p) => p.id === props.marriage.husbandId) || null
);
const wife = computed(() =>
  peopleStore.people.find((p) => p.id === props.marriage.wifeId) || null
);

const title = computed(() => (props.mode === 'divorce' ? 'Развод' : 'Отметить вдовство'));
const actionLabel = computed(() => (props.mode === 'divorce' ? 'разведены' : 'вдовство'));
const yearLabel = computed(() =>
  props.mode === 'divorce' ? 'Год развода' : 'Год смерти супруга(и)'
);

const fullName = (p) => (p ? [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ') : '—');

watch(
  () => model.value,
  (open) => {
    if (!open) return;
    year.value = null;
    error.value = '';
  }
);

const cancel = () => {
  model.value = false;
  year.value = null;
  error.value = '';
};

const confirm = async () => {
  error.value = '';

  if (formRef.value) {
    const res = await formRef.value.validate();
    const valid = res.valid ?? res;
    if (!valid) return;
  }

  if (!props.marriage?.id) {
    error.value = 'Брак не найден.';
    return;
  }

  saving.value = true;
  try {
    const y = year.value || null;

    if (props.mode === 'divorce') {
      await marriagesStore.updateMarriageStatus(props.marriage.id, {
        status: 'divorced',
        divorceYear: y,
      });
    } else {
      await marriagesStore.updateMarriageStatus(props.marriage.id, {
        status: 'widowed',
        divorceYear: y, // у тебя поле так называется; оставляем совместимость
      });

      const updateDeath = async (person) => {
        if (!person) return;
        if (person.isDeceased && person.deathYear) return;
        await peopleStore.updatePerson(person.id, {
          isDeceased: true,
          deathYear: y,
        });
      };

      await updateDeath(husband.value);
      await updateDeath(wife.value);
    }

    emit('updated');
    model.value = false;
    year.value = null;
  } catch (e) {
    console.error('Ошибка при изменении статуса брака:', e);
    error.value = 'Не удалось изменить статус брака.';
  } finally {
    saving.value = false;
  }
};
</script>