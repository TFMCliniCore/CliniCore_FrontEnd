const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008/api';

export const cierresCajaService = {
  // Verifica si el usuario actual tiene una caja abierta
  getEstadoTurno: async () => {
    const response = await fetch(`${API_URL}/cierres-caja/estado-actual`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}` -> Descomentar cuando manejes JWT
      },
    });
    if (!response.ok) throw new Error('Error al consultar el estado de la caja');
    return response.json();
  },

  // Abre un nuevo turno de caja con un monto base
  abrirCaja: async (montoInicial: number) => {
    const response = await fetch(`${API_URL}/cierres-caja/abrir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseInicial: montoInicial }),
    });
    if (!response.ok) throw new Error('Error al abrir la caja');
    return response.json();
  },

  // Cierra el turno actual enviando los montos calculados por el cajero
  cerrarCaja: async (payload: { montoFinalEfectivo: number; observaciones?: string }) => {
    const response = await fetch(`${API_URL}/cierres-caja/cerrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error al procesar el cierre de caja');
    return response.json();
  }
};