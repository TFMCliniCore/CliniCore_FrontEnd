import CrearProductoForm from '@/components/organisms/productos/CrearProductoForm'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export default function ProductosPage() {
  return (
    <div className="p-6">
      < Breadcrumbs />
      <h1 className="text-2xl font-bold mb-6 text-cyan-600">Gestión de Productos</h1>
      <CrearProductoForm />
    </div>
  )
}