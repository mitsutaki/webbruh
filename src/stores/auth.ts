
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface User {
    id: number;
    username: string;
    role: 'ADMIN' | 'CASHIER';
    name: string;
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const isAuthenticated = computed(() => !!user.value);

    function login(username: string, password: string): boolean {
        // Mock authentication
        if (username === 'admin' && password === 'admin') {
            user.value = {
                id: 1,
                username: 'admin',
                role: 'ADMIN',
                name: 'Administrator'
            };
            return true;
        } else if (username === 'kasir' && password === 'kasir') {
            user.value = {
                id: 2,
                username: 'kasir',
                role: 'CASHIER',
                name: 'Kasir Chan'
            };
            return true;
        }
        return false;
    }

    function logout() {
        user.value = null;
    }

    return {
        user,
        isAuthenticated,
        login,
        logout
    };
});
