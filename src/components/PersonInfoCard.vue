<template>
  <v-card
    rounded="lg"
    border
    hover
    class="mb-3"
    @click="emit('open', person.id)"
  >
    <!-- Header -->
    <v-card-title class="d-flex align-center justify-space-between pb-1">
      <div class="d-flex flex-column">
        <div class="d-flex align-center ga-2">
          <span class="text-subtitle-1 font-weight-medium">
            {{ fullName }}
          </span>

          <v-chip
            v-if="roleLabel"
            size="x-small"
            color="primary"
            variant="tonal"
          >
            {{ roleLabel }}
          </v-chip>
        </div>

        <div class="text-caption text-medium-emphasis mt-1" v-if="mode === 'compact'">
          <span v-if="birthDateText"><strong>Рожд.:</strong> {{ birthDateText }}</span>
          <span v-else><strong>Рожд.:</strong> <span class="text-disabled">не указана</span></span>
          <span v-if="ageText"> · {{ ageText }}</span>
          <span v-if="person.religion"> · {{ person.religion }}</span>
          <span v-if="person.phone"> · {{ person.phone }}</span>
        </div>
      </div>

      <div class="d-flex align-center ga-2">
        <v-chip
          v-if="person.isDeceased"
          size="x-small"
          color="grey"
          variant="tonal"
        >
          умер(ла){{ person.deathYear ? ` · ${person.deathYear}` : "" }}
        </v-chip>
      </div>
    </v-card-title>

    <v-card-text class="pt-2">
      <!-- COMPACT -->
      <template v-if="mode === 'compact'">
        <div class="text-body-2 text-medium-emphasis">
          <v-icon icon="mdi-briefcase" size="small" class="mr-1" />
          <span v-if="person.profession || person.workplace">
            {{ person.profession }}
            <span v-if="person.workplace"> ({{ person.workplace }})</span>
          </span>
          <span v-else class="text-disabled">работа не указана</span>
        </div>

        <div class="d-flex flex-wrap ga-1 mt-2">
          <!-- Таинства (крещение показываем всегда, если есть) -->
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

          <v-chip
            v-if="person.massAndConfession"
            size="x-small"
            variant="tonal"
          >
            месса/исповедь: {{ person.massAndConfession }}
          </v-chip>
        </div>
      </template>

      <!-- DETAIL -->
      <template v-else>
        <v-row>
          <v-col cols="12" md="6">
            <v-list density="compact" class="py-0">
              <v-list-item>
                <v-list-item-title class="text-body-2">
                  <strong>Пол:</strong>
                  <span v-if="person.sex === 'male'"> мужской</span>
                  <span v-else-if="person.sex === 'female'"> женский</span>
                  <span v-else class="text-disabled"> не указан</span>
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <v-list-item-title class="text-body-2">
                  <strong>Дата рождения:</strong>
                  <span v-if="birthDateText"> {{ birthDateText }}</span>
                  <span v-else class="text-disabled"> не указана</span>
                  <span v-if="ageText"> · {{ ageText }}</span>
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <v-list-item-title class="text-body-2">
                  <strong>Телефон:</strong>
                  <span v-if="person.phone"> {{ person.phone }}</span>
                  <span v-else class="text-disabled"> не указан</span>
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <v-list-item-title class="text-body-2">
                  <strong>Профессия:</strong>
                  <span v-if="person.profession"> {{ person.profession }}</span>
                  <span v-else class="text-disabled"> не указана</span>
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <v-list-item-title class="text-body-2">
                  <strong>Место работы:</strong>
                  <span v-if="person.workplace"> {{ person.workplace }}</span>
                  <span v-else class="text-disabled"> не указано</span>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>

          <v-col cols="12" md="6">
            <v-list density="compact" class="py-0">
              <v-list-item>
                <v-list-item-title class="text-body-2">
                  <strong>Вероисповедание:</strong>
                  <span v-if="person.religion"> {{ person.religion }}</span>
                  <span v-else class="text-disabled"> не указано</span>
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <v-list-item-title class="text-body-2">
                  <strong>Крещение:</strong>
                  <span v-if="person.baptismYear"> {{ person.baptismYear }}</span>
                  <span v-else class="text-disabled"> нет данных</span>
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <v-list-item-title class="text-body-2">
                  <strong>Миропомазание:</strong>
                  <span v-if="person.chrismationYear"> {{ person.chrismationYear }}</span>
                  <span v-else class="text-disabled"> нет данных</span>
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <v-list-item-title class="text-body-2">
                  <strong>Первое причастие:</strong>
                  <span v-if="person.firstCommunionYear"> {{ person.firstCommunionYear }}</span>
                  <span v-else class="text-disabled"> нет данных</span>
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <v-list-item-title class="text-body-2">
                  <strong>Катехезы:</strong>
                  <span v-if="person.catechesis === true"> ходит</span>
                  <span v-else-if="person.catechesis === false"> не ходит</span>
                  <span v-else class="text-disabled"> нет данных</span>
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <v-list-item-title class="text-body-2">
                  <strong>Месса/исповедь:</strong>
                  <span v-if="person.massAndConfession"> {{ person.massAndConfession }}</span>
                  <span v-else class="text-disabled"> нет данных</span>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>

        <v-divider class="my-3" />

        <div class="text-body-2">
          <strong>Адрес проживания:</strong>
          <div v-if="addressTitle" class="d-flex align-center flex-wrap ga-2 mt-1">
            <span class="text-medium-emphasis">{{ addressTitle }}</span>
            <slot name="address-actions" />
          </div>
          <div v-else class="text-disabled mt-1">не указан</div>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  person: { type: Object, required: true },

  /** compact — для AddressDetailView, detail — для PeopleDetailView */
  mode: {
    type: String,
    default: "compact",
    validator: (v) => ["compact", "detail"].includes(v),
  },

  roleLabel: { type: String, default: "" },

  /** Текст адреса (мы не тянем адрес из стора внутри карточки) */
  addressTitle: { type: String, default: "" },
});

const emit = defineEmits(["open"]);

const fullName = computed(() =>
  [props.person.lastName, props.person.firstName, props.person.middleName]
    .filter(Boolean)
    .join(" ")
    .trim()
);

const birthYear = (value) => {
  const s = String(value || "").trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return Number(s.slice(0, 4));
  const y = Number(s);
  return Number.isFinite(y) ? y : null;
};

const yearsWord = (n) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return "лет";
  if (mod10 === 1) return "год";
  if (mod10 >= 2 && mod10 <= 4) return "года";
  return "лет";
};

const ageText = computed(() => {
  const y = birthYear(props.person.birthDate);
  if (!y) return "";
  const now = new Date().getFullYear();
  const age = now - y;
  if (!Number.isFinite(age) || age < 0 || age > 130) return "";
  return `${age} ${yearsWord(age)}`;
});

/** YYYY-MM-DD -> DD.MM.YYYY */
const formatDateRu = (value) => {
  const s = String(value || "").trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [yyyy, mm, dd] = s.split("-");
    return `${dd}.${mm}.${yyyy}`;
  }
  return s;
};

const birthDateText = computed(() => (props.person.birthDate ? formatDateRu(props.person.birthDate) : ""));
</script>