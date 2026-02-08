
import { ref, watch } from 'vue';

export function useCustomerDisplay() {
    const channel = new BroadcastChannel('customer_display_channel');
    const isConnected = ref(false);

    // Listen for connection 'pings' from the opened window
    channel.onmessage = (event) => {
        if (event.data === 'DISPLAY_READY') {
            isConnected.value = true;
            // Send initial state immediately if needed, or just let the watcher handle it
        }
    };

    function openDisplay() {
        // Open a new window/tab that will act as the Customer Display
        // We will create a route for this later usually
        window.open('/customer-display', 'CustomerDisplay', 'width=800,height=600,menubar=no,toolbar=no,location=no');
    }

    function sendUpdate(data: any) {
        channel.postMessage({ type: 'UPDATE_CART', payload: data });
    }

    function sendTransaction(data: any) {
        channel.postMessage({ type: 'TRANSACTION_COMPLETE', payload: data });
    }

    return {
        openDisplay,
        sendUpdate,
        sendTransaction,
        isConnected
    };
}
