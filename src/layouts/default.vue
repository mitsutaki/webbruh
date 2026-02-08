
<script setup lang="ts">
import CategorySidebar from '@/components/CategorySidebar.vue';
import CartSidebar from '@/components/CartSidebar.vue';
import { useProductStore } from '@/stores/products';
import { useCartStore } from '@/stores/cart';
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const { mobile, lgAndUp, mdAndUp } = useDisplay();
const productStore = useProductStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();
const searchInput = ref<HTMLInputElement | null>(null);

const showLogoutConfirm = ref(false);

function requestLogout() {
    showLogoutConfirm.value = true;
}

function handleLogout() {
    authStore.logout();
    showLogoutConfirm.value = false;
    router.push('/login');
}

function switchUser() {
    // In a real app, this might open a dialog or redirect
    // For demo, we just logout so they can login as someone else
    requestLogout();
}

// Responsive Drawers
const drawerLeft = ref(true); 
const drawerRight = ref(true); 

const isLeftPermanent = computed(() => lgAndUp.value);
const isRightPermanent = computed(() => mdAndUp.value);

watch(lgAndUp, (val) => { if (val) drawerLeft.value = true; });
watch(mdAndUp, (val) => { if (val) drawerRight.value = true; });

// Barcode Scanner Listener variables
let barcodeBuffer = '';
let lastKeyTime = 0;

const handleKeydown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    const currentTime = Date.now();
    if (currentTime - lastKeyTime > 100) barcodeBuffer = '';
    lastKeyTime = currentTime;

    if (e.key === 'Enter') {
        if (barcodeBuffer.length > 2) {
            const product = productStore.findProductByBarcode(barcodeBuffer);
            if (product) cartStore.addToCart(product);
        }
        barcodeBuffer = '';
    } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
    setTimeout(() => { searchInput.value?.focus(); }, 100);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <v-app>
    <!-- Left Navigation: Categories -->
    <v-navigation-drawer
      v-model="drawerLeft"
      :permanent="isLeftPermanent"
      width="250"
      color="surface"
      class="border-r"
    >
      <div class="px-4 py-4 d-flex align-center gap-2">
        <v-icon icon="mdi-store" color="primary" size="x-large"></v-icon>
        <span class="text-h6 font-weight-bold">Kasir<span class="text-primary">Chan</span></span>
      </div>

      <CategorySidebar v-if="authStore.user?.role === 'CASHIER'" />
      
      <v-divider v-if="authStore.user?.role === 'CASHIER'" class="my-2"></v-divider>
      
      <v-list nav v-if="authStore.user?.role === 'ADMIN'">
          <v-list-subheader class="text-uppercase font-weight-bold ml-2">Admin Panel</v-list-subheader>
          <v-list-item
            prepend-icon="mdi-view-dashboard"
            title="Dashboard"
            to="/admin/dashboard"
            rounded="lg"
            color="primary"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-package-variant-closed"
            title="Manage Products"
            to="/admin/products"
            rounded="lg"
            color="primary"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-chart-line"
            title="Cashier Performance"
            to="/admin/cashiers"
            rounded="lg"
            color="primary"
          ></v-list-item>
      </v-list>
      
      <v-list nav v-if="authStore.user?.role === 'CASHIER'">
          <v-list-item
            prepend-icon="mdi-home-outline"
            title="Home / POS"
            to="/"
            rounded="lg"
            color="primary"
          ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Right Navigation: Cart -->
    <v-navigation-drawer
      v-if="authStore.user?.role === 'CASHIER'"
      v-model="drawerRight"
      :permanent="isRightPermanent"
      location="right"
      width="350"
      color="surface"
      class="border-l"
    >
        <CartSidebar />
    </v-navigation-drawer>

    <!-- Top Bar -->
    <v-app-bar flat class="border-b pr-4 pl-2" height="64">
      <v-app-bar-nav-icon @click="drawerLeft = !drawerLeft" v-if="!isLeftPermanent"></v-app-bar-nav-icon>
      
      <v-text-field
        v-if="authStore.user?.role === 'CASHIER'"
        ref="searchInput"
        v-model="productStore.searchQuery"
        prepend-inner-icon="mdi-magnify"
        placeholder="Search..."
        variant="outlined"
        density="compact"
        hide-details
        class="ml-2 ml-md-4"
        style="max-width: 400px;"
        rounded="lg"
        clearable
      ></v-text-field>

      <v-spacer></v-spacer>

      <v-btn icon class="mr-2" @click="drawerRight = !drawerRight" v-if="!isRightPermanent && authStore.user?.role === 'CASHIER'">
        <v-badge :content="cartStore.itemCount" color="error" v-if="cartStore.itemCount > 0">
            <v-icon>mdi-cart-outline</v-icon>
        </v-badge>
        <v-icon v-else>mdi-cart-outline</v-icon>
      </v-btn>

      <v-btn icon="mdi-fullscreen" variant="text" class="hidden-sm-and-down"></v-btn>
      
      <!-- User Menu -->
      <v-menu min-width="200px" rounded="lg">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="ml-2">
            <v-avatar color="primary" size="36">
              <span class="text-caption font-weight-bold">{{ authStore.user?.username.substring(0,2).toUpperCase() }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item class="py-2">
            <template v-slot:prepend>
              <v-avatar color="primary" size="40">
                <span class="text-subtitle-1 white--text">{{ authStore.user?.username.substring(0,2).toUpperCase() }}</span>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-bold">{{ authStore.user?.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ authStore.user?.role }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider class="my-2"></v-divider>
          <v-list-item prepend-icon="mdi-account-circle-outline" title="Profile" to="/admin/profile"></v-list-item>
          <v-list-item prepend-icon="mdi-lock-reset" title="Change Password"></v-list-item>
          <v-list-item v-if="authStore.user?.role === 'ADMIN'" prepend-icon="mdi-account-switch-outline" title="Switch User" @click="switchUser"></v-list-item>
          <v-divider class="my-2"></v-divider>
          <v-list-item prepend-icon="mdi-logout" title="Logout" @click="requestLogout" color="error"></v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Logout Confirmation -->
    <v-dialog v-model="showLogoutConfirm" max-width="320px">
        <v-card rounded="xl">
            <v-card-title class="text-h6 pt-4 px-6 font-weight-bold">Logout?</v-card-title>
            <v-card-text class="px-6 pb-2 text-medium-emphasis">
                Are you sure you want to end your session?
            </v-card-text>
            <v-card-actions class="pa-4 pt-2">
                <v-spacer></v-spacer>
                <v-btn variant="text" color="grey-darken-1" class="text-none" @click="showLogoutConfirm = false">Stay</v-btn>
                <v-btn variant="flat" color="error" rounded="lg" class="text-none px-6" @click="handleLogout">Logout</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="h-100 pa-0">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>
