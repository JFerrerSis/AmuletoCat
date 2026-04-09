// src/types/product.ts

export type SubcategoriaPulsera = 
  | "AMOR" 
  | "ESENCIALES" 
  | "Fe" 
  | "PROTECCION" 
  | "VENEZUELA"
  | "GENERAL"; // Añadí GENERAL para los rosarios

export interface Product {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  imagenes?: string[]; // <--- AÑADE ESTA LÍNEA (la '?' indica que es opcional)
  categoria: string;
  subcategoria: SubcategoriaPulsera | string;
  descripcion: string;
}

export interface CartItem extends Product {
  cantidad: number;
}