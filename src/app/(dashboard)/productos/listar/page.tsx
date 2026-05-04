import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ListaProductos from '@/components/organisms/productos/ListaProductos';
import InventarioOverview from '@/components/organisms/productos/InventarioOverview';

export default function ProductosPage() {
  return (
    <div className="p-6">
      < Breadcrumbs />
      <h1 className="text-2xl font-bold mb-6 text-cyan-600">Gestión de Productos</h1>
      <p>Dashboard de Productos</p>
      <InventarioOverview />
      <hr />
      <ListaProductos />
    </div>
  )
}