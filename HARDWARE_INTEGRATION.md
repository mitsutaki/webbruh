
# Hardware Integration Guide for Vue.js POS

This guide explains how to integrate physical hardware with the KasirChan POS application.

## 1. Barcode Scanner (USB / HID)
Most barcode scanners operate in **Keyboard Emulation Mode** (HID). This means they act like a keyboard: when a barcode is scanned, the scanner "types" the characters and sends an "Enter" key.

**How it works in this app:**
- We have a `useBarcodeScanner` composable or logic in `default.vue` and `useBarcodeScanner.ts`.
- It listens for specific timing (rapid keystrokes) followed by 'Enter'.
- **Setup:** Just plug in the scanner via USB. No drivers needed. ensuring the scanner is configured to add a "Carriage Return / Enter" suffix (usually default).

## 2. Thermal Printer & Cash Drawer
### Standard Web Method (Browser Print)
This is the most compatible method and works with any printer installed in the OS.

**Printer Setup:**
1. Install your Thermal Printer driver (e.g., EPSON TM-T82, Xprinter).
2. Set the Paper Size to `80mm` or `58mm` in the printer preferences.
3. **Cash Drawer Setup:** In the Printer Properties (Device Settings) in Windows/Mac, look for an option like "Cash Drawer" or "Peripherals". Set it to **"Open before printing"** or **"Open after printing"**.

**Usage:**
- Click the "Print Receipt" button in the app.
- The browser print dialog appears.
- Select your Thermal Printer.
- The receipt will print, and the drawer will pop open automatically (controlled by the driver).

### Advanced Method (Raw ESC/POS)
For silent printing (bypassing the dialog), you need a "Local Proxy".
- **Concept:** Run a small local server (Node.js/Python) that can access USB/Serial ports.
- **App Logic:** POST print data to `http://localhost:8080/print`.
- **Proxy Logic:** Sends raw bytes to the printer.

## 3. Customer Display (Dual Monitor)
We use the **BroadcastChannel API** to create a second window that syncs with the main cart.

**Usage:**
1. Connect a secondary monitor facing the customer.
2. In the POS Setup/Admin, click "Open Customer Display".
3. Drag the new window to the second monitor and press `F11` (Fullscreen).
4. The display will automatically show ads when idle and the cart content when you add items.

## 4. Web Serial API (Scale / VFD)
For connecting directly to Serial Port devices (like digital scales), we can use the experimental Web Serial API.
- Only works in Chrome/Edge (Secure Context HTTPS/Localhost).
- Requires user permission to select the port.
