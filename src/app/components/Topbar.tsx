"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import { Menu, LogOut } from "lucide-react";

export default function Topbar({
  onToggle,
}: {
  onToggle: () => void;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/company/me", { credentials: "include" });
      if (res.status === 401) {
        router.replace("/");
        return;
      }
      if (!res.ok) {
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      setUser(data);
    } catch (error) {
      router.replace("/");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/");
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <header 
      className="fixed top-0 left-0 w-full h-[60px] z-30 bg-white border-b border-[var(--border)] flex items-center px-4 md:px-8"
    >
      {/* IZQUIERDA: Botón de hamburguesa visible solo en móviles */}
      <div className="flex-1 flex justify-start">
        <button
          onClick={onToggle}
          className="p-2 -ml-2 rounded-md text-gray-500 hover:text-black hover:bg-gray-100 transition-colors md:hidden focus:outline-none"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* CENTRO: Identidad corporativa de la empresa */}
      <div className="flex-1 flex justify-center text-center">
        {isLoading ? (
          <div className="h-6 w-32 md:w-48 bg-gray-200 animate-pulse rounded-md" />
        ) : (
          <strong className="text-lg md:text-xl font-extrabold text-[#111827] tracking-tight uppercase">
            {user?.companyName || "CRM"}
          </strong>
        )}
      </div>

      {/* DERECHA: Datos de sesión */}
      <div className="flex-1 flex items-center justify-end gap-2 md:gap-5">
        {isLoading ? (
          <div className="hidden md:block h-4 w-32 bg-gray-200 animate-pulse rounded-md" />
        ) : user ? (
          <span className="hidden md:inline-block text-sm text-gray-500">
            {user.email}
          </span>
        ) : null}

        {/* Botón Logout Responsivo y Fluido */}
        <button
          onClick={logout}
          title="Cerrar sesión"
          className="
          flex items-center gap-2 p-2 md:px-4 md:py-1.5 rounded-md 
          transition-colors duration-300 ease-in-out focus:outline-none
          /* Estilos Móvil: Ícono gris, sin borde, hover sutil */
          text-gray-500 hover:text-black hover:bg-gray-100
          /* Estilos Escritorio: Botón corporativo, borde negro, hover invertido */
          md:text-black md:bg-white md:border md:border-black md:hover:bg-black md:hover:text-white
          "
        >
          <span className="hidden md:inline text-sm font-semibold">
            Logout
          </span>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}