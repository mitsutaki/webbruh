
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const cart = ref<any[]>([]);
const total = ref(0);
const change = ref(0);
const state = ref<'IDLE' | 'CART' | 'SUCCESS'>('IDLE');

const channel = new BroadcastChannel('customer_display_channel');

// Idle Animation Carousel
const images = [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507133750069-bef72f3704a9?auto=format&fit=crop&w=800&q=80'
];
const currentImage = ref(0);

onMounted(() => {
    // Notify main window we are ready
    channel.postMessage('DISPLAY_READY');

    channel.onmessage = (event) => {
        const { type, payload } = event.data;

        if (type === 'UPDATE_CART') {
            cart.value = payload.items;
            total.value = payload.total;
            if (cart.value.length > 0) {
                state.value = 'CART';
            } else {
                state.value = 'IDLE';
            }
        } else if (type === 'TRANSACTION_COMPLETE') {
            state.value = 'SUCCESS';
            change.value = payload.change;
            
            // Go back to idle after 5 seconds
            setTimeout(() => {
                state.value = 'IDLE';
                cart.value = [];
                total.value = 0;
            }, 8000);
        }
    };

    // Slideshow
    setInterval(() => {
        currentImage.value = (currentImage.value + 1) % images.length;
    }, 5000);
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};
</script>

<template>
  <v-app>
    <v-main class="bg-black h-screen overflow-hidden">
        
        <!-- IDLE STATE (Ads / Slideshow) -->
        <div v-if="state === 'IDLE'" class="h-100 relative">
            <v-img 
                :src="images[currentImage]" 
                cover 
                class="h-100"
                transition="fade-transition"
            >
                <div class="fill-height d-flex flex-column align-center justify-center bg-black-overlay text-white">
                    <h1 class="text-h2 font-weight-bold mb-4">Welcome to KasirChan</h1>
                    <p class="text-h5">Best Coffee in Town</p>
                </div>
            </v-img>
        </div>

        <!-- CART STATE -->
        <div v-else-if="state === 'CART'" class="d-flex h-100">
            <!-- Left: List -->
            <div class="flex-grow-1 bg-white text-black pa-6 d-flex flex-column" style="width: 60%">
                <div class="text-h4 font-weight-bold mb-6">Your Order</div>
                <v-list class="flex-grow-1 overflow-y-auto">
                     <v-list-item
                        v-for="item in cart"
                        :key="item.product.id"
                        class="px-0 py-2 border-b"
                     >
                        <template v-slot:prepend>
                            <v-avatar rounded="lg" size="64" class="mr-4">
                                <v-img :src="item.product.image" cover></v-img>
                            </v-avatar>
                        </template>
                        <v-list-item-title class="text-h6 font-weight-bold">
                            {{ item.product.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-h6 mt-1">
                            {{ item.quantity }} x {{ formatPrice(item.product.price) }}
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <div class="text-h6 font-weight-bold">
                                {{ formatPrice(item.product.price * item.quantity) }}
                            </div>
                        </template>
                     </v-list-item>
                </v-list>
            </div>
            
            <!-- Right: Total -->
            <div class="bg-primary d-flex flex-column justify-center align-center pa-8 text-white" style="width: 40%">
                <div class="text-h4 text-uppercase mb-2 opacity-75">Total to Pay</div>
                <div class="text-h1 font-weight-bold">{{ formatPrice(total) }}</div>
            </div>
        </div>

        <!-- SUCCESS STATE -->
        <div v-else-if="state === 'SUCCESS'" class="h-100 bg-success d-flex flex-column align-center justify-center text-white text-center">
            <v-icon icon="mdi-check-circle" size="120" class="mb-6"></v-icon>
            <h1 class="text-h2 font-weight-bold mb-4">Payment Successful!</h1>
            <p class="text-h4">Thank You</p>
            <div class="mt-8 pa-6 bg-white text-success rounded-lg elevation-4">
                <div class="text-h6 text-uppercase">Change Due</div>
                <div class="text-h3 font-weight-bold">{{ formatPrice(change) }}</div>
            </div>
        </div>

    </v-main>
  </v-app>
</template>

<style scoped>
.bg-black-overlay {
    background-color: rgba(0,0,0,0.5);
}
</style>
