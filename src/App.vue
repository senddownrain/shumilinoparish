<!-- src/App.vue -->
<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>Shumilinoparish — Картотека</v-app-bar-title>
      <v-spacer />
      <v-tabs v-model="tab" fixed-tabs class="d-none d-sm-flex">
        <v-tab @click="go('AddressList')">
          Адреса
        </v-tab>
        <v-tab @click="go('PeopleList')">
          Люди
        </v-tab>
      </v-tabs>
    </v-app-bar>

    <v-main>
      <v-container class="py-4">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const tab = computed({
  get() {
    const name = route.name?.toString() || '';
    if (name.startsWith('Address')) return 0;
    if (name.startsWith('People')) return 1;
    return 0;
  },
  set() {
    // управление табами идёт через router
  },
});

const go = (name) => {
  router.push({ name });
};
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}
</style>