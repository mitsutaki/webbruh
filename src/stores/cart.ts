
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { type Product, useProductStore } from './products';
import { useCustomerDisplay } from '@/composables/useCustomerDisplay';

export interface CartItem {
    product: Product;
    quantity: number;
}

export type DiscountType = 'PERCENTAGE' | 'NOMINAL';

export interface Transaction {
    id: string;
    items: CartItem[];
    subtotal: number;
    discountType: DiscountType;
    discountValue: number;
    discountAmount: number;
    tax: number;
    total: number;
    paymentAmount: number;
    change: number;
    paymentMethod: string;
    date: Date;
}

export const useCartStore = defineStore('cart', () => {
    // State
    const cartItems = ref<CartItem[]>([]);
    const transaction = ref<Transaction | null>(null);

    // Connect Customer Display
    const { sendUpdate, sendTransaction } = useCustomerDisplay();

    // Calculation State
    const discountValue = ref<number>(0);
    const discountType = ref<DiscountType>('NOMINAL');
    const taxRate = ref<number>(0.10); // 10% Tax as requested
    const paymentAmount = ref<number>(0);

    // Getters
    const itemCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0));

    const subtotal = computed(() => {
        return cartItems.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    });

    const discountAmount = computed(() => {
        if (discountType.value === 'PERCENTAGE') {
            // Cap at 100%
            const percentage = Math.min(Math.max(discountValue.value, 0), 100);
            return Math.round(subtotal.value * (percentage / 100));
        } else {
            // Cap at subtotal
            return Math.min(Math.max(discountValue.value, 0), subtotal.value);
        }
    });

    const tax = computed(() => {
        // Tax Base: (Subtotal - Discount)
        const taxableAmount = Math.max(0, subtotal.value - discountAmount.value);
        return Math.round(taxableAmount * taxRate.value);
    });

    const total = computed(() => {
        return Math.max(0, subtotal.value - discountAmount.value + tax.value);
    });

    const change = computed(() => {
        return Math.max(0, paymentAmount.value - total.value);
    });

    // Helper to update display
    function updateDisplay() {
        sendUpdate({
            items: cartItems.value,
            total: total.value
        });
    }

    // Feedback State
    const snackbar = ref({ show: false, text: '', color: '' });

    function showFeedback(text: string, color: string = 'success') {
        snackbar.value = { show: true, text, color };
    }

    // Actions
    function addToCart(product: Product) {
        const existingItem = cartItems.value.find(item => item.product.id === product.id);
        if (existingItem) {
            if (existingItem.quantity + 1 > product.stock) {
                showFeedback(`Cannot add more. Max stock for ${product.name} is ${product.stock}`, 'error');
                return;
            }
            existingItem.quantity++;
        } else {
            if (product.stock <= 0) {
                showFeedback(`${product.name} is out of stock!`, 'error');
                return;
            }
            cartItems.value.push({ product, quantity: 1 });
        }
        updateDisplay();
    }

    function removeItem(productId: number) {
        const item = cartItems.value.find(p => p.product.id === productId);
        const index = cartItems.value.findIndex(item => item.product.id === productId);
        if (index !== -1) {
            cartItems.value.splice(index, 1);
            showFeedback(`${item?.product.name} removed from cart`, 'info');
        }
        updateDisplay();
    }

    function updateQuantity(productId: number, quantity: number) {
        const existingItem = cartItems.value.find(item => item.product.id === productId);
        if (existingItem) {
            if (quantity > existingItem.product.stock) {
                showFeedback(`Max stock for ${existingItem.product.name} is ${existingItem.product.stock}`, 'warning');
                existingItem.quantity = existingItem.product.stock;
            } else if (quantity < 1) {
                // If quantity is set to 0 or less, we keep it at 1 or the user must use removeItem
                existingItem.quantity = 1;
            } else {
                existingItem.quantity = quantity;
            }
        }
        updateDisplay();
    }

    function decreaseQuantity(productId: number) {
        const existingItem = cartItems.value.find(item => item.product.id === productId);
        if (existingItem) {
            updateQuantity(productId, existingItem.quantity - 1);
        }
    }

    function setDiscount(value: number, type: DiscountType) {
        discountValue.value = value;
        discountType.value = type;
        updateDisplay(); // Discount changes total
    }

    function setPaymentAmount(amount: number) {
        paymentAmount.value = amount;
    }

    function processPayment(method: string): Transaction | null {
        if (cartItems.value.length === 0) return null;
        if (paymentAmount.value < total.value) {
            // In a real app, throw error or handle partial payment
            console.warn("Payment amount insufficient");
            // Force proceed for mock purpose or return null? 
            // Let's assume for this mock we allow it or we should strict check
        }

        const newTransaction: Transaction = {
            id: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            items: JSON.parse(JSON.stringify(cartItems.value)),
            subtotal: subtotal.value,
            discountType: discountType.value,
            discountValue: discountValue.value,
            discountAmount: discountAmount.value,
            tax: tax.value,
            total: total.value,
            paymentAmount: paymentAmount.value,
            change: change.value,
            paymentMethod: method,
            date: new Date()
        };

        transaction.value = newTransaction;

        // Deduct Stock
        const productStore = useProductStore();
        cartItems.value.forEach(item => {
            productStore.decreaseStock(item.product.id, item.quantity);
        });

        // Notify Display
        sendTransaction(newTransaction);

        // Reset state
        cartItems.value = [];
        discountValue.value = 0;
        paymentAmount.value = 0;

        updateDisplay(); // Go to idle/empty

        return newTransaction;
    }

    function clearCart() {
        cartItems.value = [];
        discountValue.value = 0;
        paymentAmount.value = 0;
        updateDisplay();
    }

    return {
        // State
        cartItems,
        transaction,
        discountValue,
        discountType,
        taxRate,
        paymentAmount,
        snackbar,

        // Getters
        subtotal,
        discountAmount,
        tax,
        total,
        change,
        itemCount,

        // Actions
        addToCart,
        removeItem,
        updateQuantity,
        decreaseQuantity,
        setDiscount,
        setPaymentAmount,
        processPayment,
        clearCart,
        showFeedback
    };
});
