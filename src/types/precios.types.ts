// DTO (Data Transfer Object) para enviar datos desde el formulario al backend
export interface ActualizarPrecioDto {
  productoId: number;
  costoBase: number;
  margenPorcentaje: number;
}

// Representa un registro en la tabla de auditoría
export interface HistorialPrecio {
  id: number;
  productoId: number;
  precioAnterior: number;
  precioNuevo: number;
  margenAplicado: number;
  fechaCambio: string;
  usuarioId: number; // Para saber qué empleado hizo el cambio
}