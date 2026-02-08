
import { onMounted, onUnmounted } from 'vue';

export function useBarcodeScanner(callback: (barcode: string) => void) {
    let barcodeBuffer = '';
    let lastKeyTime = 0;
    const TIMEOUT_MS = 100; // Max time between keystrokes for a scanner

    const handleKeydown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        // Ignore if typing in an input, UNLESS the buffer is empty and it looks like a rapid scan might be starting? 
        // Actually, safer to ignore inputs to avoid messing up manual search.
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        const currentTime = Date.now();

        // If too much time passed, reset buffer (it was manual typing)
        if (currentTime - lastKeyTime > TIMEOUT_MS) {
            barcodeBuffer = '';
        }

        lastKeyTime = currentTime;

        if (e.key === 'Enter') {
            if (barcodeBuffer.length > 2) {
                callback(barcodeBuffer); // Trigger callback
            }
            barcodeBuffer = '';
        } else if (e.key.length === 1) {
            // Only add printable characters
            barcodeBuffer += e.key;
        }
    };

    onMounted(() => {
        window.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown);
    });
}
