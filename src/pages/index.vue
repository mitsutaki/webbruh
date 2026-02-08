
<script setup lang="ts">
import { useProductStore } from '@/stores/products';
import ProductCard from '@/components/ProductCard.vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const store = useProductStore();
const authStore = useAuthStore();
const router = useRouter();
const { filteredProducts, activeCategory } = storeToRefs(store);

onMounted(() => {
    if (authStore.user?.role === 'ADMIN') {
        router.push('/admin/dashboard');
    }
});
</script>

<template>
  <div class="h-100">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5 font-weight-bold">{{ activeCategory }} Menu</h1>
      <span class="text-caption text-medium-emphasis">
         {{ filteredProducts.length }} items found
      </span>
    </div>

    <v-row v-if="filteredProducts.length > 0">
      <v-col
        v-for="product in filteredProducts"
        :key="product.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
      >
        <ProductCard :product="product" />
      </v-col>
    </v-row>

    <div v-else class="d-flex flex-column align-center justify-center h-50 pt-12">
        <v-icon icon="mdi-food-off" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
        <div class="text-h6 text-medium-emphasis">No products found</div>
        <div class="text-body-2 text-disabled">Try changing the category or search term</div>
    </div>
  </div>
</template>
