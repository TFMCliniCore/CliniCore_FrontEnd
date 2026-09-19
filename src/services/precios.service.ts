const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008/api';

export const preciosService = {
  // Envía los costos y márgenes para calcular el precio final sugerido
  calcular: async (payload: { productoId: number; costoBase: number; margenPorcentaje: number }) => {
    const response = await fetch(`${API_URL}/precios/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error en la simulación de precios');
    return response.json();
  },

  // Obtiene la tabla histórica de variaciones de precio de un producto
  getHistorialByProducto: async (productoId: string | number) => {
    const response = await fetch(`${API_URL}/precios/historial/${productoId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al obtener el historial de precios');
    return response.json();
  }
};