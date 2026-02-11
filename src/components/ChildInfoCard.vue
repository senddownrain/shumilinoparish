<!-- src/components/ChildInfoCard.vue -->
<template>
  <v-card
    rounded="lg"
    border
    hover
    class="h-100"
    @click="emit('open', child.id)"
  >
    <v-card-title class="d-flex align-center justify-space-between pb-1">
      <span class="text-subtitle-1 font-weight-medium">
        {{ fullName }}
      </span>

      <v-chip
        v-if="child.isDeceased"
        size="x-small"
        color="grey"
        variant="tonal"
      >
        умер(ла){{ child.deathYear ? ` · ${child.deathYear}` : '' }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pt-2">
      <!-- Дата рождения (+ возраст) -->
      <div class="text-body-2 text-medium-emphasis">
        <strong>Рожд.:</strong>
        <span v-if="child.birthDate">{{ formatDateRu(child.birthDate) }}</span>
        <span v-else class="text-disabled">не указана</span>
        <span v-if="ageText"> · {{ ageText }}</span>
      </div>

      <!-- Родители (оставил, т.к. полезно и компактно) -->
      <div v-if="parentsLine" class="text-body-2 text-medium-emphasis mt-1">
        <strong>Родители:</strong> {{ parentsLine }}
      </div>

      <!-- Таинства: показываем ТОЛЬКО причастие и миропомазание -->
      <!-- ВАЖНО: крещение НЕ показываем вообще (как вы просили) -->
      <div class="d-flex flex-wrap ga-1 mt-2">
  <v-chip
    v-if="child.firstCommunion === true || child.firstCommunionYear"
    size="x-small"
    variant="tonal"
  >
    причастие:
    {{ child.firstCommunionYear ? child.firstCommunionYear : "есть" }}
  </v-chip>

  <v-chip
    v-if="child.chrismation === true || child.chrismationYear"
    size="x-small"
    variant="tonal"
  >
    миропомаз.:
    {{ child.chrismationYear ? child.chrismationYear : "есть" }}
  </v-chip>

  <span
    v-if="
      !(child.firstCommunion === true || child.firstCommunionYear) &&
      !(child.chrismation === true || child.chrismationYear)
    "
    class="text-caption text-medium-emphasis"
  >
    таинства не отмечены
  </span>
</div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  child: { type: Object, required: true },
  father: { type: Object, default: null },
  mother: { type: Object, default: null },
});

const emit = defineEmits(['open']);

const fullName = computed(() =>
  [props.child.lastName, props.child.firstName, props.child.middleName]
    .filter(Boolean)
    .join(' ')
);

const shortName = (p) => {
  if (!p) return '';
  const ln = p.lastName || '';
  const fn = p.firstName ? `${p.firstName[0]}.` : '';
  const mn = p.middleName ? `${p.middleName[0]}.` : '';
  return [ln, fn, mn].filter(Boolean).join(' ');
};

const parentsLine = computed(() => {
  const f = props.father ? shortName(props.father) : '';
  const m = props.mother ? shortName(props.mother) : '';
  if (f && m) return `${f} и ${m}`;
  if (f) return f;
  if (m) return m;
  return '';
});

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
  const y = birthYear(props.child.birthDate);
  if (!y) return '';
  const now = new Date().getFullYear();
  const age = now - y;
  if (!Number.isFinite(age) || age < 0 || age > 130) return '';
  return `${age} ${yearsWord(age)}`;
});
</script>