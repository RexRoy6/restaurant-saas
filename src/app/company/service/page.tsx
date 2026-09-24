"use client";

import { useState, useEffect } from "react";
import { Plus, Package } from "lucide-react";

import ErrorBox from "@/app/components/ErrorBox";
import ServiceCreateForm from "@/app/components/crm/services/ServiceCreateForm";
import ServiceList from "@/app/components/crm/services/ServiceList";

import { useCompanyServices } from "@/app/hooks/services/useCompanyServices";

export default function ServicesPage() {
  const {
    services,
    loading,
    error,
    errorCode,
    createService,
  } = useCompanyServices();

  // Estado para controlar el modal de creación
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Bloquear el scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  // Wrapper para cerrar el modal después de crear con éxito
  const handleCreate = async (data: any) => {
    const success = await createService(data);
    // Si la función devuelve algo truthy o no arroja error, cerramos el modal
    if (success !== false) { 
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      
      {/* ===================== HEADER ===================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight m-0">
          <Package size={28} className="text-gray-400 hidden sm:block" />
          Catálogo de Servicios
        </h1>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black shrink-0"
        >
          <Plus size={18} />
          Nuevo Servicio
        </button>
      </div>

      {/* ===================== ERRORES ===================== */}
      {error && <ErrorBox message={error} code={errorCode} />}

      {/* ===================== MODAL DE CREACIÓN ===================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg my-8 animate-in zoom-in-95 duration-200">
            {/* 
              Asumimos que ServiceCreateForm utiliza el componente <CreateForm /> por dentro 
              y renderiza su propia tarjeta blanca con padding. 
              Le pasamos onCancel (si lo soporta) para que el usuario pueda cerrarlo desde adentro.
            */}
            <ServiceCreateForm
              onSubmit={handleCreate}
              onCancel={() => setIsModalOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* ===================== LISTA DE SERVICIOS ===================== */}
      <div className="w-full animate-in fade-in duration-300">
        <ServiceList
          services={services}
          loading={loading}
        />
      </div>

    </div>
  );
}