<!-- src/App.vue -->
<template>
  <v-app>
    <v-app-bar color="primary" density="comfortable" elevation="1">
      <!-- Назад (если включено страницей) -->
      <v-btn
        v-if="appUi.showBack"
        icon="mdi-arrow-left"
        variant="text"
        @click="goBack"
      />

      <v-app-bar-title>{{ appBarTitle }}</v-app-bar-title>

      <v-spacer />

      <!-- Action-кнопки справа (задаёт страница) -->
      <template v-for="(a, idx) in appUi.actions" :key="idx">
        <v-btn
          :icon="a.icon"
          variant="text"
          :disabled="!!a.disabled"
          :title="a.label || ''"
          @click="onActionClick(a)"
        />
      </template>

      <!-- Tabs только на md+ -->
      <v-tabs
        v-if="mdAndUp"
        v-model="topTab"
        fixed-tabs
        class="ml-2"
      >
        <v-tab value="addresses" @click="goAddresses">Адреса</v-tab>
        <v-tab value="people" @click="goPeople">Люди</v-tab>
      </v-tabs>
    </v-app-bar>

    <v-main>
      <v-container :fluid="true" :class="containerClass">
        <router-view />
      </v-container>
    </v-main>

    <!-- Bottom navigation для мобилки -->
    <v-bottom-navigation
      v-if="smAndDown"
      v-model="bottomNav"
      color="primary"
      grow
    >
      <v-btn value="addresses" @click="goAddresses">
        <v-icon>mdi-home-search-outline</v-icon>
        <span>Адреса</span>
      </v-btn>

      <v-btn value="people" @click="goPeople">
        <v-icon>mdi-account-search-outline</v-icon>
        <span>Люди</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useAppUiStore } from './stores/appUi';

const route = useRoute();
const router = useRouter();
const appUi = useAppUiStore();

const { smAndDown, mdAndUp } = useDisplay();

const section = computed(() => {
  const name = route.name?.toString() || '';
  if (name.startsWith('People')) return 'people';
  return 'addresses';
});

const appBarTitle = computed(() => {
  // если страница выставила title — используем его
  if (appUi.title) return appUi.title;

  // иначе дефолт по разделу
  return section.value === 'people' ? 'Люди' : 'Картотека';
});



const containerClass = computed(() => (smAndDown.value ? 'pa-3' : 'pa-4'));

const bottomNav = computed({
  get: () => section.value,
  set: () => {},
});

const topTab = computed({
  get: () => section.value,
  set: () => {},
});

const goAddresses = () => router.push({ name: 'AddressList' });
const goPeople = () => router.push({ name: 'PeopleList' });

const goBack = () => {
  router.push(appUi.backTo || { name: 'AddressList' });
};

const onActionClick = (a) => {
  if (typeof a.onClick === 'function') return a.onClick();
  if (a.to) return router.push(a.to);
};

watch(
  () => route.fullPath,
  () => {
    appUi.clear();
  },
  { immediate: true }
);
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}
</style>