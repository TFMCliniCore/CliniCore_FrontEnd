// Forzamos a que use el Gateway si process.env no está listo, o cámbialo para usar tu archivo src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export const promocionesService = {
  getVigentes: async () => {
    const response = await fetch(`${API_URL}/promociones/vigentes`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al cargar las promociones vigentes');
    return response.json();
  }
};