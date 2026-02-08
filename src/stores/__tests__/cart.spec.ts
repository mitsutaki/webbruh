
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '@/stores/cart';
import { useProductStore } from '@/stores/products';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the entire composable module
vi.mock('@/composables/useCustomerDisplay', () => ({
    useCustomerDisplay: () => ({
        sendUpdate: vi.fn(),
        sendTransaction: vi.fn(),
        openDisplay: vi.fn(),
        isConnected: { value: true }
    })
}));

describe('Cart Store Logic', () => {
    let cartStore: ReturnType<typeof useCartStore>;
    let productStore: ReturnType<typeof useProductStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        cartStore = useCartStore();
        productStore = useProductStore();

        // Reset Product Mock Data
        productStore.products = [
            { id: 1, name: 'Test Product 1', price: 10000, category: 'Test', image: '', stock: 50 },
            { id: 2, name: 'Test Product 2', price: 20000, category: 'Test', image: '', stock: 10 }
        ];
    });

    const product1 = { id: 1, name: 'Test Product 1', price: 10000, category: 'Test', image: '', stock: 50 };
    const product2 = { id: 2, name: 'Test Product 2', price: 20000, category: 'Test', image: '', stock: 10 };

    describe('1. Cart Calculations', () => {
        it('calculates subtotal correctly', () => {
            cartStore.addToCart(product1); // 10k
            cartStore.addToCart(product1); // 20k
            cartStore.addToCart(product2); // 20k -> Total 40k

            expect(cartStore.subtotal).toBe(40000);
            expect(cartStore.itemCount).toBe(3);
        });

        it('calculates tax (10%) correctly', () => {
            cartStore.addToCart(product1); // 10k
            // Tax Base 10k -> Tax 1k
            // Total 11k
            expect(cartStore.tax).toBe(1000);
            expect(cartStore.total).toBe(11000);
        });
    });

    describe('4. Discount Application', () => {
        it('applies Nominal discount correctly', () => {
            cartStore.addToCart(product1); // 10k
            cartStore.setDiscount(2000, 'NOMINAL'); // -2k

            // Subtotal: 10k
            // Discount: 2k
            // Taxable: 8k
            // Tax: 800 (10% of 8k)
            // Total: 8000 + 800 = 8800
            expect(cartStore.discountAmount).toBe(2000);
            expect(cartStore.tax).toBe(800);
            expect(cartStore.total).toBe(8800);
        });

        it('applies Percentage discount correctly', () => {
            cartStore.addToCart(product1); // 10k
            cartStore.setDiscount(50, 'PERCENTAGE'); // 50%

            // Subtotal: 10k
            // Discount: 5k
            // Taxable: 5k
            // Tax: 500 (10% of 5k)
            // Total: 5500
            expect(cartStore.discountAmount).toBe(5000);
            expect(cartStore.total).toBe(5500);
        });
    });

    describe('2. Inventory Update & Payment', () => {
        it('deducts inventory after payment', () => {
            cartStore.addToCart(product1);
            cartStore.updateQuantity(1, 5); // Buy 5

            // Initial Stock: 50
            expect(productStore.products.find(p => p.id === 1)?.stock).toBe(50);

            cartStore.setPaymentAmount(100000); // Pay enough
            const trx = cartStore.processPayment('CASH');

            expect(trx).toBeDefined();
            // Check Stock Reduced
            expect(productStore.products.find(p => p.id === 1)?.stock).toBe(45);
        });
    });
});
