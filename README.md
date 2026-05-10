🐾 Feature: Gestión de Mascotas y Clientes
Este branch introduce el módulo principal de Gestión de Clientes y Mascotas en el ecosistema CliniCore. Se han implementado vistas de listado, creación y se ha actualizado la navegación principal para integrar estas nuevas funcionalidades.

🚀 Cambios Principales
1. Módulo de Clientes (src/app/(dashboard)/clientes)
Listado de Clientes: Implementación de la vista para visualizar la base de datos de clientes registrados.

Registro de Clientes: Formulario dinámico para la creación de nuevos perfiles de clientes en el sistema.

2. Módulo de Mascotas (src/app/(dashboard)/mascotas)
Gestión de Pacientes: Estructura inicial para el manejo de mascotas vinculadas a clientes, permitiendo el flujo veterinario básico.

3. Infraestructura y UI
Sidebar (Sidebar.tsx): Se añadieron los accesos directos a los nuevos módulos de Clientes y Mascotas para mejorar la accesibilidad del usuario.

Integración API (api.ts): Definición de nuevos endpoints y servicios necesarios para el consumo de datos de las nuevas entidades.

Autenticación (login/page.tsx): Ajustes en el flujo de inicio de sesión para asegurar la redirección correcta hacia los nuevos paneles de gestión.

📂 Estructura de Archivos Nuevos
Plaintext
src/app/(dashboard)/
├── clientes/
│   ├── listar/        # Vista de tabla y filtros
│   └── nuevo/         # Formulario de alta de cliente
└── mascotas/          # Gestión centralizada de pacientes
🛠️ Instrucciones de Instalación Técnica
Si es la primera vez que despliegas estos cambios localmente, asegúrate de:

Actualizar Dependencias:

Bash
npm install
Configurar el .env: Verificar que las rutas de la API en src/lib/api.ts coincidan con tu entorno local o de desarrollo.

Ejecutar en Desarrollo:

Bash
npm run dev
Nota para el revisor: Se ha mantenido la consistencia estética con el resto del dashboard utilizando los componentes de Layout preexistentes. Los nuevos módulos están preparados para la integración con los microservicios de CliniCore.