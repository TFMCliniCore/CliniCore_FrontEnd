# Clinicore Dashboard

Sistema de gestión para clínicas veterinarias construido con Next.js 14, TypeScript y Tailwind CSS 4.

## 🚀 Características

- ✅ Next.js 14 con App Router
- ✅ TypeScript para type safety
- ✅ **Tailwind CSS 4** (última versión)
- ✅ Diseño responsive (mobile-first)
- ✅ Sidebar con gradiente verde-azul distintivo
- ✅ Header con búsqueda y perfil de usuario
- ✅ Menú de navegación completo
- ✅ Componentes reutilizables
- ✅ Iconos con Lucide React

## 📦 Instalación

### Requisitos previos

- Node.js 18.17 o superior
- pnpm (recomendado)

### Pasos de instalación

1. Instalar pnpm (si no lo tienes):
```bash
npm install -g pnpm
```

2. Instalar dependencias:
```bash
pnpm install
```

3. Ejecutar el servidor de desarrollo:
```bash
pnpm dev
```

4. Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

## ⚙️ Tailwind CSS 4

Este proyecto usa **Tailwind CSS 4**, que tiene diferencias importantes con la v3:

- **No más `@tailwind` directives**: Se usa `@import "tailwindcss"` en su lugar
- **Configuración con `@theme`**: Los colores y configuración se definen en CSS con `@theme`
- **Config simplificado**: El archivo `tailwind.config.ts` es más simple
- **PostCSS plugin**: Usa `@tailwindcss/postcss` en lugar de los plugins anteriores

### Gradientes personalizados

Los gradientes se aplican con estilos inline en lugar de clases de utilidad:
```tsx
style={{background: 'linear-gradient(180deg, #0a4d4d 0%, #0d6d6d 50%, #10a8a8 100%)'}}
```

## 🏗️ Estructura del Proyecto

```
clinicore-dashboard/
├── src/
│   ├── app/                      # Rutas de Next.js (App Router)
│   │   ├── layout.tsx           # Layout principal
│   │   ├── page.tsx             # Página de inicio (Dashboard)
│   │   ├── globals.css          # Estilos globales
│   │   ├── clientes/
│   │   ├── inventario/
│   │   ├── pos/
│   │   ├── mascotas/
│   │   ├── ventas/
│   │   ├── reportes/
│   │   └── logs/
│   └── components/
│       └── layout/
│           ├── DashboardLayout.tsx  # Layout principal del dashboard
│           ├── Sidebar.tsx          # Barra lateral con menú
│           └── Header.tsx           # Header con búsqueda y perfil
├── public/                      # Archivos estáticos
├── tailwind.config.js          # Configuración de Tailwind
├── tsconfig.json               # Configuración de TypeScript
└── package.json                # Dependencias del proyecto
```

## 🎨 Componentes de Layout

### DashboardLayout
Componente principal que envuelve toda la aplicación. Incluye:
- Sidebar fijo
- Header fijo
- Área de contenido principal

### Sidebar
- Gradiente verde-azul (teal a cyan)
- Logo de Clinicore
- Menú de navegación con 8 items
- Estados activos visuales
- Responsive (se oculta en mobile con toggle)
- Efectos hover y animaciones suaves

### Header
- Barra de búsqueda
- Notificaciones con badge
- Menú de usuario
- Responsive

## 📱 Responsive Design

- **Desktop (lg: 1024px+)**: Sidebar fijo + Header
- **Tablet (md: 768px+)**: Sidebar colapsable
- **Mobile (<768px)**: Sidebar en overlay con botón hamburguesa

## 🎯 Páginas Disponibles

- `/` - Dashboard (inicio)
- `/clientes` - Gestión de clientes
- `/inventario` - Control de inventario
- `/pos` - Punto de venta
- `/mascotas` - Gestión de mascotas
- `/ventas` - Registro de ventas
- `/reportes` - Reportes y estadísticas
- `/logs` - Logs del sistema

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
pnpm dev

# Build para producción
pnpm build

# Iniciar servidor de producción
pnpm start

# Linting
pnpm lint
```

## 🎨 Personalización

### Colores
Los colores principales están definidos en `src/app/globals.css` usando `@theme`:
```css
@theme {
  --color-primary-500: #00a8a8;
  --color-sidebar-start: #0a4d4d;
  --color-sidebar-middle: #0d6d6d;
  --color-sidebar-end: #10a8a8;
}
```
Puedes modificar estos colores según tus necesidades.

### Tipografía
El proyecto usa fuentes del sistema por defecto. Puedes agregar Google Fonts u otras fuentes personalizadas en el `@theme`.

## 📝 Próximos Pasos

1. Implementar las páginas específicas (Clientes, Inventario, etc.)
2. Agregar funcionalidad de autenticación
3. Conectar con API/Backend
4. Agregar validación de formularios
5. Implementar tablas de datos
6. Agregar gráficos y estadísticas

## 🤝 Contribuir

Este es un proyecto base. Puedes expandirlo según las necesidades específicas de tu clínica.

## 📄 Licencia

MIT License
