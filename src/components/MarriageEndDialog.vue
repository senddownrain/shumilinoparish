<template>
  <v-dialog v-model="model" max-width="480">
    <v-card>
      <v-card-title class="text-h6">
        {{ title }}
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

        <p class="mb-3">
          Вы действительно хотите изменить статус брака между
          <strong>{{ fullName(husband) }}</strong> и
          <strong>{{ fullName(wife) }}</strong>
          на <strong>{{ actionLabel }}</strong>?
        </p>

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

        <p v-if="props.mode === 'widow'" class="text-body-2 text-medium-emphasis mt-2">
          При отметке вдовства у супруга(и) будет установлен статус "умер(ла)" и год смерти,
          если они ещё не указаны.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="cancel">
          Отмена
        </v-btn>
        <v-btn
          color="red"
          variant="flat"
          :loading="saving"
          @click="confirm"
        >
          Подтвердить
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
  marriage: {
    type: Object,
    required: true,
  },
  mode: {
    type: String,
    default: 'divorce', // 'divorce' | 'widow'
  },
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

const title = computed(() =>
  props.mode === 'divorce' ? 'Развод' : 'Отметить вдовство'
);

const actionLabel = computed(() =>
  props.mode === 'divorce' ? 'разведены' : 'вдовец / вдова'
);

const yearLabel = computed(() =>
  props.mode === 'divorce' ? 'Год развода' : 'Год смерти супруга(и)'
);

const fullName = (p) =>
  p ? [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ') : '';

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
    if (props.mode === 'divorce') {
      // только статус брака
      await marriagesStore.updateMarriageStatus(props.marriage.id, {
        status: 'divorced',
        divorceYear: year.value || null,
      });
    } else {
      // вдовство: статус брака + отметка смерти супруга(и)
      await marriagesStore.updateMarriageStatus(props.marriage.id, {
        status: 'widowed',
        divorceYear: year.value || null,
      });

      // определяем, кто сейчас "вдовеет" — текущий человек узнаётся в родительском компоненте,
      // но здесь мы просто помечаем обоих супругов, если у кого-то ещё нет даты смерти.
      const y = year.value || null;

      const updateDeath = async (person) => {
        if (!person) return;
        // если уже есть год смерти, не трогаем
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