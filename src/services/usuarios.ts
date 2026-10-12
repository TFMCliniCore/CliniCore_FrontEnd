const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-gateway-5pb1.onrender.com/api/v1';

// Función para sanitizar payloads y evitar errores de 'forbidNonWhitelisted' en NestJS
function sanitizarUsuarioDto(data: Record<string, any>) {
  const camposPermitidos = [
    'nombre',
    'apellido',
    'email',
    'contrasena',
    'documento',
    'telefono',
    'direccion',
    'sucursalId',
    'rolId',
  ];

  const payload: Record<string, any> = {};
  for (const campo of camposPermitidos) {
    if (data[campo] !== undefined && data[campo] !== null && data[campo] !== '') {
      payload[campo] = data[campo];
    }
  }
  return payload;
}

export const usuariosService = {
  // Obtener lista de usuarios
  findAll: async () => {
    const res = await fetch(`${API_URL}/usuarios`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Error al obtener la lista de usuarios');
    return res.json();
  },

  // Crear usuario sanitizando el DTO
  create: async (data: any) => {
    const bodySanitizado = sanitizarUsuarioDto(data);

    const res = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodySanitizado),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = Array.isArray(err.message) ? err.message.join(', ') : err.message;
      throw new Error(message || 'Error al crear el usuario');
    }

    return res.json();
  },

  // Actualizar usuario sanitizando el DTO
  update: async (id: number | string, data: any) => {
    const bodySanitizado = sanitizarUsuarioDto(data);

    const res = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodySanitizado),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = Array.isArray(err.message) ? err.message.join(', ') : err.message;
      throw new Error(message || 'Error al actualizar el usuario');
    }

    return res.json();
  },

  // Subir foto usando la clave exacta 'foto' en el FormData
  uploadFoto: async (id: number | string, file: File) => {
    const formData = new FormData();
    formData.append('foto', file); // Nombre que espera FileInterceptor('foto')

    const res = await fetch(`${API_URL}/usuarios/${id}/foto`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al subir la imagen de perfil');
    }

    return res.json();
  },
};