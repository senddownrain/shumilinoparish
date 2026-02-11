<template>
  <v-card flat="tile">
    <v-card-title class="pb-1">
      <div class="text-h6 text-truncate">
        {{ fullAddress }}
      </div>

      <div v-if="address.phoneHome" class="text-body-2 text-medium-emphasis mt-1">
        <v-icon size="16" class="me-1">mdi-phone</v-icon>
        {{ address.phoneHome }}
      </div>
    </v-card-title>

    <v-card-text class="pt-2">
      <div v-if="address.apartment" class="text-body-2">
        <span class="text-medium-emphasis">Квартира:</span> {{ address.apartment }}
      </div>

      <!-- Если есть какие-то дополнительные поля — лучше показывать только когда заполнены -->
      <div v-if="address.notes" class="text-body-2 mt-2">
        <span class="text-medium-emphasis">Примечания:</span> {{ address.notes }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  address: { type: Object, required: true },
});

const fullAddress = computed(() => {
  const a = props.address;
  const apt = a.apartment ? `, кв. ${a.apartment}` : '';
  return `${a.localityType} ${a.localityName}, ул. ${a.street}, д. ${a.house}${apt}`;
});
</script>