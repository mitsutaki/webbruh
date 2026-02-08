
<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import { computed, ref, watch } from 'vue';
import Receipt from '@/components/Receipt.vue';

const cartStore = useCartStore();
const emit = defineEmits(['close']);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

// UI State for Discount Input
const showDiscountInput = ref(false);
const discountInputVal = ref(0);
const discountInputType = ref<'NOMINAL' | 'PERCENTAGE'>('NOMINAL');

// UI State for Receipt & QRIS Modal
const showReceipt = ref(false);
const showQRISModal = ref(false);

// Payment Input
const paymentInput = ref(0);
const paymentError = ref('');

// Item Deletion Confirmation
const showDeleteConfirm = ref(false);
const itemToDelete = ref<number | null>(null);

function requestDelete(productId: number) {
    itemToDelete.value = productId;
    showDeleteConfirm.value = true;
}

function confirmDelete() {
    if (itemToDelete.value !== null) {
        cartStore.removeItem(itemToDelete.value);
        itemToDelete.value = null;
        showDeleteConfirm.value = false;
    }
}

// Watch for changes in store payment amount to update local (simulating two-way)
watch(() => cartStore.paymentAmount, (newVal) => {
    paymentInput.value = newVal;
});

function applyDiscount() {
    cartStore.setDiscount(discountInputVal.value, discountInputType.value);
    showDiscountInput.value = false;
}

function updatePayment() {
    cartStore.setPaymentAmount(paymentInput.value);
}

function handlePayment(method: string) {
    paymentError.value = '';
    
    if (cartStore.cartItems.length === 0) return;

    if (method === 'QRIS') {
        showQRISModal.value = true;
        return;
    }

    // Check if payment amount is sufficient for Cash payment
    if (method === 'CASH' && paymentInput.value < cartStore.total) {
        paymentError.value = `Insufficient cash. Need ${formatPrice(cartStore.total - paymentInput.value)} more.`;
        return;
    }

    const trx = cartStore.processPayment(method);
    if (trx) {
        showReceipt.value = true;
    }
}

function confirmQRISPayment() {
    const trx = cartStore.processPayment('QRIS');
    if (trx) {
        showQRISModal.value = false;
        showReceipt.value = true;
    }
}

function printReceipt() {
    window.print();
}

function closeReceipt() {
    showReceipt.value = false;
}

// Quick Payment Suggestions (Exact, +5k, +10k, Next 50k, Next 100k)
const quickAmounts = computed(() => {
    const total = cartStore.total;
    if (total === 0) return [];
    
    const amounts = new Set<number>();
    amounts.add(total); // Exact
    
    // Round up to nearest 10k, 50k, 100k
    amounts.add(Math.ceil(total / 10000) * 10000);
    amounts.add(Math.ceil(total / 50000) * 50000);
    amounts.add(Math.ceil(total / 100000) * 100000);
    
    // Suggest generic large bills if greater than total
    [10000, 20000, 50000, 100000].forEach(bill => {
        if (bill > total) amounts.add(bill);
    });

    return Array.from(amounts).sort((a, b) => a - b).slice(0, 4); 
});

</script>

