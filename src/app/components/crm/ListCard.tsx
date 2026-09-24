"use client";

import { useRouter } from "next/navigation";
import React from "react";

type Badge = { label: string };
type Action = { label: string; onClick?: () => void; color?: string };
type MetaItem = { icon?: React.ReactNode; label: string };

type ListCardProps = {
  title?: string;
  subtitle?: string;
  content?: React.ReactNode;
  meta?: MetaItem[];
  badge?: Badge;
  actions?: Action[];
  link?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  isActive?: boolean;
};

export default function ListCard({
  title,
  subtitle,
  content,
  meta = [],
  badge,
  actions = [],
  link,
  onClick,
  children,
  isActive = true,
}: ListCardProps) {
  const router = useRouter();

  // Diccionario de colores corporativos para etiquetas (traducidas)
  const badgeStyles: Record<string, string> = {
    pagado: "bg-green-100 text-green-800",
    completado: "bg-green-100 text-green-800",
    activo: "bg-blue-100 text-blue-800",
    pendiente: "bg-yellow-100 text-yellow-800",
    parcial: "bg-yellow-100 text-yellow-800",
    cancelado: "bg-red-100 text-red-800",
    draft: "bg-yellow-100 text-yellow-800", // Mapeo de seguridad
  };

  const getBadgeClass = () => {
    if (!isActive) return "bg-red-500 text-white";
    const label = badge?.label?.toLowerCase() || "";
    return badgeStyles[label] || "bg-gray-200 text-gray-700";
  };

  const handleClick = () => {
    if (onClick) return onClick();
    if (link) return router.push(link);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white p-5 rounded-xl transition-all duration-200 
        ${isActive ? "border border-gray-200 opacity-100" : "border border-red-500 opacity-60"}
        ${(link || onClick) ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""}
        mb-3 w-full
      `}
    >
      {/* HEADER */}
      {(title || actions.length > 0) && (
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-3">
            {title && (
              <h3 className="m-0 text-base font-semibold text-gray-900 tracking-tight">
                {title}
              </h3>
            )}

            {(badge || !isActive) && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize tracking-wider w-fit ${getBadgeClass()}`}>
                {badge?.label || "Inactivo"}
              </span>
            )}
          </div>

          {actions.length > 0 && (
            <div className="flex gap-2 ml-4 shrink-0">
              {actions.map((action, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick?.();
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors focus:outline-none"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTITLE */}
      {subtitle && (
        <p className="m-0 mb-3 text-sm text-gray-500">
          {subtitle}
        </p>
      )}

      {/* CONTENT */}
      {content && (
        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-900 mb-3 border border-gray-100">
          {content}
        </div>
      )}

      {/* META */}
      {meta.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {meta.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md"
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      )}

      {/* CHILDREN LIBRE */}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}