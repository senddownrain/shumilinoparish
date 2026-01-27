<template>
  <v-card>
    <v-card-title class="d-flex flex-column align-start">
      <div class="text-h6">
        {{ fullAddress }}
      </div>
      <div class="text-subtitle-2 text-muted">
        Домашний телефон:
        <span v-if="address.phoneHome">{{ address.phoneHome }}</span>
        <span v-else class="text-disabled">не указан</span>
      </div>
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <div class="mb-2">
            <strong>Населённый пункт:</strong>
            {{ address.localityType }} {{ address.localityName }}
          </div>
          <div class="mb-2">
            <strong>Улица:</strong> {{ address.street }}
          </div>
          <div class="mb-2">
            <strong>Дом:</strong> {{ address.house }}
          </div>
          <div class="mb-2" v-if="address.apartment">
            <strong>Квартира:</strong> {{ address.apartment }}
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="mb-2">
            <strong>Визиты (годы):</strong>
            <span v-if="address.visitYears?.length">
              {{ address.visitYears.join(', ') }}
            </span>
            <span v-else class="text-disabled">нет данных о визитах</span>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  address: {
    type: Object,
    required: true,
  },
});

const fullAddress = computed(() => {
  const a = props.address;
  const apt = a.apartment ? `, кв. ${a.apartment}` : '';
  return `${a.localityType} ${a.localityName}, ул. ${a.street}, д. ${a.house}${apt}`;
});
</script>