"use client";

import { PackageSearch } from "lucide-react";
import ServiceCard from "./ServiceCard";

type Props = {
    services: any[];
    loading: boolean;
};

export default function ServiceList({ services, loading }: Props) {
    
    // ===================== ESTADO DE CARGA =====================
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div 
                        key={i} 
                        className="h-36 bg-gray-100 rounded-xl border border-gray-200 animate-pulse"
                    ></div>
                ))}
            </div>
        );
    }

    // ===================== ESTADO VACÍO =====================
    if (services.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <PackageSearch size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Inventario vacío
                </h3>
                <p className="text-sm text-gray-500">
                    Aún no has registrado ningún servicio o equipo en tu catálogo.
                </p>
            </div>
        );
    }

    // ===================== GRID DE SERVICIOS =====================
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
            {services.map((service) => (
                <ServiceCard
                    key={service.id}
                    service={service}
                />
            ))}
        </div>
    );
}