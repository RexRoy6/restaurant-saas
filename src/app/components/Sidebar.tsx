"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Users, Calendar, FileText, CreditCard,
  Briefcase, AlarmClock, Settings, Star,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { UserRole } from "@/db/schema";
import { canAccessRoute } from "@/lib/auth/canAccessRoute";

const menu = [
  { label: "Inicio", href: "/company", icon: Home },
  { label: "Registro Rápido", href: "/company/contracts/new", icon: Star },
  { label: "Servicios", href: "/company/service", icon: Briefcase },
  { label: "Clientes", href: "/company/clients", icon: Users },
  { label: "Eventos", href: "/company/events", icon: AlarmClock },
  { label: "Contratos", href: "/company/contracts", icon: FileText },
  { label: "Pagos", href: "/company/payments", icon: CreditCard },
  { label: "Calendario", href: "/company/calendar", icon: Calendar },
  { label: "Configuración", href: "/company/settings", icon: Settings },
];

export default function Sidebar({ 
  collapsed, 
  role,
  onToggle
}: { 
  collapsed: boolean; 
  role: UserRole;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const visibleMenu = menu.filter((item) => canAccessRoute(item.href, role));

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen z-50 
        bg-white border-r border-[var(--border)]
        transition-all duration-300 ease-in-out
        flex flex-col overflow-hidden
        w-[250px] 
        ${collapsed 
          ? "-translate-x-full md:translate-x-0 md:w-[80px]" 
          : "translate-x-0"
        }
      `}
    >
      {/* Cabecera del Sidebar: Isotipo + Dashboard + Colapsar */} 
      <div 
        className={`h-[60px] flex items-center shrink-0 border-b border-[var(--border)] transition-all duration-300 ${
          collapsed ? "justify-center gap-2 px-2" : "justify-between px-5"
        }`}
      >
        <div className={`flex items-center overflow-hidden transition-all duration-200 ${collapsed ? "gap-0" : "gap-3"}`}>
          {/* Añadimos shrink-0 aquí para proteger el contenedor */}
          <span className="shrink-0 flex items-center justify-center" title="Sandiasoft">
            <img
              src="/sandiasoft.png"
              alt="Sandiasoft Logo"
              // shrink-0 prohíbe que se comprima, object-contain protege la proporción
              className="h-8 w-8 object-contain shrink-0 transition-transform duration-200"
            />
          </span>
          <span 
            className={`font-semibold text-[#111827] tracking-wide transition-all duration-200 ${
              collapsed ? "opacity-0 w-0 hidden" : "opacity-100"
            }`}
          >
            Dashboard
          </span>
        </div>
        
        {/* Botón discreto visible solo en escritorio (protegido con shrink-0) */}
        <button
          onClick={onToggle}
          className="hidden md:flex p-1 rounded-md text-gray-400 hover:text-black hover:bg-gray-100 transition-colors shrink-0"
          aria-label="Colapsar menú"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Menú de Navegación */}
      <div className="flex-1 py-6 px-3 overflow-y-auto">
        <nav className="flex flex-col gap-2">
          {visibleMenu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${collapsed ? "justify-center md:px-0" : "justify-start"}
                  ${active 
                    ? "bg-[#111827] text-white" 
                    : "bg-transparent text-gray-500 hover:text-black hover:bg-gray-100"
                  }
                `}
              >
                <Icon size={20} className={`shrink-0 ${active ? "text-white" : "text-gray-400 group-hover:text-black"}`} />
                <span className={`text-sm font-medium tracking-tight whitespace-nowrap ${collapsed ? "md:hidden" : "block"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}