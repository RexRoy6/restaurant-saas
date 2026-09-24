"use client";

import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { UserRole } from "@/db/schema";

export default function CompanyShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: UserRole;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans">
      <Topbar
        onToggle={() => setCollapsed(!collapsed)}
      />

      {/* OVERLAY PARA MÓVILES: Se muestra si el menú no está colapsado */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setCollapsed(true)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        role={role}
      />

      {/* Contenedor Principal */}
      <div
        className={`
          flex-1 transition-all duration-300 ease-in-out
          pt-[60px] 
          ${collapsed ? "md:ml-[80px]" : "md:ml-[250px]"}
        `}
      >
        <main className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}