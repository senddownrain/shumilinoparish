<template>
  <div class="print-page">
    <!-- Непечатаемые кнопки -->
    <div class="no-print print-actions">
      <button class="btn" @click="printNow" :disabled="loadingAny">
        Печать / Сохранить в PDF
      </button>
      <button class="btn" @click="goBack">Назад</button>
    </div>

    <header class="report-header">
      <div class="report-title">Приходская картотека</div>
      <div class="report-meta">
        <div>Сформировано: {{ nowText }}</div>
        <div v-if="metaLine">Фильтры: {{ metaLine }}</div>
        <div v-if="loadingAny" class="muted">Загрузка данных…</div>
        <div v-else>Адресов: {{ addressesToPrint.length }}</div>
      </div>
    </header>

    <main v-if="!loadingAny">
      <section v-for="a in addressesToPrint" :key="a.id" class="address-block">
        <!-- Шапка адреса -->
        <div class="address-head">
          <div class="address-title">{{ formatAddressTitle(a) }}</div>

          <div class="address-sub">
            <span class="muted">{{ a.localityType }}</span>
            <span class="dot">•</span>
            <span>
              дом. тел:
              <strong v-if="a.phoneHome">{{ a.phoneHome }}</strong>
              <span v-else class="muted">—</span>
            </span>
            <span class="dot">•</span>
            <span>
              визиты:
              <span v-if="visitYearsSorted(a).length">
                {{ visitYearsSorted(a).join(", ") }}
              </span>
              <span v-else class="muted">—</span>
            </span>
          </div>

         
        </div>

        <!-- Супруги -->
        <div v-if="coupleByAddressId[a.id]" class="section">
          <div class="section-title">Супруги</div>

          <div class="table-wrap">
            <table class="wide-table">
              <thead>
                <tr>
                  <th class="col-who">Кто</th>
                  <th class="col-name">ФИО</th>
                  <th class="col-small">Пол</th>
                  <th class="col-med">Рожд.</th>
                  <th class="col-med">Религия</th>
                  <th class="col-med">Профессия</th>
                  <th class="col-med">Работа</th>
                  <th class="col-med">Месса/исповедь</th>
                  <th class="col-wide">Таинства</th>
                  <th class="col-med">Тел.</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td class="who">Муж</td>
                  <td class="name">{{ fullName(coupleByAddressId[a.id].husband) }}</td>
                  <td>{{ sexLabel(coupleByAddressId[a.id].husband) }}</td>
                  <td>{{ coupleByAddressId[a.id].husband.birthDate || "" }}</td>
                  <td>{{ coupleByAddressId[a.id].husband.religion || "" }}</td>
                  <td>{{ coupleByAddressId[a.id].husband.profession || "" }}</td>
                  <td>{{ coupleByAddressId[a.id].husband.workplace || "" }}</td>
                  <td>{{ coupleByAddressId[a.id].husband.massAndConfession || "" }}</td>
                  <td>{{ sacramentsLine(coupleByAddressId[a.id].husband) }}</td>
             
                  
                  <td>{{ coupleByAddressId[a.id].husband.phone || "" }}</td>
                </tr>

                <tr>
                  <td class="who">Жена</td>
                  <td class="name">{{ fullName(coupleByAddressId[a.id].wife) }}</td>
                  <td>{{ sexLabel(coupleByAddressId[a.id].wife) }}</td>
                  <td>{{ coupleByAddressId[a.id].wife.birthDate || "" }}</td>
                  <td>{{ coupleByAddressId[a.id].wife.religion || "" }}</td>
                  <td>{{ coupleByAddressId[a.id].wife.profession || "" }}</td>
                  <td>{{ coupleByAddressId[a.id].wife.workplace || "" }}</td>
                  <td>{{ coupleByAddressId[a.id].wife.massAndConfession || "" }}</td>
                  <td>{{ sacramentsLine(coupleByAddressId[a.id].wife) }}</td>
                  <td>{{ coupleByAddressId[a.id].wife.phone || "" }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="marriage-box">
            <div class="section-subtitle">Брак</div>
            <div class="kv">
              <span><strong>Статус:</strong> {{ marriageStatusLabel(coupleByAddressId[a.id].marriage?.status) }}</span>
             <span class="dot">•</span>
              <span><strong>Год гражданского:</strong> {{ coupleByAddressId[a.id].marriage?.civilMarriageYear ?? "" }}</span>
              <span class="dot">•</span>
              <span><strong>Год венчания:</strong> {{ coupleByAddressId[a.id].marriage?.churchMarriageYear ?? "" }}</span>
              <span class="dot">•</span>
              <span>
                <strong>Венчанный:</strong>
                {{
                  coupleByAddressId[a.id].marriage?.isChurchMarried === true
                    ? "да"
                    : coupleByAddressId[a.id].marriage?.isChurchMarried === false
                      ? "нет"
                      : ""
                }}
              </span>
             <span class="dot">•</span>
              <span v-if="coupleByAddressId[a.id].marriage?.status && coupleByAddressId[a.id].marriage?.status !== 'active'">
                <strong>Год (развод/вдовство):</strong> {{ coupleByAddressId[a.id].marriage?.divorceYear ?? "" }}
              </span>
<span class="dot">•</span>
              <!-- любые дополнительные поля брака (без id/ссылок) -->
              <span v-for="row in extraMarriageFields(coupleByAddressId[a.id].marriage)" :key="row.key" class="muted">
                <strong>{{ row.key }}:</strong> {{ row.value }}
              </span>
            </div>
          </div>
        </div>

        <!-- Дети -->
        <div class="section">
          <div class="section-title">
            Дети <span class="muted">({{ (childrenByAddressId[a.id] || []).length }})</span>
          </div>

          <div v-if="!(childrenByAddressId[a.id] || []).length" class="muted">—</div>

          <div v-else class="table-wrap">
            <table class="wide-table">
              <thead>
                <tr>
                  <th class="col-name">ФИО</th>
                  <th class="col-small">Пол</th>
                  <th class="col-med">Рожд.</th>
                  <th class="col-med">Религия</th>
                  <th class="col-wide">Таинства</th>
                  <th class="col-small">Катехезы</th>
                  <th class="col-med">Месса/исповедь</th>
                  <th class="col-med">Профессия</th>
                  <th class="col-med">Работа</th>
                  <th class="col-med">Тел.</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="c in childrenByAddressId[a.id]" :key="c.id">
                  <td class="name">{{ fullName(c) }}</td>
                  <td>{{ sexLabel(c) }}</td>
                  <td>{{ c.birthDate || "" }}</td>
                  <td>{{ c.religion || "" }}</td>
                  <td>{{ sacramentsLine(c) }}</td>
                  <td>{{ triLabel(c.catechesis) }}</td>
                  <td>{{ c.massAndConfession || "" }}</td>
                  <td>{{ c.profession || "" }}</td>
                  <td>{{ c.workplace || "" }}</td>
                  <td>{{ c.phone || "" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Другие жители / Жители -->
        <div class="section">
          <div class="section-title">
            {{ coupleByAddressId[a.id] ? "Другие жители" : "Жители" }}
            <span class="muted">({{ (residentsToShowByAddressId[a.id] || []).length }})</span>
          </div>

          <div v-if="!(residentsToShowByAddressId[a.id] || []).length" class="muted">—</div>

          <div v-else class="table-wrap">
            <table class="wide-table">
              <thead>
                <tr>
                  <th class="col-name">ФИО</th>
                  <th class="col-small">Пол</th>
                  <th class="col-med">Рожд.</th>
                  <th class="col-med">Религия</th>
                  <th class="col-med">Профессия</th>
                  <th class="col-med">Работа</th>
                  <th class="col-wide">Таинства</th>
                  <th class="col-small">Катехезы</th>
                  <th class="col-med">Месса/исповедь</th>
                  <th class="col-med">Тел.</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="p in residentsToShowByAddressId[a.id]" :key="p.id">
                  <td class="name">{{ fullName(p) }}</td>
                  <td>{{ sexLabel(p) }}</td>
                  <td>{{ p.birthDate || "" }}</td>
                  <td>{{ p.religion || "" }}</td>
                  <td>{{ p.profession || "" }}</td>
                  <td>{{ p.workplace || "" }}</td>
                  <td>{{ sacramentsLine(p) }}</td>
                  <td>{{ triLabel(p.catechesis) }}</td>
                  <td>{{ p.massAndConfession || "" }}</td>
                  <td>{{ p.phone || "" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>

    <main v-else class="muted">Подождите, данные загружаются…</main>
  </div>
</template>

<script setup>
import { computed, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAddressesStore } from "../stores/addresses";
import { usePeopleStore } from "../stores/people";
import { useMarriagesStore } from "../stores/marriages";

const route = useRoute();
const router = useRouter();

const addressesStore = useAddressesStore();
const peopleStore = usePeopleStore();
const marriagesStore = useMarriagesStore();

const nowText = new Date().toLocaleString("ru-RU");
const currentYear = new Date().getFullYear();

const loadingAny = computed(
  () => !!(addressesStore.loading || peopleStore.loading || marriagesStore.loading)
);

const normalize = (s) =>
  String(s || "")
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[.,;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const qSearch = computed(() => String(route.query.search || ""));
const qMode = computed(() => String(route.query.mode || "search"));
const qSettlement = computed(() => String(route.query.settlement || ""));

const metaLine = computed(() => {
  const parts = [];
  if (qMode.value === "todo") parts.push(`режим: нужно посетить (${currentYear})`);
  if (qSettlement.value) parts.push(`н.п.: ${qSettlement.value}`);
  if (qSearch.value) parts.push(`поиск: "${qSearch.value}"`);
  return parts.join(" · ");
});

const hasVisitedYear = (a, year) => {
  const years = Array.isArray(a?.visitYears) ? a.visitYears : [];
  return years.includes(Number(year));
};

const addressesToPrint = computed(() => {
  const term = normalize(qSearch.value);
  const settlement = normalize(qSettlement.value);

  let list = addressesStore.addresses || [];

  if (settlement) list = list.filter((a) => normalize(a.localityName) === settlement);
  if (qMode.value === "todo") list = list.filter((a) => !hasVisitedYear(a, currentYear));

  if (term) {
    list = list.filter((a) => {
      const hay = normalize(
        [a.localityName, a.street, a.house, a.apartment, a.phoneHome]
          .filter(Boolean)
          .join(" ")
      );
      return hay.includes(term);
    });
  }

  return [...list].sort((a, b) => {
    const aa = normalize(`${a.localityName} ${a.street} ${a.house} ${a.apartment}`);
    const bb = normalize(`${b.localityName} ${b.street} ${b.house} ${b.apartment}`);
    return aa.localeCompare(bb, "ru");
  });
});

const peopleById = computed(() => {
  const m = new Map();
  (peopleStore.people || []).forEach((p) => {
    if (p?.id) m.set(String(p.id), p);
  });
  return m;
});

const marriagesById = computed(() => {
  const m = new Map();
  (marriagesStore.marriages || []).forEach((x) => {
    if (x?.id) m.set(String(x.id), x);
  });
  return m;
});

const residentsByAddressId = computed(() => {
  const map = {};
  (peopleStore.people || []).forEach((p) => {
    if (!p?.addressId) return;
    const id = String(p.addressId);
    if (!map[id]) map[id] = [];
    map[id].push(p);
  });

  Object.keys(map).forEach((id) => {
    map[id] = map[id].slice().sort((a, b) => {
      const da = a.isDeceased ? 1 : 0;
      const db = b.isDeceased ? 1 : 0;
      if (da !== db) return da - db;
      const aa = normalize(`${a.lastName} ${a.firstName} ${a.middleName}`);
      const bb = normalize(`${b.lastName} ${b.firstName} ${b.middleName}`);
      return aa.localeCompare(bb, "ru");
    });
  });

  return map;
});

const formatAddressTitle = (a) => {
  const apt = a.apartment ? `, кв. ${a.apartment}` : "";
  return `${a.localityName}, ${a.street}, д. ${a.house}${apt}`;
};

const visitYearsSorted = (a) => {
  const years = Array.isArray(a?.visitYears) ? a.visitYears : [];
  return [...years].sort((x, y) => x - y);
};

const birthYear = (value) => {
  const s = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return Number(s.slice(0, 4));
  const y = Number(s);
  return Number.isFinite(y) ? y : null;
};

const estimateAge = (birthDateStr) => {
  const y = birthYear(birthDateStr);
  if (!y) return null;
  const age = currentYear - y;
  return Number.isFinite(age) ? age : null;
};

const marriageStatusLabel = (status) => {
  if (status === "active") return "активный";
  if (status === "divorced") return "разведены";
  if (status === "widowed") return "вдовство";
  return status || "";
};

/** первая ACTIVE свадьба, где оба супруга — жители этого адреса */
const coupleByAddressId = computed(() => {
  const out = {};
  const marriages = marriagesStore.marriages || [];

  for (const a of addressesToPrint.value) {
    const addrId = String(a.id);
    const residents = residentsByAddressId.value[addrId] || [];

    let found = null;
    for (const m of marriages) {
      if (m?.status !== "active") continue;

      const husband = residents.find((p) => p.id === m.husbandId);
      const wife = residents.find((p) => p.id === m.wifeId);

      if (husband && wife) {
        found = { marriage: m, husband, wife };
        break;
      }
    }
    if (found) out[addrId] = found;
  }

  return out;
});

/** дети по правилам */
const childrenByAddressId = computed(() => {
  const out = {};

  for (const a of addressesToPrint.value) {
    const addrId = String(a.id);
    const residents = residentsByAddressId.value[addrId] || [];
    const couple = coupleByAddressId.value[addrId];

    let children = [];
    if (couple?.husband && couple?.wife) {
      const fatherId = couple.husband.id;
      const motherId = couple.wife.id;

      children = residents
        .filter((p) => p.fatherId === fatherId && p.motherId === motherId)
        .sort((x, y) => String(x.birthDate || "").localeCompare(String(y.birthDate || "")));
    } else {
      children = residents
        .filter((p) => {
          const hasParents = !!(p.fatherId || p.motherId);
          const age = estimateAge(p.birthDate);
          const isChildByAge = age != null ? age < 18 : false;
          return hasParents || isChildByAge;
        })
        .sort((x, y) => String(x.birthDate || "").localeCompare(String(y.birthDate || "")));
    }

    out[addrId] = children;
  }

  return out;
});

/** жители для вывода: без супругов — все, с супругами — только “другие” */
const residentsToShowByAddressId = computed(() => {
  const out = {};

  for (const a of addressesToPrint.value) {
    const addrId = String(a.id);
    const residents = residentsByAddressId.value[addrId] || [];
    const couple = coupleByAddressId.value[addrId];
    const children = childrenByAddressId.value[addrId] || [];

    if (!couple) {
      out[addrId] = residents;
      continue;
    }

    const exclude = new Set();
    if (couple.husband) exclude.add(couple.husband.id);
    if (couple.wife) exclude.add(couple.wife.id);
    children.forEach((c) => exclude.add(c.id));

    out[addrId] = residents.filter((p) => !exclude.has(p.id));
  }

  return out;
});

const fullName = (p) =>
  [p?.lastName, p?.firstName, p?.middleName].filter(Boolean).join(" ").trim();

const sexLabel = (p) => {
  if (p?.sex === "male") return "муж";
  if (p?.sex === "female") return "жен";
  return "";
};

const triLabel = (v) => (v === true ? "да" : v === false ? "нет" : "");

const lifeStatus = (p) => {
  if (!p) return "";
  if (p.isDeceased === true) return `умер(ла)${p.deathYear ? " · " + p.deathYear : ""}`;
  return "";
};

const sacramentsLine = (p) => {
  const part = (flag, year, label) => {
    if (flag === true || year) return `${label}: ${year ? year : "есть"}`;
    if (flag === false) return `${label}: нет`;
    return `${label}:`;
  };
  return [
    part(p?.baptism, p?.baptismYear, "крещ."),
    part(p?.chrismation, p?.chrismationYear, "мироп."),
    part(p?.firstCommunion, p?.firstCommunionYear, "прич."),
  ].join(" ");
};

const parentsText = (person) => {
  const f = person?.fatherId ? peopleById.value.get(String(person.fatherId)) : null;
  const m = person?.motherId ? peopleById.value.get(String(person.motherId)) : null;

  const fn = f ? fullName(f) : "";
  const mn = m ? fullName(m) : "";

  if (fn && mn) return `${fn} и ${mn}`;
  return fn || mn || "";
};

const childrenNamesText = (person) => {
  const ids = Array.isArray(person?.childrenIds) ? person.childrenIds : [];
  const names = ids
    .map((id) => peopleById.value.get(String(id)))
    .filter(Boolean)
    .map((p) => fullName(p))
    .filter(Boolean);

  return names.join(", ");
};

const marriageStatusLabelShort = (s) => {
  if (s === "active") return "активн.";
  if (s === "divorced") return "развод";
  if (s === "widowed") return "вдовств.";
  return s || "";
};

const marriagesText = (person) => {
  const ids = Array.isArray(person?.marriageIds) ? person.marriageIds : [];
  const lines = ids
    .map((id) => marriagesById.value.get(String(id)))
    .filter(Boolean)
    .map((m) => {
      const spouseId =
        m.husbandId === person.id ? m.wifeId :
        m.wifeId === person.id ? m.husbandId :
        null;

      const spouse = spouseId ? peopleById.value.get(String(spouseId)) : null;
      const spouseName = spouse ? fullName(spouse) : "";

      const bits = [];
      const st = marriageStatusLabelShort(m.status);
      if (st) bits.push(st);
      if (m.civilMarriageYear) bits.push(`гражд.${m.civilMarriageYear}`);
      if (m.churchMarriageYear) bits.push(`венч.${m.churchMarriageYear}`);
      if (m.isChurchMarried === true) bits.push("венч.");

      const tail = bits.length ? ` (${bits.join(", ")})` : "";
      return `${spouseName}${tail}`;
    })
    .filter(Boolean);

  return lines.join(" · ");
};

/**
 * “Абсолютно вся информация” по человеку, но БЕЗ айдишников:
 * - выкидываем id, addressId, fatherId/motherId, childrenIds/marriageIds
 * - выкидываем поля, которые уже в таблице
 * - печатаем только непустые примитивы (string/number/boolean)
 */
const extraPersonText = (p) => {
  if (!p || typeof p !== "object") return "";

  const exclude = new Set([
    "id",
    "addressId",
    "fatherId",
    "motherId",
    "childrenIds",
    "marriageIds",

    // уже выводим в таблице
    "firstName",
    "lastName",
    "middleName",
    "sex",
    "birthDate",
    "profession",
    "workplace",
    "religion",
    "phone",
    "catechesis",
    "massAndConfession",
    "isDeceased",
    "deathYear",
    "baptism",
    "baptismYear",
    "chrismation",
    "chrismationYear",
    "firstCommunion",
    "firstCommunionYear",
  ]);

  const parts = [];
  for (const k of Object.keys(p)) {
    if (exclude.has(k)) continue;

    const v = p[k];
    if (v === undefined || v === null) continue;

    if (Array.isArray(v)) {
      // массивы почти всегда id/ссылки — не печатаем, чтобы не вылезли айдишники
      continue;
    }

    const t = typeof v;
    if (t === "string") {
      const s = v.trim();
      if (!s) continue;
      parts.push(`${k}: ${s}`);
    } else if (t === "number") {
      if (!Number.isFinite(v)) continue;
      parts.push(`${k}: ${v}`);
    } else if (t === "boolean") {
      parts.push(`${k}: ${v ? "да" : "нет"}`);
    } else {
      // объекты тоже часто содержат ссылки/мусор — не печатаем
      continue;
    }
  }

  return parts.join("; ");
};

/** все поля адреса без id */
const extraAddressFields = (a) => {
  const baseKeys = new Set([
    "id",
    "localityType",
    "localityName",
    "street",
    "house",
    "apartment",
    "phoneHome",
    "visitYears",
  ]);

  const rows = [];
  Object.keys(a || {}).forEach((k) => {
    if (baseKeys.has(k)) return;
    const v = a[k];
    if (v === undefined) return;

    let text = "";
    if (Array.isArray(v)) text = v.length ? v.join(", ") : "—";
    else if (v && typeof v === "object") text = JSON.stringify(v);
    else text = String(v);

    rows.push({ key: k, value: text || "—" });
  });

  return rows;
};

/** доп. поля брака (без id/ссылок) */
const extraMarriageFields = (m) => {
  if (!m || typeof m !== "object") return [];
  const baseKeys = new Set([
    "id",
    "husbandId",
    "wifeId",
    "status",
    "civilMarriageYear",
    "churchMarriageYear",
    "isChurchMarried",
    "divorceYear",
  ]);

  const rows = [];
  Object.keys(m).forEach((k) => {
    if (baseKeys.has(k)) return;
    const v = m[k];
    if (v === undefined || v === null) return;

    if (Array.isArray(v)) return; // не печатаем массивы (скорее всего id)
    const t = typeof v;
    if (t === "object") return;

    const text =
      t === "boolean" ? (v ? "да" : "нет") :
      String(v);

    if (String(text).trim() === "") return;

    rows.push({ key: k, value: text });
  });

  return rows;
};

const printNow = async () => {
  await nextTick();
  requestAnimationFrame(() => window.print());
};

const goBack = () => router.back();

onMounted(async () => {
  if (!addressesStore.addresses.length && !addressesStore.loading) {
    await addressesStore.fetchAddresses();
  }
  if (!peopleStore.people.length && !peopleStore.loading) {
    await peopleStore.fetchPeople();
  }
  if (!marriagesStore.marriages.length && !marriagesStore.loading) {
    await marriagesStore.fetchMarriages();
  }
});
</script>

<style>
/* экран */
.print-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 16px;
  color: #111;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
}

.print-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.btn {
  border: 1px solid #ccc;
  padding: 8px 10px;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.report-header {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
}

.report-title {
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 6px;
}

.report-meta {
  font-size: 12px;
  line-height: 1.4;
}

.address-block {
  border: 1px solid #e9e9e9;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
  background: #fff;
}

.address-title {
  font-size: 16px;
  font-weight: 900;
}

.address-sub {
  margin-top: 4px;
  font-size: 12px;
}

.addr-kv {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
}

.dot {
  margin: 0 6px;
}

.section {
  margin-top: 12px;
}

.section-title {
  font-weight: 900;
  margin-bottom: 8px;
}

.section-subtitle {
  font-weight: 900;
  margin-bottom: 6px;
}

.kv {
  font-size: 12px;
  line-height: 1.5;
}

.muted {
  color: #666;
}

/* таблицы */
.table-wrap {
  overflow: hidden;
}

.wide-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10.5px;
  line-height: 1.25;
}

.wide-table th,
.wide-table td {
  border: 1px solid #e3e3e3;
  padding: 6px 6px;
  vertical-align: top;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.wide-table th {
  background: #f7f7f7;
  font-weight: 900;
  text-align: left;
}

.wide-table td.name {
  font-weight: 800;
}

.wide-table td.who {
  font-weight: 900;
  white-space: nowrap;
}

.col-who { width: 48px; }
.col-name { width: 170px; }
.col-small { width: 56px; }
.col-med { width: 90px; }
.col-wide { width: 140px; }

.marriage-box {
  margin-top: 10px;
  border-top: 1px dashed #e5e5e5;
  padding-top: 10px;
}

/* печать */
@media print {
  .no-print {
    display: none !important;
  }

  @page {
    size: A4;
    margin: 10mm;
  }

  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print-page {
    max-width: none;
    margin: 0;
    padding: 0;
  }

  /* несколько адресов на страницу, но не рвём блок адреса */
  .address-block {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .wide-table th {
    background: #f2f2f2 !important;
  }

  .wide-table tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>