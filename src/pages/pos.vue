
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useProductStore, type Product } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useDisplay } from 'vuetify'
import ProductCard from '@/components/ProductCard.vue'
import CartSidebar from '@/components/CartSidebar.vue'

// Stores
const productStore = useProductStore()
const cartStore = useCartStore()

// UI State
const { mobile, mdAndUp, lgAndUp } = useDisplay()
const barcodeInput = ref('')
const searchRef = ref<any>(null)
const selectedIdx = ref(-1) // For keyboard navigation
const showCartMobile = ref(false)

// Formatting
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

// Actions
const onBarcodeSubmit = () => {
    if (!barcodeInput.value) return;
    
    const product = productStore.findProductByBarcode(barcodeInput.value);
    if (product) {
        cartStore.addToCart(product);
        // Visual feedback (Toast/Flash) if needed
        barcodeInput.value = '';
    } else {
        // Handle not found
        console.warn('Product not found for barcode:', barcodeInput.value);
    }
};

const handleProductClick = (product: Product) => {
    cartStore.addToCart(product);
};

// Keyboard Shortcuts
const handleKeys = (e: KeyboardEvent) => {
    // 1. Focus search with '/' or 'F2'
    if (e.key === '/' || e.key === 'F2') {
        e.preventDefault();
        searchRef.value?.focus();
    }
    
    // 2. Clear with 'Escape'
    if (e.key === 'Escape') {
        productStore.searchQuery = '';
        selectedIdx.value = -1;
    }

    // 3. Grid Navigation
    const items = productStore.filteredProducts;
    if (items.length === 0) return;

    if (e.key === 'ArrowRight') {
        selectedIdx.value = (selectedIdx.value + 1) % items.length;
    } else if (e.key === 'ArrowLeft') {
        selectedIdx.value = (selectedIdx.value - 1 + items.length) % items.length;
    } else if (e.key === 'ArrowDown') {
        const cols = lgAndUp.value ? 4 : (mdAndUp.value ? 3 : 2);
        selectedIdx.value = Math.min(items.length - 1, selectedIdx.value + cols);
    } else if (e.key === 'ArrowUp') {
        const cols = lgAndUp.value ? 4 : (mdAndUp.value ? 3 : 2);
        selectedIdx.value = Math.max(0, selectedIdx.value - cols);
    } else if (e.key === 'Enter' && selectedIdx.value !== -1) {
        // If not focusing an input, add the selected product
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT') {
            const product = items[selectedIdx.value];
            if (product) {
                cartStore.addToCart(product);
            }
        }
    }
}

// Watchers
watch(() => productStore.searchQuery, () => {
    selectedIdx.value = -1; // Reset selection on filter
});

onMounted(() => {
    window.addEventListener('keydown', handleKeys);
    // Autofocus search on load
    searchRef.value?.focus();
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeys);
});
</script>

<template>
  <v-container fluid class="pa-0 h-screen overflow-hidden bg-grey-lighten-4 pos-interface">
    <v-row no-gutters class="fill-height">
        
      <!-- LEFT CONTENT: Products -->
      <v-col cols="12" md="8" lg="9" class="d-flex flex-column h-screen overflow-hidden border-r">
        
        <!-- Header: Search & Info -->
        <div class="pa-4 bg-white border-b d-flex align-center gap-4">
            <v-text-field
                ref="searchRef"
                v-model="productStore.searchQuery"
                v-model:search="barcodeInput"
                placeholder="Scan Barcode or Search Product... (F2)"
                prepend-inner-icon="mdi-magnify"
                append-inner-icon="mdi-barcode-scan"
                variant="solo"
                flat
                bg-color="grey-lighten-4"
                rounded="lg"
                hide-details
                class="flex-grow-1"
                @keyup.enter="onBarcodeSubmit"
            ></v-text-field>

            <v-btn icon color="primary" variant="flat" class="rounded-lg d-md-none" @click="showCartMobile = true">
                <v-badge :content="cartStore.itemCount" color="error" v-if="cartStore.itemCount > 0">
                    <v-icon>mdi-cart</v-icon>
                </v-badge>
                <v-icon v-else>mdi-cart</v-icon>
            </v-btn>
        </div>

        <!-- Categories: Horizontal Scroll -->
        <div class="px-4 py-2 bg-white border-b overflow-x-auto whitespace-nowrap scrollbar-hide">
            <v-chip-group
                v-model="productStore.activeCategory"
                mandatory
                selected-class="bg-primary text-white"
            >
                <v-chip
                    v-for="cat in productStore.categories"
                    :key="cat"
                    :value="cat"
                    variant="tonal"
                    rounded="lg"
                    @click="productStore.setCategory(cat)"
                >
                    {{ cat }}
                </v-chip>
            </v-chip-group>
        </div>

        <!-- Product Grid -->
        <div class="flex-grow-1 overflow-y-auto pa-4 product-scroller">
            <v-row>
                <v-col 
                    v-for="(product, index) in productStore.filteredProducts" 
                    :key="product.id"
                    cols="6"
                    sm="4"
                    lg="3"
                >
                    <ProductCard 
                        :product="product" 
                        :class="{ 'selected-card': selectedIdx === index }"
                        @click="handleProductClick(product)"
                    />
                </v-col>
            </v-row>
            
            <!-- Empty State -->
            <div v-if="productStore.filteredProducts.length === 0" class="fill-height d-flex flex-column align-center justify-center text-grey opacity-50">
                <v-icon icon="mdi-magnify-remove" size="80" class="mb-4"></v-icon>
                <div class="text-h6">No products found</div>
                <div class="text-caption">Try adjusting your filters</div>
            </div>
        </div>
      </v-col>

      <!-- RIGHT CONTENT: Cart sidebar -->
      <v-col 
        v-if="mdAndUp || showCartMobile" 
        :cols="showCartMobile ? 12 : 4" 
        :lg="3" 
        :class="{ 'mobile-overlay': showCartMobile }" 
        class="bg-white d-flex flex-column h-screen overflow-hidden shadow-left"
      >
          <CartSidebar @close="showCartMobile = false" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.pos-interface {
    font-family: 'Inter', sans-serif;
}

.product-scroller::-webkit-scrollbar {
    width: 6px;
}
.product-scroller::-webkit-scrollbar-thumb {
    background: #e0e0e0;
    border-radius: 10px;
}


.mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.shadow-left {
    box-shadow: -4px 0 15px rgba(0,0,0,0.05);
}

.animate__animated {
    animation-duration: 0.3s;
}

@keyframes fadeInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
}
.animate__fadeInRight {
    animation-name: fadeInRight;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
.animate__fadeIn {
    animation-name: fadeIn;
}
</style>
