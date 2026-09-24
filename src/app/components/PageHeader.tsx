"use client";

import React from "react";

type Props = {
  title: React.ReactNode
  icon?: React.ElementType; 
  buttonLabel?: string;
  onClick?: () => void;
  action?: React.ReactNode; // Permite renderizar componentes personalizados (ej. PaymentForm)
  badge?: React.ReactNode;  // Permite renderizar etiquetas junto al título
};

export default function PageHeader({ title, icon: Icon, buttonLabel, onClick, action, badge }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      
      {/* Contenedor del Título + Ícono + Badge */}
      <div className="flex items-center gap-3">
        <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight m-0">
          {Icon && <Icon size={28} className="text-gray-400 hidden sm:block shrink-0" />}
          {title}
        </h1>
        {badge && <div className="flex items-center">{badge}</div>}
      </div>

      {/* Contenedor de la Acción (Botón estándar o Componente custom) */}
      <div className="shrink-0 w-full sm:w-auto">
        {action ? (
          action
        ) : (
          buttonLabel && onClick && (
            <button
              onClick={onClick}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black shrink-0"
            >
              {buttonLabel}
            </button>
          )
        )}
      </div>
    </div>
  );
}