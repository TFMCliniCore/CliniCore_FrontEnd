# CliniCore FrontEnd

Interfaz web del sistema de gestión veterinaria CliniCore, construida con Next.js 14 (App Router), TailwindCSS y TypeScript.

## Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS 4
- Lucide React (iconografía)
- pnpm

## Variables de entorno

Crear el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
```

> En producción apunta a la URL pública del API Gateway.

## Ejecución en desarrollo

```bash
pnpm install
pnpm dev
```

Aplicación disponible en: `http://localhost:3000`

## Estructura de rutas

```text
src/
  app/
    (auth)/
      login/          # Página de inicio de sesión
    (dashboard)/
      page.tsx        # Dashboard principal
      perfil/         # Perfil del usuario autenticado
      usuarios/       # Gestión de usuarios y roles (solo Admin)
      clientes/
        listar/
        nuevo/
      mascotas/
        listar/
        nuevo/
        historial/
      agenda/
      farmacia/
      inventario/
      pos/
      caja/
      facturacion/
      telemedicina/
      reportes/
      sucursales/
  components/
    layout/
      Sidebar.tsx     # Navegación lateral con filtrado por rol
      Header.tsx      # Encabezado con datos del usuario y logout
      DashboardLayout.tsx
  hooks/
    useRoleGuard.ts   # Hook reutilizable de protección por rol
  lib/
    api.ts            # Cliente HTTP centralizado con JWT
  middleware.ts       # Middleware Next.js (actualmente pasthrough)
```

## Autenticación

El flujo de autenticación es completamente client-side usando `localStorage`:

1. El usuario ingresa credenciales en `/login`
2. El frontend llama a `POST http://localhost:3002/api/v1/auth/login`
3. El API Gateway valida con MS_Entidades-Core y devuelve `{ access_token, usuario }`
4. El token JWT y el objeto usuario se guardan en `localStorage`
5. Todas las llamadas a la API incluyen `Authorization: Bearer <token>` automáticamente

### Protección de rutas

- **`(dashboard)/layout.tsx`**: verifica que exista token en `localStorage` al montar. Si no hay token redirige a `/login`.
- **`(auth)/layout.tsx`**: si hay token activo redirige al dashboard (evita ver el login estando autenticado).
- **`useRoleGuard(rolesPermitidos)`**: hook que redirige al dashboard si el `rolId` del usuario no está en la lista permitida.

```ts
// Ejemplo: solo el rol 1 (Admin) puede entrar a esta página
import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function UsuariosPage() {
  useRoleGuard([1]);
  // ...
}
```

### Logout

El Header limpia `localStorage` (token y user) y redirige a `/login`.

## Menú lateral con control de acceso por rol

El `Sidebar.tsx` lee el `rolId` del usuario desde `localStorage` y filtra los ítems del menú según el campo `roles` de cada ítem:

```ts
{
  icon: Shield,
  label: "Usuarios y Roles",
  href: "/usuarios",
  roles: [1],   // solo visible para rolId === 1
  ...
}
```

Si un ítem no tiene campo `roles`, es visible para todos los roles.

## Cliente API (`src/lib/api.ts`)

Función central `apiFetch` que:
- Lee el token de `localStorage`
- Agrega el header `Authorization: Bearer <token>` automáticamente
- Apunta a `NEXT_PUBLIC_API_URL` (API Gateway)

Funciones disponibles:

| Función | Descripción |
| --- | --- |
| `authApi.login(email, password)` | Inicio de sesión |
| `usuariosApi.listar()` | Lista todos los usuarios |
| `usuariosApi.obtener(id)` | Obtiene un usuario por ID |
| `usuariosApi.actualizar(id, data)` | Actualiza nombre, celular, cargo, rolId, contrasena |
| `usuariosApi.subirFoto(id, file)` | Sube foto de perfil (multipart/form-data) |
| `rolesApi.listar()` | Lista todos los roles |
| `resolveImageUrl(path)` | Convierte la ruta relativa de foto en URL completa |

## Perfil de usuario (`/perfil`)

Página que permite al usuario autenticado:
- Ver y cambiar su foto de perfil (JPG / PNG / WebP, máx. 3 MB)
- Editar nombre y celular
- Cambiar su rol (desplegable poblado desde la tabla de roles)
- Cambiar su contraseña (campo tipo password, dejar vacío para no cambiar)

Los cambios se sincronizan en `localStorage` y el Header se actualiza en tiempo real mediante el evento DOM `user-updated`.

## Notas de despliegue

- El frontend se ejecuta directamente con Node.js / pnpm (no está dockerizado).
- Los microservicios y el API Gateway sí corren en Docker.
- Asegurarse de que `NEXT_PUBLIC_API_URL` apunte correctamente al API Gateway antes de levantar.