<template>
  <div class="h-100 d-flex flex-column bg-grey-lighten-5">
    <!-- Header -->
    <div class="pa-4 bg-white border-b d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-2">
         <v-icon icon="mdi-cart" color="primary"></v-icon>
         <span class="text-h6 font-weight-bold">Current Order</span>
      </div>
      <div class="text-subtitle-2 text-grey d-flex align-center gap-2">
         <span>#{{ cartStore.itemCount }} Items</span>
         <v-btn icon="mdi-close" variant="text" size="small" class="d-md-none" @click="emit('close')"></v-btn>
      </div>
    </div>

    <!-- Error Alert -->
    <v-alert
        v-if="paymentError"
        type="error"
        density="compact"
        variant="tonal"
        class="mx-4 mt-2"
        closable
        @click:close="paymentError = ''"
    >
        {{ paymentError }}
    </v-alert>

    <!-- Cart Items (Scrollable) -->
    <v-list class="flex-grow-1 overflow-y-auto bg-transparent pa-4" lines="two">
      <template v-if="cartStore.cartItems.length > 0">
        <v-list-item
          v-for="item in cartStore.cartItems"
          :key="item.product.id"
          class="bg-white rounded-lg mb-2 elevation-1"
        >
          <template v-slot:prepend>
             <v-avatar rounded="lg" size="50">
                <v-img :src="item.product.image" cover></v-img>
             </v-avatar>
          </template>

          <v-list-item-title class="font-weight-bold text-subtitle-2">
            {{ item.product.name }}
          </v-list-item-title>
          <v-list-item-subtitle class="mt-1 text-primary font-weight-bold">
             {{ formatPrice(item.product.price) }}
          </v-list-item-subtitle>

          <template v-slot:append>
            <div class="d-flex align-center gap-1">
              <v-btn
                icon="mdi-minus"
                size="x-small"
                variant="tonal"
                color="warning"
                @click="cartStore.updateQuantity(item.product.id, item.quantity - 1)"
              ></v-btn>
              <span class="text-body-2 font-weight-bold mx-2" style="min-width: 20px; text-align: center;">
                {{ item.quantity }}
              </span>
              <v-btn
                icon="mdi-plus"
                size="x-small"
                variant="tonal"
                color="success"
                @click="cartStore.addToCart(item.product)"
              ></v-btn>
              <v-btn
                icon="mdi-trash-can-outline"
                size="x-small"
                variant="text"
                color="error"
                class="ml-2"
                @click="requestDelete(item.product.id)"
              ></v-btn>
            </div>
          </template>
        </v-list-item>
      </template>

      <div v-else class="d-flex flex-column align-center justify-center h-75 text-medium-emphasis">
        <v-icon icon="mdi-cart-outline" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
        <div class="text-h6 font-weight-bold">Cart is empty</div>
        <div class="text-caption">Scan barcode or select items</div>
      </div>
    </v-list>

    <!-- Footer / Totals / Actions -->
    <div class="pa-4 bg-white border-t mt-auto shadow-top">
        <!-- Totals Breakdown -->
        <div class="mb-3">
            <div class="d-flex justify-space-between mb-1 text-body-2">
                <span class="text-medium-emphasis">Subtotal</span>
                <span>{{ formatPrice(cartStore.subtotal) }}</span>
            </div>
            
            <div class="d-flex justify-space-between mb-1 text-body-2" :class="{'text-primary font-weight-bold': cartStore.discountAmount > 0}">
                 <span class="text-medium-emphasis d-flex align-center cursor-pointer" @click="showDiscountInput = !showDiscountInput">
                    Discount 
                    <v-icon icon="mdi-pencil" size="x-small" class="ml-1"></v-icon>
                 </span>
                <span>-{{ formatPrice(cartStore.discountAmount) }}</span>
            </div>
            
            <!-- Discount Input -->
            <v-expand-transition>
                <div v-if="showDiscountInput" class="mb-2 pa-2 bg-grey-lighten-4 rounded border">
                    <div class="d-flex gap-2 mb-2">
                        <v-btn size="x-small" :variant="discountInputType === 'NOMINAL' ? 'flat' : 'text'" color="primary" @click="discountInputType = 'NOMINAL'">Rp</v-btn>
                        <v-btn size="x-small" :variant="discountInputType === 'PERCENTAGE' ? 'flat' : 'text'" color="primary" @click="discountInputType = 'PERCENTAGE'">%</v-btn>
                    </div>
                    <v-text-field
                        v-model.number="discountInputVal"
                        density="compact"
                        variant="outlined"
                        hide-details
                        placeholder="Enter value"
                        type="number"
                        append-inner-icon="mdi-check"
                        @click:append-inner="applyDiscount"
                        @keyup.enter="applyDiscount"
                    ></v-text-field>
                </div>
            </v-expand-transition>

            <div class="d-flex justify-space-between mb-1 text-body-2">
                <span class="text-medium-emphasis">Tax (10%)</span>
                <span>{{ formatPrice(cartStore.tax) }}</span>
            </div>
        </div>

        <v-divider class="mb-3"></v-divider>

        <!-- Grand Total -->
        <div class="d-flex justify-space-between mb-4 text-h5 font-weight-bold">
            <span>Total</span>
            <span class="text-primary">{{ formatPrice(cartStore.total) }}</span>
        </div>

        <!-- Payment Input -->
        <div class="mb-4">
             <v-text-field
                v-model.number="paymentInput"
                label="Cash Received"
                prefix="Rp"
                variant="outlined"
                density="compact"
                hide-details
                type="number"
                class="mb-2"
                @update:model-value="updatePayment"
             ></v-text-field>
             
             <!-- Quick Amounts -->
             <div class="d-flex gap-2 overflow-x-auto pb-1 mt-1 scrollbar-hide">
                 <v-chip 
                    v-for="amt in quickAmounts" 
                    :key="amt" 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                    @click="paymentInput = amt; updatePayment()"
                 >
                    {{ amt / 1000 }}k
                 </v-chip>
             </div>

             <div v-if="cartStore.change > 0" class="d-flex justify-space-between mt-2 text-subtitle-1 font-weight-bold text-success animate__animated animate__fadeIn">
                <span>Change</span>
                <span>{{ formatPrice(cartStore.change) }}</span>
             </div>
        </div>

        <div class="d-flex gap-2">
             <v-btn 
                flex-grow-1
                color="primary" 
                size="large" 
                class="text-none"
                prepend-icon="mdi-cash"
                :disabled="cartStore.cartItems.length === 0"
                @click="handlePayment('CASH')"
                style="flex: 1"
             >
                Pay Cash
             </v-btn>
             <v-btn 
                flex-grow-1
                color="secondary" 
                size="large" 
                class="text-none"
                prepend-icon="mdi-qrcode"
                 :disabled="cartStore.cartItems.length === 0"
                 @click="handlePayment('QRIS')"
                 style="flex: 1"
             >
                QRIS
             </v-btn>
        </div>
    </div>

    <!-- Feedback Snackbar -->
    <v-snackbar
        v-model="cartStore.snackbar.show"
        :color="cartStore.snackbar.color"
        location="top"
        elevation="24"
        :timeout="3000"
    >
        {{ cartStore.snackbar.text }}
        <template v-slot:actions>
            <v-btn variant="text" @click="cartStore.snackbar.show = false">Close</v-btn>
        </template>
    </v-snackbar>

    <!-- Delete Confirmation -->
    <v-dialog v-model="showDeleteConfirm" max-width="320px">
        <v-card rounded="xl">
            <v-card-title class="text-h6 pt-4 px-6 font-weight-bold">Remove Item?</v-card-title>
            <v-card-text class="px-6 pb-2 text-medium-emphasis">
                Are you sure you want to remove this item from the cart?
            </v-card-text>
            <v-card-actions class="pa-4 pt-2">
                <v-spacer></v-spacer>
                <v-btn variant="text" color="grey-darken-1" class="text-none" @click="showDeleteConfirm = false">Cancel</v-btn>
                <v-btn variant="flat" color="error" rounded="lg" class="text-none px-6" @click="confirmDelete">Remove</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    
    <!-- QRIS Payment Modal -->
    <v-dialog v-model="showQRISModal" max-width="400px">
        <v-card rounded="xl">
            <v-card-title class="text-h6 pt-4 px-6 font-weight-bold text-center">
                Scan QRIS to Pay
            </v-card-title>
            <v-card-text class="pa-6 text-center">
                <div class="mb-4 text-h5 font-weight-black text-primary">
                    {{ formatPrice(cartStore.total) }}
                </div>
                <v-img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://qris.interactive.co.id/homepage/" 
                    width="200" 
                    height="200" 
                    class="mx-auto border pa-2 bg-white rounded-lg shadow-sm"
                ></v-img>
                <div class="mt-4 text-caption text-grey">
                    Scan this QR using your mobile banking or e-wallet
                </div>
            </v-card-text>
            <v-card-actions class="pa-4 pt-0">
                <v-btn block color="primary" variant="flat" size="large" rounded="lg" @click="confirmQRISPayment">
                    Confirm Payment
                </v-btn>
            </v-card-actions>
            <v-btn icon="mdi-close" variant="text" size="small" position="absolute" style="top: 12px; right: 12px;" @click="showQRISModal = false"></v-btn>
        </v-card>
    </v-dialog>

    <!-- Receipt Dialog -->
    <v-dialog v-model="showReceipt" max-width="400px" persistent transition="dialog-bottom-transition">
        <v-card rounded="xl">
            <v-card-text class="pa-0 bg-white">
                <Receipt v-if="cartStore.transaction" :transaction="cartStore.transaction" />
            </v-card-text>
            <v-card-actions class="bg-grey-lighten-4 border-t pa-4">
                <v-spacer></v-spacer>
                <v-btn color="grey-darken-1" variant="text" @click="closeReceipt">Close</v-btn>
                <v-btn color="primary" variant="flat" prepend-icon="mdi-printer" @click="printReceipt" rounded="lg">Print</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.shadow-top {
    box-shadow: 0 -4px 10px rgba(0,0,0,0.05);
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
