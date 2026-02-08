
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
    barcode?: string;
    stock: number;
}

export const useProductStore = defineStore('products', () => {
    const products = ref<Product[]>([
        { id: 1, name: 'Kopi Susu Gula Aren', price: 18000, category: 'Coffee', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop', barcode: '8991001', stock: 50 },
        { id: 2, name: 'Americano', price: 15000, category: 'Coffee', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop', barcode: '8991002', stock: 35 },
        { id: 3, name: 'Latte', price: 20000, category: 'Coffee', image: 'https://images.unsplash.com/photo-1570968992193-79d0ecaf3809?q=80&w=300&auto=format&fit=crop', barcode: '8991003', stock: 40 },
        { id: 4, name: 'Nasi Goreng Spesial', price: 25000, category: 'Foods', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb74b?q=80&w=300&auto=format&fit=crop', barcode: '8992001', stock: 20 },
        { id: 5, name: 'Mie Goreng', price: 22000, category: 'Foods', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=300&auto=format&fit=crop', barcode: '8992002', stock: 25 },
        { id: 6, name: 'Croissant', price: 12000, category: 'Pastry', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300&auto=format&fit=crop', barcode: '8993001', stock: 15 },
        { id: 7, name: 'Cheesecake', price: 18000, category: 'Pastry', image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?q=80&w=300&auto=format&fit=crop', barcode: '8993002', stock: 10 },
        { id: 8, name: 'Ice Tea', price: 8000, category: 'Beverages', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=300&auto=format&fit=crop', barcode: '8994001', stock: 100 },
    ]);

    const activeCategory = ref<string>('All');
    const searchQuery = ref<string>('');

    const categories = computed(() => {
        const cats = new Set(products.value.map(p => p.category));
        return ['All', ...cats];
    });

    const filteredProducts = computed(() => {
        let result = products.value;

        if (activeCategory.value !== 'All') {
            result = result.filter(p => p.category === activeCategory.value);
        }

        if (searchQuery.value) {
            const lowerQuery = searchQuery.value.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.barcode?.includes(lowerQuery)
            );
        }

        return result;
    });

    function setCategory(category: string) {
        activeCategory.value = category;
    }

    function findProductByBarcode(barcode: string) {
        return products.value.find(p => p.barcode === barcode);
    }

    function addProduct(product: Omit<Product, 'id'>) {
        const newId = products.value.length > 0 ? Math.max(...products.value.map(p => p.id)) + 1 : 1;
        products.value.push({ ...product, id: newId });
    }

    function updateProduct(product: Product) {
        const index = products.value.findIndex(p => p.id === product.id);
        if (index !== -1) {
            products.value[index] = product;
        }
    }

    function deleteProduct(id: number) {
        const index = products.value.findIndex(p => p.id === id);
        if (index !== -1) {
            products.value.splice(index, 1);
        }
    }

    function decreaseStock(id: number, quantity: number) {
        const product = products.value.find(p => p.id === id);
        if (product) {
            product.stock = Math.max(0, product.stock - quantity);
        }
    }

    return {
        products,
        activeCategory,
        searchQuery,
        categories,
        filteredProducts,
        setCategory,
        findProductByBarcode,
        addProduct,
        updateProduct,
        deleteProduct,
        decreaseStock
    };
});
