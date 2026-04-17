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

## 🚀 Despliegue en Ubuntu + Apache (Producción)

> Esta guía asume Ubuntu 22.04/24.04, Apache2 y dominio/subdominio apuntando al servidor.

### 1) Preparar el servidor

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl apache2
```

Instalar Node.js 20 LTS (recomendado para Next.js 14):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Instalar pnpm y PM2:

```bash
sudo npm install -g pnpm pm2
pnpm -v
pm2 -v
```

### 2) Descargar el repositorio en el servidor

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone <URL_DEL_REPO> clinicore-frontend
sudo chown -R $USER:$USER /var/www/clinicore-frontend
cd /var/www/clinicore-frontend
```

### 3) Instalar dependencias y generar build

```bash
pnpm install --frozen-lockfile
pnpm build
```

Esto crea la compilación de producción de Next.js en `.next/`.

### 4) Levantar la app Next.js con PM2 (monitoreo + reinicio automático)

```bash
cd /var/www/clinicore-frontend
pm2 start "pnpm start -- -p 3000" --name clinicore-front
pm2 save
pm2 startup
```

Comandos útiles de monitoreo:

```bash
pm2 status
pm2 logs clinicore-front
pm2 monit
pm2 restart clinicore-front
```

### 5) Configurar Apache como Reverse Proxy hacia Next.js

Habilitar módulos:

```bash
sudo a2enmod proxy proxy_http proxy_wstunnel headers rewrite ssl
sudo systemctl restart apache2
```

Crear virtual host `/etc/apache2/sites-available/clinicore-front.conf`:

```apache
<VirtualHost *:80>
    ServerName tu-dominio.com
    ServerAlias www.tu-dominio.com

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    # WebSocket (si aplica)
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://127.0.0.1:3000/$1 [P,L]

    ErrorLog ${APACHE_LOG_DIR}/clinicore-front-error.log
    CustomLog ${APACHE_LOG_DIR}/clinicore-front-access.log combined
</VirtualHost>
```

Activar el sitio:

```bash
sudo a2ensite clinicore-front.conf
sudo a2dissite 000-default.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

### 6) SSL con Let's Encrypt (recomendado)

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d tu-dominio.com -d www.tu-dominio.com
sudo systemctl status certbot.timer
```

### 7) Flujo de actualización (deploy continuo manual)

Cada vez que publiques cambios:

```bash
cd /var/www/clinicore-frontend
git pull origin main
pnpm install --frozen-lockfile
pnpm build
pm2 restart clinicore-front
```

### 8) Archivos y logs clave para soporte/monitoreo

- App Next.js: `/var/www/clinicore-frontend`
- Build: `/var/www/clinicore-frontend/.next`
- Logs PM2: `~/.pm2/logs/`
- Logs Apache: `/var/log/apache2/clinicore-front-*.log`

---

### Opción alternativa (sitio estático)

Si más adelante quieres desplegar como estático en Apache sin proceso Node:

1. Configura `output: "export"` en `next.config.js`.
2. Ejecuta `pnpm build`.
3. Publica la carpeta `out/` en el `DocumentRoot` de Apache.

> Nota: esta opción no sirve para funcionalidades que dependan de renderizado dinámico en servidor.

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
