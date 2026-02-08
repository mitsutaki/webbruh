
// Database Types Mapping

export interface Customer {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    created_at?: Date;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface Product {
    id: number;
    category_id: number; // Foreign Key
    barcode?: string;
    name: string;
    price: number;
    stock: number;
    image_url?: string;
    created_at?: Date;
    updated_at?: Date;

    // Frontend helper props (joined data)
    category_name?: string;
}

export interface Transaction {
    id: number | string; // Numeric ID in DB, but might use String UUID in frontend/mock
    customer_id?: number | null;
    cashier_id?: number;
    transaction_date: Date;

    // Financials
    total_amount: number;
    tax: number;
    discount: number;

    // Payment
    payment_method: 'CASH' | 'CARD' | 'QRIS' | 'OTHER';
    payment_amount: number;
    change_amount: number;

    // Relations
    details?: TransactionDetail[];
    customer?: Customer;
}

export interface TransactionDetail {
    id: number;
    transaction_id: number | string;
    product_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;

    // Frontend helper
    product_name?: string;
}
