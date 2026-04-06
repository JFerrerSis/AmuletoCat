import { atom, computed } from 'nanostores';
import type { CartItem, Product } from '../types/product';

const STORAGE_KEY = 'amuleto_cart_v1';

export interface CustomerData {
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  metodoEntrega: 'DELIVERY' | 'PICKUP';
  metodoPago: 'MERCADO PAGO' | 'EFECTIVO' | 'TRANSFERENCIA'; // Tipado específico
}

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
  metodoPago: 'MERCADO PAGO' // Ajustado como predeterminado
});

// --- Persistencia Automática ---
if (typeof window !== 'undefined') {
  cartItems.listen((items) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  });
}

// --- Computado ---
export const cartTotal = computed(cartItems, (items) => {
  return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
});

// --- Acciones ---
export function addToCart(product: Product) {
  const currentItems = cartItems.get();
  const existingItem = currentItems.find(item => item.id === product.id);

  if (existingItem) {
    increaseQuantity(existingItem.id);
  } else {
    cartItems.set([...currentItems, { ...product, cantidad: 1 }]);
  }
}

export function increaseQuantity(id: string | number) {
  const newItems = cartItems.get().map(item =>
    item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
  );
  cartItems.set(newItems);
}

export function decreaseQuantity(id: string | number) {
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

export function removeFromCart(id: string | number) {
  cartItems.set(cartItems.get().filter(item => item.id !== id));
}

export function clearCart() {
  cartItems.set([]);
  localStorage.removeItem(STORAGE_KEY);
}

// --- WhatsApp Adaptado a Argentina ---
export function sendOrderToWhatsApp() {
  const items = cartItems.get();
  const data = customerData.get();
  const total = cartTotal.get();
  const phone = import.meta.env.PUBLIC_WHATSAPP_NUMBER;
  
  if (items.length === 0) return;

  // Formateador para pesos argentinos en el mensaje
  const formatARS = (val: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);

  let message = `*✨ NUEVA ORDEN - AMULETO* \n`;
  message += `_Accesorios hechos a mano._\n\n`;
  message += `*DATOS DEL CLIENTE:*\n`;
  message += `👤 *Nombre:* ${data.nombre.toUpperCase()}\n`;
  message += `🆔 *DNI:* ${data.cedula}\n`; // Cambiado de Cédula a DNI
  message += `📞 *Teléfono:* ${data.telefono}\n`;
  message += `📍 *Entrega:* ${data.metodoEntrega === 'PICKUP' ? 'Retiro por el local' : 'Envío a domicilio'}\n`;
  
  if (data.metodoEntrega === 'DELIVERY') {
    message += `🏠 *Dirección:* ${data.direccion}\n`;
  }
  
  message += `💳 *Forma de Pago:* ${data.metodoPago}\n`;
  message += `\n*DETALLE DE LA COMPRA:*\n`;

  items.forEach(item => {
    message += `💎 ${item.cantidad}x ${item.nombre} - _${formatARS(item.precio * item.cantidad)}_\n`;
  });

  message += `\n*TOTAL FINAL: ${formatARS(total)}*\n`;
  message += `\n_Quedo a la espera de los datos de pago para confirmar mi pedido. Muchas gracias._`;

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
}