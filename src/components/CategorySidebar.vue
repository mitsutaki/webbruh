
<script setup lang="ts">
import { useProductStore } from '@/stores/products';
import { storeToRefs } from 'pinia';

const store = useProductStore();
const { categories, activeCategory } = storeToRefs(store);

const icons: Record<string, string> = {
    'All': 'mdi-apps',
    'Coffee': 'mdi-coffee',
    'Foods': 'mdi-food',
    'Pastry': 'mdi-cookie',
    'Beverages': 'mdi-cup',
};
</script>

<template>
  <v-list nav>
    <v-list-subheader class="text-uppercase font-weight-bold ml-2">Categories</v-list-subheader>
    
    <v-list-item
      v-for="category in categories"
      :key="category"
      :value="category"
      :active="activeCategory === category"
      color="primary"
      rounded="lg"
      class="mb-1"
      @click="store.setCategory(category)"
    >
      <template v-slot:prepend>
        <v-icon :icon="icons[category] || 'mdi-tag-outline'"></v-icon>
      </template>
      <v-list-item-title class="text-body-2 font-weight-medium">
        {{ category }}
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>
