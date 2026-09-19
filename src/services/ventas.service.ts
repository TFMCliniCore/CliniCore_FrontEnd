const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008/api';

export const ventasService = {
  // Obtiene el listado completo de facturas/ventas
  findAll: async () => {
    const response = await fetch(`${API_URL}/ventas`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al obtener el historial de ventas');
    return response.json();
  },

  // Consulta el detalle de una factura específica
  findOne: async (id: string | number) => {
    const response = await fetch(`${API_URL}/ventas/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error al obtener la venta con ID ${id}`);
    return response.json();
  },

  // Dispara la anulación de una venta enviando el motivo en el body
  anular: async (id: string | number, motivo: string) => {
    const response = await fetch(`${API_URL}/ventas/${id}/anular`, {
      method: 'POST', // o PATCH/PUT dependiendo de tu definición en el backend
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivoAnulacion: motivo }),
    });
    if (!response.ok) throw new Error('Error al intentar anular la venta');
    return response.json();
  }
};