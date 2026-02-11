<!-- src/components/PersonInfoCard.vue -->
<template>
  <v-card
    rounded="lg"
    border
    hover
    class="h-100"
    @click="emit('open', person.id)"
  >
    <v-card-title class="d-flex align-center justify-space-between pb-1">
      <div class="d-flex align-center ga-2">
        <v-chip
          v-if="roleLabel"
          size="x-small"
          variant="tonal"
          color="primary"
        >
          {{ roleLabel }}
        </v-chip>

        <span class="text-subtitle-1 font-weight-medium">
          {{ fullName }}
        </span>
      </div>

      <v-chip
        v-if="person.isDeceased"
        size="x-small"
        color="grey"
        variant="tonal"
      >
        умер(ла){{ person.deathYear ? ` · ${person.deathYear}` : '' }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pt-2">
      <div class="text-body-2 text-medium-emphasis">
        <strong>Рожд.:</strong>
        <span v-if="person.birthDate">{{ formatDateRu(person.birthDate) }}</span>
        <span v-else class="text-disabled">не указана</span>
        <span v-if="ageText"> · {{ ageText }}</span>
        <span v-if="person.religion"> · {{ person.religion }}</span>
      </div>

      <div
        v-if="person.profession || person.workplace"
        class="text-body-2 text-medium-emphasis mt-1"
      >
        <strong>Работа:</strong>
        {{ [person.profession, person.workplace].filter(Boolean).join(' · ') }}
      </div>

      <div
        v-if="person.massAndConfession"
        class="text-body-2 text-medium-emphasis mt-1"
      >
        <strong>Месса/исповедь:</strong> {{ person.massAndConfession }}
      </div>

      <div v-if="person.phone" class="text-body-2 text-medium-emphasis mt-1">
        <strong>Тел.:</strong> {{ person.phone }}
      </div>

      <div class="d-flex flex-wrap ga-1 mt-2">
        <v-chip v-if="person.baptismYear" size="x-small" variant="tonal">
          крещение: {{ person.baptismYear }}
        </v-chip>
        <v-chip v-if="person.chrismationYear" size="x-small" variant="tonal">
          миропомаз.: {{ person.chrismationYear }}
        </v-chip>
        <v-chip v-if="person.firstCommunionYear" size="x-small" variant="tonal">
          причастие: {{ person.firstCommunionYear }}
        </v-chip>

        <v-chip
          v-if="person.catechesis === true"
          size="x-small"
          color="green"
          variant="tonal"
        >
          катехезы: да
        </v-chip>
        <v-chip
          v-else-if="person.catechesis === false"
          size="x-small"
          color="grey"
          variant="tonal"
        >
          катехезы: нет
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  person: { type: Object, required: true },
  roleLabel: { type: String, default: '' }, // "Муж" / "Жена" / etc
});

const emit = defineEmits(['open']);

const fullName = computed(() =>
  [props.person.lastName, props.person.firstName, props.person.middleName]
    .filter(Boolean)
    .join(' ')
);

/** YYYY-MM-DD -> DD.MM.YYYY */
const formatDateRu = (value) => {
  const s = String(value || '').trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [yyyy, mm, dd] = s.split('-');
    return `${dd}.${mm}.${yyyy}`;
  }
  return s;
};

const birthYear = (value) => {
  const s = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return Number(s.slice(0, 4));
  const y = Number(s);
  return Number.isFinite(y) ? y : null;
};

const yearsWord = (n) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'лет';
  if (mod10 === 1) return 'год';
  if (mod10 >= 2 && mod10 <= 4) return 'года';
  return 'лет';
};

const ageText = computed(() => {
  const y = birthYear(props.person.birthDate);
  if (!y) return '';
  const now = new Date().getFullYear();
  const age = now - y;
  if (!Number.isFinite(age) || age < 0 || age > 130) return '';
  return `${age} ${yearsWord(age)}`;
});
</script>