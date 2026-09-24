"use client";

import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";

export default function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  // Efecto de entrada suave
  useEffect(() => {
    setIsVisible(true);
    // Auto-ocultar después de 5 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Espera a que termine la animación para desmontar
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 
        bg-white rounded-xl shadow-2xl border border-gray-100 border-l-4 border-l-red-500
        transition-all duration-300 ease-out transform
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
      `}
    >
      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      
      <div className="flex-1 mr-4">
        <h3 className="text-sm font-bold text-gray-900">Error de conexión</h3>
        <p className="text-sm text-gray-500 mt-1">{message}</p>
      </div>

      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="text-gray-400 hover:text-gray-900 transition-colors p-1 -m-1 rounded-md hover:bg-gray-50 focus:outline-none"
      >
        <X size={16} />
      </button>
    </div>
  );
}