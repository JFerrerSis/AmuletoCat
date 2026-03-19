import { atom, computed } from 'nanostores';
import type { CartItem, Product } from '../types/product';

// Definición de la estructura de datos del cliente
export interface CustomerData {
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  metodoEntrega: 'DELIVERY' | 'PICKUP';
  metodoPago: string;
}

// Átomos de estado
export const cartItems = atom<CartItem[]>([]);
export const isCartOpen = atom<boolean>(false);

// Átomo para almacenar la información del formulario
export const customerData = atom<CustomerData>({
  nombre: '',
  cedula: '',
  telefono: '',
  direccion: '',
  metodoEntrega: 'PICKUP',
  metodoPago: 'PAGO MOVIL'
});

// Computado para el total
export const cartTotal = computed(cartItems, (items) => {
  return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
});

// Acciones del carrito
export function addProductToCart(product: Product) {
  const currentItems = cartItems.get();
  const existingItem = currentItems.find(item => item.id === product.id);

  if (existingItem) {
    increaseQuantity(existingItem.id);
  } else {
    cartItems.set([...currentItems, { ...product, cantidad: 1 }]);
  }
  // UX: No abrimos el carrito automáticamente para permitir seguir comprando
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

/**
 * Genera el mensaje de WhatsApp y abre la aplicación
 */
export function sendOrderToWhatsApp() {
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