

<route lang="yaml">
meta:
  layout: blank
</route>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);

async function handleLogin() {
    loading.value = true;
    error.value = '';
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = authStore.login(username.value, password.value);
    
    if (success) {
        if (authStore.user?.role === 'ADMIN') {
            router.push('/admin/dashboard');
        } else {
            router.push('/');
        }
    } else {
        error.value = 'Invalid username or password';
        loading.value = false;
    }
}
</script>

<template>
  <v-container fluid class="fill-height login-bg pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Left Side: Branding / Info -->
      <v-col cols="12" md="7" class="hidden-sm-and-down bg-primary d-flex flex-column justify-center align-center text-white pa-12">
        <v-icon icon="mdi-store" size="120" class="mb-6"></v-icon>
        <h1 class="text-h2 font-weight-bold mb-4">Kasir<span class="text-secondary">Chan</span></h1>
        <p class="text-h5 opacity-80 mb-12 text-center">
          Modern Point of Sale solution for your growing business.
          Fast, reliable, and beautiful.
        </p>
        <div class="d-flex gap-4">
            <v-chip color="white" variant="outlined" prepend-icon="mdi-check">Speedy Scanning</v-chip>
            <v-chip color="white" variant="outlined" prepend-icon="mdi-check">Cloud Sync</v-chip>
            <v-chip color="white" variant="outlined" prepend-icon="mdi-check">Inventory Control</v-chip>
        </div>
      </v-col>

      <!-- Right Side: Login Form -->
      <v-col cols="12" md="5" class="d-flex align-center justify-center bg-white pa-6">
        <v-card flat max-width="400" width="100%">
          <div class="mb-10">
            <h2 class="text-h4 font-weight-bold mb-2">Welcome Back!</h2>
            <p class="text-grey">Please enter your credentials to continue</p>
          </div>

          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-6"
            closable
          >
            {{ error }}
          </v-alert>

          <v-form @submit.prevent="handleLogin">
            <div class="mb-4">
              <div class="text-subtitle-2 font-weight-bold mb-1 ml-1">Username</div>
              <v-text-field
                v-model="username"
                placeholder="admin or kasir"
                variant="outlined"
                prepend-inner-icon="mdi-account-outline"
                hide-details="auto"
                rounded="lg"
                color="primary"
                :disabled="loading"
              ></v-text-field>
            </div>

            <div class="mb-6">
              <div class="text-subtitle-2 font-weight-bold mb-1 ml-1 d-flex justify-space-between">
                Password
                <span class="text-primary cursor-pointer text-caption">Forgot?</span>
              </div>
              <v-text-field
                v-model="password"
                placeholder="admin or kasir"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                hide-details="auto"
                rounded="lg"
                color="primary"
                :disabled="loading"
              ></v-text-field>
            </div>

            <v-btn
              block
              size="x-large"
              color="primary"
              variant="flat"
              type="submit"
              class="text-none mb-4"
              rounded="lg"
              :loading="loading"
            >
              Login
            </v-btn>

            <div class="text-center text-caption text-grey">
                &copy; 2026 KasirChan POS. All rights reserved.
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-bg {
    background-color: #f8f9fa;
}
</style>
