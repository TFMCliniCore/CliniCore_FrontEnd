// Define los tipos de lógica promocional que soporta el sistema
export type TipoDescuento = 'PORCENTAJE' | 'MONTO_FIJO' | 'CANTIDAD'; 

export interface Promocion {
  id: number;
  nombre: string;              // Ej: "Descuento 20% en Vacunas" o "Promo 3x2 en Alimento"
  tipoDescuento: TipoDescuento;
  valorDescuento: number;      // Ej: 20 (para porcentaje), 5000 (para monto), 3 (para 3x2)
  productoId?: number;         // Si la promo aplica a un producto específico
  categoriaId?: number;        // Si la promo aplica a toda una categoría
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
}