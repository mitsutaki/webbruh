
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useProductStore } from '@/stores/products';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'vue-chartjs';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const productStore = useProductStore();

// --- Mock Data ---
const todaySales = ref(2500000);
const todayOrders = ref(45);
const avgOrderValue = computed(() => todaySales.value / todayOrders.value);

// Sales Trend Data (Last 7 Days)
const salesTrendData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Sales (Rp)',
      backgroundColor: 'rgba(24, 103, 192, 0.2)',
      borderColor: '#1867C0',
      pointBackgroundColor: '#1867C0',
      data: [1200000, 1900000, 1500000, 2100000, 1800000, 2800000, 2500000],
      fill: true,
      tension: 0.4
    }
  ]
};

const salesTrendOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
        display: false
    }
  }
};

// Best Selling Products
const bestSellingData = {
  labels: ['Kopi Susu', 'Croissant', 'Nasi Goreng', 'Americano', 'Ice Tea'],
  datasets: [
    {
      label: 'Units Sold',
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      data: [120, 90, 80, 70, 60]
    }
  ]
};

const bestSellingOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

// Low Stock Logic
const lowStockProducts = computed(() => {
    return productStore.products
        .filter(p => (p.stock || 0) < 20)
        .sort((a, b) => (a.stock || 0) - (b.stock || 0)); // Sort by lowest stock
});

// Utilities
function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}
</script>

<template>
  <div class="pa-4 h-100 bg-grey-lighten-4">
    <div class="mb-6">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">Dashboard</h1>
        <p class="text-body-2 text-medium-emphasis">Overview of your store performance</p>
    </div>

    <!-- Summary Cards -->
    <v-row>
      <v-col cols="12" sm="4">
        <v-card elevation="2" class="rounded-lg pa-4">
            <div class="d-flex justify-space-between align-start">
                <div>
                    <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold">Today's Sales</div>
                    <div class="text-h4 font-weight-bold text-primary mt-1">{{ formatPrice(todaySales) }}</div>
                </div>
                <v-avatar color="primary" variant="tonal" rounded="lg">
                    <v-icon icon="mdi-cash-multiple"></v-icon>
                </v-avatar>
            </div>
             <div class="text-caption text-success mt-2 d-flex align-center">
                <v-icon icon="mdi-arrow-up" size="small" class="mr-1"></v-icon>
                <span class="font-weight-bold">12%</span>
                <span class="text-medium-emphasis ml-1">vs yesterday</span>
            </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card elevation="2" class="rounded-lg pa-4">
            <div class="d-flex justify-space-between align-start">
                <div>
                    <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold">Today's Orders</div>
                    <div class="text-h4 font-weight-bold text-info mt-1">{{ todayOrders }}</div>
                </div>
                 <v-avatar color="info" variant="tonal" rounded="lg">
                    <v-icon icon="mdi-receipt"></v-icon>
                </v-avatar>
            </div>
             <div class="text-caption text-success mt-2 d-flex align-center">
                <v-icon icon="mdi-arrow-up" size="small" class="mr-1"></v-icon>
                <span class="font-weight-bold">5%</span>
                <span class="text-medium-emphasis ml-1">vs yesterday</span>
            </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card elevation="2" class="rounded-lg pa-4">
            <div class="d-flex justify-space-between align-start">
                <div>
                    <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold">Avg. Order Value</div>
                    <div class="text-h4 font-weight-bold text-secondary mt-1">{{ formatPrice(avgOrderValue) }}</div>
                </div>
                 <v-avatar color="secondary" variant="tonal" rounded="lg">
                    <v-icon icon="mdi-chart-line-variant"></v-icon>
                </v-avatar>
            </div>
             <div class="text-caption text-error mt-2 d-flex align-center">
                <v-icon icon="mdi-arrow-down" size="small" class="mr-1"></v-icon>
                <span class="font-weight-bold">2%</span>
                <span class="text-medium-emphasis ml-1">vs yesterday</span>
            </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
        <!-- Sales Trend Chart -->
        <v-col cols="12" md="8">
            <v-card elevation="2" class="rounded-lg h-100">
                <v-card-title class="font-weight-bold">Sales Trend (Last 7 Days)</v-card-title>
                <v-card-text style="height: 300px;">
                    <Line :data="salesTrendData" :options="salesTrendOptions" />
                </v-card-text>
            </v-card>
        </v-col>

        <!-- Best Selling Chart -->
        <v-col cols="12" md="4">
            <v-card elevation="2" class="rounded-lg h-100">
                <v-card-title class="font-weight-bold">Top Products</v-card-title>
                <v-card-text style="height: 300px; display: flex; justify-content: center;">
                    <Doughnut :data="bestSellingData" :options="bestSellingOptions" />
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>

    <!-- Low Stock Alert -->
    <v-row class="mt-2">
        <v-col cols="12">
            <v-card elevation="2" class="rounded-lg border-danger">
                <v-card-title class="d-flex align-center text-error">
                    <v-icon icon="mdi-alert-circle-outline" class="mr-2"></v-icon>
                    Low Stock Alerts
                </v-card-title>
                <v-table>
                    <thead>
                        <tr>
                            <th class="text-left">Product</th>
                            <th class="text-left">Category</th>
                            <th class="text-left">Current Stock</th>
                            <th class="text-left">Status</th>
                            <th class="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in lowStockProducts" :key="item.id">
                            <td class="font-weight-bold">
                                <v-avatar size="32" class="mr-2 rounded">
                                    <v-img :src="item.image" cover></v-img>
                                </v-avatar>
                                {{ item.name }}
                            </td>
                            <td>{{ item.category }}</td>
                            <td class="text-error font-weight-bold">{{ item.stock }}</td>
                            <td>
                                <v-chip color="error" size="small" variant="flat">Critical</v-chip>
                            </td>
                            <td class="text-right">
                                <v-btn size="small" variant="text" color="primary" to="/admin/products">Restock</v-btn>
                            </td>
                        </tr>
                          <tr v-if="lowStockProducts.length === 0">
                            <td colspan="5" class="text-center text-medium-emphasis py-4">
                                No low stock alerts. Good job!
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card>
        </v-col>
    </v-row>
  </div>
</template>
