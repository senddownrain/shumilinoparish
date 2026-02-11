<template>
  <div class="person-block">
    <div class="person-name-row">
      <div class="person-name">{{ fullName }}</div>
      <div v-if="deceasedLine" class="tag">{{ deceasedLine }}</div>
    </div>

    <div class="person-kv">
      <div v-if="sexLabel"><strong>Пол:</strong> {{ sexLabel }}</div>
      <div v-if="birthText"><strong>Рожд.:</strong> {{ birthText }}</div>
      <div v-if="phoneText"><strong>Тел.:</strong> {{ phoneText }}</div>
      <div v-if="religionText"><strong>Религия:</strong> {{ religionText }}</div>

      <div v-if="professionText"><strong>Профессия:</strong> {{ professionText }}</div>
      <div v-if="workplaceText"><strong>Работа:</strong> {{ workplaceText }}</div>

      <div><strong>Катехезы:</strong> {{ catechesisText }}</div>
      <div v-if="massText"><strong>Месса/исповедь:</strong> {{ massText }}</div>

      <div><strong>Таинства:</strong> {{ sacramentsLine }}</div>

      <div v-if="showParentsLine && fatherName"><strong>Отец:</strong> {{ fatherName }}</div>
      <div v-if="showParentsLine && motherName"><strong>Мать:</strong> {{ motherName }}</div>

      <div v-if="childrenNames.length"><strong>Дети:</strong> {{ childrenNames.join(", ") }}</div>
      <div v-if="marriageLines.length"><strong>Браки:</strong> {{ marriageLines.join(" · ") }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  person: { type: Object, required: true },
  peopleById: { type: Object, required: true },     // Map(id -> person)
  marriagesById: { type: Object, required: true },  // Map(id -> marriage)
  showParentsLine: { type: Boolean, default: true },
});

const fullNameOf = (p) =>
  p ? [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ").trim() : "";

const fullName = computed(() => fullNameOf(props.person) || "");

const sexLabel = computed(() => {
  if (props.person?.sex === "male") return "муж";
  if (props.person?.sex === "female") return "жен";
  return "";
});

const birthText = computed(() => String(props.person?.birthDate || "").trim());
const phoneText = computed(() => String(props.person?.phone || "").trim());
const religionText = computed(() => String(props.person?.religion || "").trim());
const professionText = computed(() => String(props.person?.profession || "").trim());
const workplaceText = computed(() => String(props.person?.workplace || "").trim());
const massText = computed(() => String(props.person?.massAndConfession || "").trim());

const deceasedLine = computed(() => {
  if (props.person?.isDeceased) {
    return `умер(ла)${props.person.deathYear ? " · " + props.person.deathYear : ""}`;
  }
  return "";
});

const catechesisText = computed(() => {
  if (props.person?.catechesis === true) return "да";
  if (props.person?.catechesis === false) return "нет";
  return "—";
});

const sacramentsLine = computed(() => {
  const p = props.person || {};
  const part = (flag, year, label) => {
    if (flag === true || year) return `${label}: ${year ? year : "есть"}`;
    if (flag === false) return `${label}: нет`;
    return `${label}: —`;
  };
  return [
    part(p.baptism, p.baptismYear, "крещение"),
    part(p.chrismation, p.chrismationYear, "миропомаз."),
    part(p.firstCommunion, p.firstCommunionYear, "причастие"),
  ].join(", ");
});

const fatherName = computed(() => {
  const id = props.person?.fatherId ? String(props.person.fatherId) : "";
  const p = id ? props.peopleById.get(id) : null;
  return p ? fullNameOf(p) : "";
});

const motherName = computed(() => {
  const id = props.person?.motherId ? String(props.person.motherId) : "";
  const p = id ? props.peopleById.get(id) : null;
  return p ? fullNameOf(p) : "";
});

const childrenNames = computed(() => {
  const ids = Array.isArray(props.person?.childrenIds) ? props.person.childrenIds : [];
  return ids
    .map((id) => props.peopleById.get(String(id)))
    .filter(Boolean)
    .map((p) => fullNameOf(p))
    .filter(Boolean);
});

const statusLabel = (s) => {
  if (s === "active") return "активный";
  if (s === "divorced") return "разведены";
  if (s === "widowed") return "вдовство";
  return s || "—";
};

const marriageLines = computed(() => {
  const ids = Array.isArray(props.person?.marriageIds) ? props.person.marriageIds : [];
  return ids
    .map((id) => props.marriagesById.get(String(id)))
    .filter(Boolean)
    .map((m) => {
      const spouseId =
        m.husbandId === props.person.id ? m.wifeId :
        m.wifeId === props.person.id ? m.husbandId :
        null;

      const spouse = spouseId ? props.peopleById.get(String(spouseId)) : null;
      const spouseName = spouse ? fullNameOf(spouse) : "—";

      const years = [
        m.civilMarriageYear ? `гражд.: ${m.civilMarriageYear}` : null,
        m.churchMarriageYear ? `венч.: ${m.churchMarriageYear}` : null,
        m.isChurchMarried === true ? "венчанный" : null,
      ].filter(Boolean).join(", ");

      return `${spouseName} (${statusLabel(m.status)}${years ? "; " + years : ""})`;
    });
});
</script>

<style scoped>
.person-block { font-size: 12px; line-height: 1.45; }
.person-name-row { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.person-name { font-weight: 800; font-size: 13px; }
.person-kv > div { margin-top: 2px; }
.tag { font-size: 11px; border: 1px solid #ccc; padding: 1px 6px; border-radius: 999px; white-space: nowrap; }
</style>