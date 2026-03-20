import { atom, computed, onMount } from 'nanostores';
import type { CartItem, Product } from '../types/product';

// Clave para el almacenamiento
const STORAGE_KEY = 'midnight_cart_v1';

export interface CustomerData {
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  metodoEntrega: 'DELIVERY' | 'PICKUP';
  metodoPago: string;
}

// Helper para obtener datos iniciales de forma segura (evita errores de SSR en Astro)
const getInitialCart = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }
  return [];
};

// --- Átomos de estado ---
export const cartItems = atom<CartItem[]>(getInitialCart());
export const isCartOpen = atom<boolean>(false);

export const customerData = atom<CustomerData>({
  nombre: '',
  cedula: '',
  telefono: '',
  direccion: '',
  metodoEntrega: 'PICKUP',
  metodoPago: 'PAGO MOVIL'
});

// --- Persistencia Automática ---
// Escucha cambios en cartItems y guarda en localStorage automáticamente
cartItems.listen((items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
});

// --- Computado ---
export const cartTotal = computed(cartItems, (items) => {
  return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
});

// --- Acciones ---
export function addProductToCart(product: Product) {
  const currentItems = cartItems.get();
  const existingItem = currentItems.find(item => item.id === product.id);

  if (existingItem) {
    increaseQuantity(existingItem.id);
  } else {
    cartItems.set([...currentItems, { ...product, cantidad: 1 }]);
  }
}

export function increaseQuantity(id: string) {
  const newItems = cartItems.get().map(item =>
    item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
  );
  cartItems.set(newItems);
}

export function decreaseQuantity(id: string) {
  const currentItems = cartItems.get();
  const item = currentItems.find(i => i.id === id);
  
  if (item && item.cantidad > 1) {
    const newItems = currentItems.map(i =>
      i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i
    );
    cartItems.set(newItems);
  } else {
    removeFromCart(id);
  }
}

export function removeFromCart(id: string) {
  cartItems.set(cartItems.get().filter(item => item.id !== id));
}

export function clearCart() {
  cartItems.set([]);
  localStorage.removeItem(STORAGE_KEY);
}

export function sendOrderToWhatsApp() {
  // ... tu lógica de WhatsApp se mantiene igual
  const items = cartItems.get();
  const data = customerData.get();
  const total = cartTotal.get();
  const phone = import.meta.env.PUBLIC_WHATSAPP_NUMBER;
  
  if (items.length === 0) return;

  let message = `*📦 PEDIDO - MIDNIGHT STUDIO*\n`;
  message += `--------------------------------\n`;
  message += `👤 *CLIENTE:* ${data.nombre.toUpperCase()}\n`;
  message += `🆔 *CÉDULA:* ${data.cedula}\n`;
  message += `📞 *TELÉFONO:* ${data.telefono}\n`;
  message += `📍 *ENTREGA:* ${data.metodoEntrega}\n`;
  
  if (data.metodoEntrega === 'DELIVERY') {
    message += `🏠 *DIRECCIÓN:* ${data.direccion}\n`;
  }
  
  message += `💳 *PAGO:* ${data.metodoPago}\n`;
  message += `--------------------------------\n`;
  message += `*DETALLE DEL PEDIDO:*\n`;

  items.forEach(item => {
    message += `- ${item.cantidad}x ${item.nombre} ($${(item.precio * item.cantidad).toFixed(2)})\n`;
  });

  message += `--------------------------------\n`;
  message += `*TOTAL FINAL: $${total.toFixed(2)}*`;

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
}