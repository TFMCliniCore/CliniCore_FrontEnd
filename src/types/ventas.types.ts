// Define el método de pago aceptado en la caja
export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'MIXTO';

// Define el estado operativo de una venta
export type EstadoVenta = 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';

export interface Pago {
  id: number;
  metodo: MetodoPago;
  monto: number;
  fechaPago: string;
}

export interface Factura {
  id: number;
  codigo: string;          // Ej: FACT-00123
  fechaEmision: string;
  urlPdf?: string;         // Enlace al archivo PDF si se generó
}

export interface DetalleVenta {
  id: number;
  productoId: number;
  nombreProducto: string;  // Útil para renderizar el carrito rápido
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  fecha: string;
  total: number;
  estado: EstadoVenta;
  motivoAnulacion?: string; // Solo presente si el estado es ANULADA
  
  // Relaciones
  detalles: DetalleVenta[];
  pagos: Pago[];
  factura?: Factura;
  clienteId?: number;
  cajeroId: number;
}