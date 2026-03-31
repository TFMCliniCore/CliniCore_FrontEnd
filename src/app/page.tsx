import DashboardCards from "@/components/DashboardCards";
import InventarioOverview from "@/components/organisms/productos/InventarioOverview";
export default function Home() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bienvenido al sistema de gestión Clinicore</p>
      </div>

      {/* Stats Cards */}
      <>
        <DashboardCards />
        <InventarioOverview />
      </>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del Día</h2>
        <p className="text-gray-600">Aquí irá el contenido específico de cada página...</p>
      </div>
    </div>
  );
}
