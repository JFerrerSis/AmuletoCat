// src/types/product.ts

export type SubcategoriaPulsera = 
  | "AMOR" 
  | "ESENCIALES" 
  | "Fe" 
  | "PROTECCION" 
  | "VENEZUELA";

export interface Product {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  categoria: string; // Flexible para añadir más categorías después
  subcategoria: SubcategoriaPulsera | string; // Permite las actuales y nuevas que añadas
  descripcion: string;
}

export interface CartItem extends Product {
  cantidad: number;
}