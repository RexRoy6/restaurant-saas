"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Calculator } from "lucide-react";

import EventInfoCard from "@/app/components/crm/EventInfoCard";
import ErrorBox from "@/app/components/ErrorBox";
import ContractServiceForm from "@/app/components/crm/contracts/ContractServiceForm";
import ContractServicesList from "@/app/components/crm/contracts/ContractServicesList";

import { useContractServices } from "@/app/hooks/contracts/useContractServices";

export default function ContractServicesPage() {
  const params = useParams();
  const contractId = Number(params.contractId);

  const {
    services,
    companyServices,
    contract,
    loading,
    error,
    errorCode,
    createService,
    deleteItem,
    updateItem,
  } = useContractServices(contractId);

  // Cálculo del total
  const contractTotal = services.reduce((sum, item) => {
    return sum + Number(item.quantity) * Number(item.unitPrice);
  }, 0);

  // Formateador de moneda
  const formatMoney = (value: number) =>
    `$${value.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
    })}`;

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-10">
      
      {/* 1. NAVEGACIÓN Y CABECERA */}
      <div className="flex items-start gap-3">
        <Link
          href={`/company/contracts/${contractId}`}
          className="p-2 -ml-2 mt-0.5 text-gray-400 hover:text-gray-900 bg-transparent hover:bg-gray-100 rounded-full transition-colors focus:outline-none shrink-0"
          title="Volver al contrato"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex flex-col gap-2.5">
          <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight m-0 leading-none mt-1">
            <Briefcase size={28} className="text-gray-400 hidden sm:block" />
            Servicios del Contrato
            <span className="text-gray-400 font-medium">#{contractId}</span>
          </h1>
        </div>
      </div>

      {error && <ErrorBox message={error} code={errorCode} />}

      {/* 2. RESUMEN FINANCIERO (Diseño claro y minimalista) */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-600">
            <Calculator size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">
              Total del Contrato
            </span>
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {formatMoney(contractTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CONTENIDO PRINCIPAL */}
      <div className="flex flex-col gap-8">
        
        {/* Tarjeta de Información del Evento */}
        {contract?.eventId && (
          <div className="w-full">
            <EventInfoCard eventId={contract.eventId} />
          </div>
        )}

        {/* Formulario y Lista de Servicios */}
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          
          {/* Formulario de Registro (Columna Izquierda) */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
              Agregar Servicio
            </h2>
            <ContractServiceForm
              companyServices={companyServices}
              contract={contract}
              onSubmit={createService}
            />
          </div>

          {/* Lista de Servicios (Columna Derecha) */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
              Servicios Registrados
            </h2>
            <ContractServicesList
              services={services}
              companyServices={companyServices} 
              loading={loading}
              onDelete={deleteItem}
              onUpdate={updateItem}
            />
          </div>

        </div>
      </div>
      
    </div>
  );
}