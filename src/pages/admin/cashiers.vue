
<script setup lang="ts">
import { ref, computed } from 'vue';

interface CashierPerformance {
    id: number;
    name: string;
    totalSales: number;
    transactionCount: number;
    avgTransaction: number;
    productsSold: number;
    lastActive: string;
}

const search = ref('');
const dateFilter = ref('Today');
const dateOptions = ['Today', 'Yesterday', 'Last 7 Days', 'This Month', 'Custom'];

// Mock Data
const cashierMetrics = ref<CashierPerformance[]>([
    { id: 1, name: 'Administrator', totalSales: 4500000, transactionCount: 156, avgTransaction: 28846, productsSold: 412, lastActive: '2026-02-03 10:15' },
    { id: 2, name: 'Kasir Chan', totalSales: 2800000, transactionCount: 98, avgTransaction: 28571, productsSold: 245, lastActive: '2026-02-03 09:45' },
    { id: 3, name: 'Budi Santoso', totalSales: 3200000, transactionCount: 112, avgTransaction: 28571, productsSold: 310, lastActive: '2026-02-02 18:00' },
    { id: 4, name: 'Siti Aminah', totalSales: 1500000, transactionCount: 65, avgTransaction: 23076, productsSold: 140, lastActive: '2026-02-01 16:30' },
]);

const headers = [
    { title: 'Cashier Name', key: 'name', align: 'start' },
    { title: 'Total Sales', key: 'totalSales', align: 'end' },
    { title: 'Transactions', key: 'transactionCount', align: 'end' },
    { title: 'Avg. Transaction', key: 'avgTransaction', align: 'end' },
    { title: 'Products Sold', key: 'productsSold', align: 'end' },
    { title: 'Last Active', key: 'lastActive', align: 'end' },
] as const;

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const filteredMetrics = computed(() => {
    return cashierMetrics.value.filter(m => 
        m.name.toLowerCase().includes(search.value.toLowerCase())
    );
});
</script>

<template>
  <v-container fluid class="pa-6">
    <div class="mb-6">
        <h1 class="text-h4 font-weight-bold mb-1">Cashier Performance</h1>
        <p class="text-grey">Monitor efficiency and sales performance of your staff</p>
    </div>

    <!-- Summary Cards -->
    <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
            <v-card rounded="xl" elevation="2" class="pa-4 bg-primary text-white h-100">
                <div class="text-overline mb-1 opacity-70">Total Revenue</div>
                <div class="text-h4 font-weight-black">Rp 12.0M</div>
                <v-icon icon="mdi-trending-up" class="position-absolute" style="right: 20px; top: 20px; opacity: 0.2; font-size: 64px;"></v-icon>
            </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
            <v-card rounded="xl" elevation="2" class="pa-4 bg-white h-100 border">
                <div class="text-overline mb-1 text-grey">Total Transactions</div>
                <div class="text-h4 font-weight-black text-secondary">431</div>
                <v-icon icon="mdi-swap-horizontal" class="position-absolute" style="right: 20px; top: 20px; opacity: 0.1; font-size: 64px;"></v-icon>
            </v-card>
        </v-col>
         <v-col cols="12" sm="6" md="3">
            <v-card rounded="xl" elevation="2" class="pa-4 bg-white h-100 border">
                <div class="text-overline mb-1 text-grey">Average Basket</div>
                <div class="text-h4 font-weight-black text-info">Rp 27.8k</div>
                <v-icon icon="mdi-basket-outline" class="position-absolute" style="right: 20px; top: 20px; opacity: 0.1; font-size: 64px;"></v-icon>
            </v-card>
        </v-col>
         <v-col cols="12" sm="6" md="3">
            <v-card rounded="xl" elevation="2" class="pa-4 bg-white h-100 border">
                <div class="text-overline mb-1 text-grey">Items Sold</div>
                <div class="text-h4 font-weight-black text-success">1,107</div>
                <v-icon icon="mdi-package-variant-closed" class="position-absolute" style="right: 20px; top: 20px; opacity: 0.1; font-size: 64px;"></v-icon>
            </v-card>
        </v-col>
    </v-row>

    <v-card rounded="xl" elevation="2" class="overflow-hidden border">
        <v-toolbar flat color="white" class="px-4 py-2 border-b">
            <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Search cashier..."
                variant="outlined"
                density="compact"
                hide-details
                rounded="lg"
                style="max-width: 300px;"
                class="mr-4"
            ></v-text-field>

            <v-select
                v-model="dateFilter"
                :items="dateOptions"
                label="Date Range"
                variant="outlined"
                density="compact"
                hide-details
                rounded="lg"
                style="max-width: 200px;"
            ></v-select>

            <v-spacer></v-spacer>
            <v-btn icon="mdi-export" variant="tonal" rounded="lg" color="primary" class="mr-2"></v-btn>
            <v-btn icon="mdi-refresh" variant="tonal" rounded="lg" color="grey" @click="search = ''"></v-btn>
        </v-toolbar>

        <v-data-table
            :headers="headers"
            :items="filteredMetrics"
            :items-per-page="5"
            class="elevation-0"
            hover
        >
            <template v-slot:item.name="{ item }">
                <div class="d-flex align-center py-2">
                    <v-avatar color="primary" size="32" class="mr-3">
                        <span class="text-caption font-weight-bold white--text">{{ item.name.substring(0,1) }}</span>
                    </v-avatar>
                    <span class="font-weight-bold">{{ item.name }}</span>
                </div>
            </template>

            <template v-slot:item.totalSales="{ item }">
                <span class="text-success font-weight-bold">{{ formatPrice(item.totalSales) }}</span>
            </template>

            <template v-slot:item.transactionCount="{ item }">
                {{ item.transactionCount }}
            </template>

            <template v-slot:item.avgTransaction="{ item }">
                {{ formatPrice(item.avgTransaction) }}
            </template>

            <template v-slot:item.productsSold="{ item }">
                 <v-chip size="small" variant="tonal" color="info">{{ item.productsSold }}</v-chip>
            </template>

            <template v-slot:item.lastActive="{ item }">
                <span class="text-caption text-grey">{{ item.lastActive }}</span>
            </template>

            <template v-slot:bottom>
                <div class="pa-4 bg-grey-lighten-4 border-t text-caption text-center">
                    Data updated as of {{ new Date().toLocaleString() }}
                </div>
            </template>
        </v-data-table>
    </v-card>
  </v-container>
</template>

<style scoped>
/* Custom styling if needed */
</style>
