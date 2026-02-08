
<script setup lang="ts">
import { computed } from 'vue';
import type { Product } from '@/stores/products';
import { useCartStore } from '@/stores/cart';

const props = defineProps<{
  product: Product;
}>();

const cartStore = useCartStore();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

const addToCart = () => {
    cartStore.addToCart(props.product);
};
</script>

<template>
  <v-hover v-slot="{ isHovering, props: hoverProps }">
    <v-card
      v-bind="hoverProps"
      class="mx-auto rounded-xl product-card overflow-hidden"
      :elevation="isHovering ? 12 : 2"
      :class="{ 'on-hover': isHovering }"
      @click="addToCart"
    >
      <div class="image-container">
        <v-img
          :src="product.image"
          height="160"
          cover
          class="product-image transition-swing"
          :class="{ 'zoom-effect': isHovering }"
        >
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-row>
          </template>
          
          <div class="chip-container ma-2">
            <v-chip
              size="x-small"
              color="white"
              variant="flat"
              class="font-weight-bold elevation-2 text-uppercase"
            >
              {{ product.category }}
            </v-chip>
          </div>

          <!-- Quick Action Overlay -->
          <v-fade-transition>
            <div v-if="isHovering" class="d-flex align-center justify-center fill-height quick-add-overlay">
              <v-btn
                icon="mdi-plus"
                color="white"
                variant="flat"
                size="large"
                class="animate__animated animate__zoomIn animate__faster"
              ></v-btn>
            </div>
          </v-fade-transition>
        </v-img>
      </div>

      <v-card-text class="pa-3">
        <div class="text-subtitle-1 font-weight-bold text-truncate mb-1 product-title">
          {{ product.name }}
        </div>
        <div class="d-flex justify-space-between align-center">
          <div class="text-primary font-weight-black text-h6">
             {{ formatPrice(product.price).split(',')[0] }}
          </div>
          <div class="text-caption text-grey-darken-1 font-weight-medium bg-grey-lighten-4 px-2 py-1 rounded-pill">
            Stock: {{ product.stock }}
          </div>
        </div>
      </v-card-text>
      
      <v-divider v-if="isHovering" class="mx-4 animate__animated animate__fadeIn"></v-divider>
      
      <v-btn
        v-if="isHovering"
        block
        variant="text"
        color="primary"
        size="small"
        class="text-none font-weight-bold animate__animated animate__slideInUp animate__faster"
      >
        Add to Order
      </v-btn>
    </v-card>
  </v-hover>
</template>

<style scoped>
.product-card {
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    cursor: pointer;
    border: 1px solid rgba(0,0,0,0.05);
}

.on-hover {
    transform: translateY(-8px);
}

.image-container {
    overflow: hidden;
    position: relative;
    background: #f5f5f5;
}

.product-image {
    transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.zoom-effect {
    transform: scale(1.1);
}

.quick-add-overlay {
    background: rgba(var(--v-theme-primary), 0.4);
    backdrop-filter: blur(2px);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.product-title {
    color: #2c3e50;
    transition: color 0.3s;
}

.on-hover .product-title {
    color: rgb(var(--v-theme-primary));
}

.chip-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
}

.product-card:active {
    transform: scale(0.95) translateY(-4px);
    transition: transform 0.1s;
}
</style>
