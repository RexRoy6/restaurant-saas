"use client";

import { useState } from "react";
import PageHeader from "@/app/components/crm/PageHeader";
import SearchBar from "@/app/components/crm/SearchBar";
import Pagination from "@/app/components/crm/Pagination";
import ErrorBox from "@/app/components/ErrorBox";
import ClientList from "./ClientList";
import ClientModal from "@/app/components/crm/clients/ClientModal"; // Importamos nuestro súper modal
import { useClients } from "@/app/hooks/clients/useClients";
import { Users, Plus } from "lucide-react"; // Íconos para la UI

export default function ClientsModule() {
  const {
    clients,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    pagination,
    deleteClient,
  } = useClients();

  // Ya no necesitamos los estados del form, solo controlar si el modal está abierto o cerrado
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleDelete(id: number) {
    const confirmed = confirm("¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.");
    if (!confirmed) return;
    await deleteClient(id);
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">

      {/* Título simple */}
      <PageHeader 
        title="Directorio de Clientes" 
        icon={Users} 
        
        buttonLabel="+ Nuevo Cliente"
        onClick={() => setIsModalOpen(true)}
      />

      {/* Barra de Herramientas */}
      <div className="w-full sm:max-w-md">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o teléfono..."
        />
      </div>

      {/* Contenedor de la Lista y Estados */}
      <div className="flex flex-col">

        {error && (
          <div className="mb-4 animate-in fade-in">
            <ErrorBox message={error} />
          </div>
        )}

        {loading ? (
          /* Estado de Carga: Skeleton Loader */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl border border-gray-200 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {clients.length === 0 ? (
              /* Estado Vacío (Simple y claro como pediste) */
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No se encontraron clientes</h3>
                <p className="text-sm text-gray-500">Intenta con otra búsqueda o registra uno nuevo.</p>
              </div>
            ) : (
              /* Lista de Clientes Real */
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <ClientList
                  clients={clients}
                  onDelete={handleDelete}
                />

                {/* Mostramos paginación solo si hay más de 1 página */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <Pagination
                      page={page}
                      totalPages={pagination.totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Reutilizado */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          // Al crear un cliente, limpiamos el buscador y vamos a la página 1 para verlo
          setSearch("");
          setPage(1);
          // Nota: Para que los datos se refresquen instantáneamente, idealmente 
          // fetchClients() debería ser llamado, pero cambiar la página o el buscador 
          // suele detonar el useEffect de tu useClients automáticamente.
        }}
      />
    </div>
  );
}