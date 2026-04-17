export type SubcategoriaPulsera = 
  | "AMOR" 
  | "ESENCIALES" 
  | "Fe" 
  | "PROTECCION" 
  | "VENEZUELA"
  | "LARGOS"
  | "GARGANTILLAS"
  | "MULTICOLOR"
  | "GENERAL";


export interface Product {
  id: string;
  nombre: string;
  precio: number;
  // Puede ser un string único o un array de strings para carruseles
  imagen: string | string[]; 
  categoria: string;
  subcategoria?: SubcategoriaPulsera | string;
  descripcion: string;
}

export interface CartItem extends Product {
  cantidad: number;
}