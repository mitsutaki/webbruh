
<script setup lang="ts">
import { computed } from 'vue';
import type { Transaction } from '@/stores/cart';

const props = defineProps<{
  transaction: Transaction;
}>();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Generate a fake barcode URL using an API for the transaction ID
const barcodeUrl = computed(() => {
    return `https://bwipjs-api.metafloor.com/?bcid=code128&text=${props.transaction.id}&scale=2&rotate=N&includetext=true`;
});

// QRIS QR Code (pointing to interactive.co.id as requested)
const qrisUrl = computed(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://qris.interactive.co.id/homepage/`;
});
</script>

<template>
  <div class="receipt-container pa-4 bg-white text-black">
    <!-- Header -->
    <div class="text-center mb-4">
        <div class="d-flex justify-center mb-2">
            <!-- Modern Logo Placeholder -->
            <v-icon icon="mdi-store-check" size="64" color="primary"></v-icon>
        </div>
        <div class="text-h6 font-weight-bold">KASIR CHAN POS</div>
        <div class="text-caption">PT. SOLUSI PINTAR INDONESIA</div>
        <div class="text-caption">Gedung Tinggi Floor 12, Jakarta</div>
        <div class="text-caption">021-99887766</div>
    </div>

    <div class="receipt-divider"></div>

    <!-- Info Section -->
    <div class="text-caption mb-2 font-mono">
        <div class="d-flex justify-space-between">
            <span>Date : {{ formatDate(transaction.date) }}</span>
            <span>Ref : {{ transaction.id.split('-').pop() }}</span>
        </div>
        <div class="d-flex justify-space-between">
            <span>Cashier : SYSTEM</span>
            <span>Type : {{ transaction.paymentMethod }}</span>
        </div>
    </div>

    <div class="receipt-divider"></div>

    <!-- Item List -->
    <div class="mb-4 font-mono">
        <div v-for="item in transaction.items" :key="item.product.id" class="mb-3">
            <div class="text-body-2 font-weight-bold truncate-item">{{ item.product.name.toUpperCase() }}</div>
            <div class="d-flex justify-space-between text-caption">
                <span>{{ item.quantity }} x {{ formatPrice(item.product.price).replace('Rp', '').trim() }}</span>
                <span>{{ formatPrice(item.product.price * item.quantity).replace('Rp', '').trim() }}</span>
            </div>
        </div>
    </div>

    <div class="receipt-divider"></div>

    <!-- Calculations -->
    <div class="text-body-2 font-mono">
        <div class="d-flex justify-space-between mb-1">
            <span>SUBTOTAL</span>
            <span>{{ formatPrice(transaction.subtotal) }}</span>
        </div>
        <div v-if="transaction.discountAmount > 0" class="d-flex justify-space-between mb-1 text-primary">
            <span>DISC ({{ transaction.discountType === 'PERCENTAGE' ? transaction.discountValue + '%' : 'NOM' }})</span>
            <span>-{{ formatPrice(transaction.discountAmount) }}</span>
        </div>
        <div class="d-flex justify-space-between mb-1">
            <span>TAX (10%)</span>
            <span>{{ formatPrice(transaction.tax) }}</span>
        </div>
        
        <div class="heavy-divider py-1">
            <div class="d-flex justify-space-between text-h6 font-weight-black">
                <span>GRAND TOTAL</span>
                <span>{{ formatPrice(transaction.total) }}</span>
            </div>
        </div>
        
        <div class="d-flex justify-space-between mt-2 pt-1 border-t-dotted">
            <span>{{ transaction.paymentMethod }} PAYMENT</span>
            <span>{{ formatPrice(transaction.paymentAmount) }}</span>
        </div>
        <div class="d-flex justify-space-between" v-if="transaction.paymentMethod === 'CASH'">
            <span>CHANGE</span>
            <span>{{ formatPrice(transaction.change) }}</span>
        </div>
    </div>

    <div class="receipt-divider my-4"></div>

    <!-- QRIS Section -->
    <div v-if="transaction.paymentMethod === 'QRIS'" class="text-center mb-6">
        <div class="text-caption font-weight-bold mb-3">QRIS - PEMBAYARAN DIGITAL</div>
        <div class="qris-box pa-2 border rounded-lg bg-white d-inline-block">
            <v-img :src="qrisUrl" width="160" height="160" contain></v-img>
        </div>
        <div class="text-caption mt-2 grey--text">NMID: ID1234567890</div>
    </div>

    <!-- Barcode for All Transactions -->
    <div class="text-center mb-4 px-4">
        <v-img :src="barcodeUrl" height="60" contain></v-img>
        <div class="text-overline mt-1">{{ transaction.id }}</div>
    </div>

    <!-- Footer -->
    <div class="text-center text-caption font-mono mt-4">
        <div class="font-weight-bold">--- TERIMA KASIH ---</div>
        <div class="mt-1">SIMPAN STRUK INI SEBAGAI</div>
        <div>BUKTI PEMBAYARAN SAH</div>
        <div class="mt-3 text-grey-darken-1">Powerd by KasirChan.io</div>
    </div>
  </div>
</template>

<style scoped>
.receipt-container {
    width: 320px;
    margin: 0 auto;
    background-color: #fff;
    color: #000;
}

.font-mono {
    font-family: 'Courier New', Courier, monospace;
}

.receipt-divider {
    border-top: 1px dashed #000;
    margin: 10px 0;
}

.heavy-divider {
    border-top: 2px solid #000;
    border-bottom: 2px solid #000;
    margin: 4px 0;
}

.border-t-dotted {
    border-top: 1px dotted #000;
}

.truncate-item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.qris-box {
    border: 1px solid #eee;
}

/* Print Specific Styles */
@media print {
    @page {
        margin: 0;
        size: 80mm auto;
    }
    body {
        background: white;
    }
    .receipt-container {
        width: 100%;
        padding: 5mm;
    }
    /* Simple trick to hide UI around it in most browsers */
    body > *:not(.v-overlay-container) {
        display: none !important;
    }
    .v-overlay-container, .v-dialog, .receipt-container {
        visibility: visible !important;
        position: static !important;
        display: block !important;
    }
}
</style>
