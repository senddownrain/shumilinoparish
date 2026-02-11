<template>
  <div>
    <v-card>
      <v-card-text>
        <PersonForm
          :value="formData"
          @update:value="formData = $event"
          ref="formRef"
          @validity-change="onValidityChange"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";

import { usePeopleStore } from "../stores/people";
import { useAppUiStore } from "../stores/appUi";
import PersonForm from "../components/PersonForm.vue";

const router = useRouter();
const peopleStore = usePeopleStore();
const appUi = useAppUiStore();

const formRef = ref(null);
const saving = ref(false);
const isValid = ref(false);

const formData = ref({
  firstName: "",
  lastName: "",
  middleName: "",
  sex: "",
  birthDate: "",
  profession: "",
  workplace: "",
  religion: "",
  phone: "",
  baptismYear: null,
  chrismationYear: null,
  firstCommunionYear: null,
  catechesis: null,
  massAndConfession: "",
  addressId: null,
  fatherId: null,
  motherId: null,
  childrenIds: [],
  isDeceased: false,
  deathYear: null,
  marriageIds: [],
});

const goBack = () => {
  router.push({ name: "PeopleList" });
};

const onValidityChange = (val) => {
  isValid.value = val;
};

const save = async () => {
  if (!formRef.value || !(await formRef.value.validate())) return;

  saving.value = true;
  try {
    const id = await peopleStore.addPerson(formData.value);
    router.push({ name: "PeopleDetail", params: { id } });
  } catch (e) {
    console.error("Ошибка при создании человека:", e);
  } finally {
    saving.value = false;
  }
};

const setAppBar = () => {
  appUi.set({
    title: "Новый человек",
    showBack: true,
    backTo: { name: "PeopleList" },
    actions: [
      {
        icon: "mdi-content-save",
        label: "Сохранить",
        onClick: save,
        disabled: !isValid.value || saving.value,
        loading: saving.value,
      },
    ],
  });
};

onMounted(() => setAppBar());
watch([isValid, saving], () => setAppBar());
onUnmounted(() => appUi.reset());
</script>