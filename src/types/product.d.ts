export interface Product {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  categoria: string;
  descripcion: string;
}

export interface CartItem extends Product {
  cantidad: number;
}