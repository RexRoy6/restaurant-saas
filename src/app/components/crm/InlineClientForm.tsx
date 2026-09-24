"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

type Props = {
  form: { name: string; phone: string; email: string };
  setForm: (v: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function InlineClientForm({
  form,
  setForm,
  onSubmit,
  onCancel,
}: Props) {
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // 1. Validaciones en tiempo real
  let nameError = "";
  if (submitAttempted && !form.name?.trim()) {
    nameError = "El nombre completo es obligatorio.";
  }

  let phoneError = "";
  if (submitAttempted && !form.phone?.trim()) {
    phoneError = "El teléfono es obligatorio.";
  } else if (form.phone && form.phone.length < 10) {
    // Alerta visual si el número está incompleto
    phoneError = "El teléfono debe tener exactamente 10 dígitos.";
  }

  let emailError = "";
  if (submitAttempted && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    emailError = "El formato del correo no es válido.";
  }

  // Estado global de invalidez para el botón
  const isInvalid = !form.name?.trim() || !form.phone?.trim() || form.phone.length < 10 || !!emailError;

  // 2. Filtro estricto en tiempo real para el teléfono
  const handlePhoneChange = (val: string) => {
    // Reemplaza cualquier carácter que NO sea un número por un texto vacío
    const onlyNumbers = val.replace(/\D/g, "");
    
    // Limitación estricta a 10 dígitos
    if (onlyNumbers.length <= 10) {
      setForm({ ...form, phone: onlyNumbers });
    }
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (isInvalid) return;
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-bold text-gray-900 tracking-tight mb-1">
        Registrar Nuevo Cliente
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Campo: Nombre Completo */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center">
            Nombre Completo <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            placeholder="Ej. Juan Pérez"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (submitAttempted) setSubmitAttempted(false);
            }}
            className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-1 transition-all shadow-sm ${
              nameError 
                ? "border-red-500 focus:ring-red-500 bg-red-50/30" 
                : "border-gray-300 focus:ring-black focus:border-black"
            }`}
          />
          {nameError && (
            <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1 animate-pulse">
              <AlertCircle size={14} /> {nameError}
            </span>
          )}
        </div>

        {/* Campo: Teléfono (Blindado contra texto) */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center">
            Teléfono <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric" // Optimiza el teclado en dispositivos móviles
            placeholder="Ej. 6561234567"
            value={form.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-1 transition-all shadow-sm ${
              phoneError 
                ? "border-red-500 focus:ring-red-500 bg-red-50/30" 
                : "border-gray-300 focus:ring-black focus:border-black"
            }`}
          />
          {phoneError && (
            <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1 animate-pulse">
              <AlertCircle size={14} /> {phoneError}
            </span>
          )}
        </div>

        {/* Campo: Correo Electrónico */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-700 mb-1.5">
            Correo Electrónico
          </label>
          <input
            type="email"
            placeholder="ejemplo@correo.com"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              if (submitAttempted) setSubmitAttempted(false);
            }}
            className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-1 transition-all shadow-sm ${
              emailError 
                ? "border-red-500 focus:ring-red-500 bg-red-50/30" 
                : "border-gray-300 focus:ring-black focus:border-black"
            }`}
          />
          {emailError && (
            <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1 animate-pulse">
              <AlertCircle size={14} /> {emailError}
            </span>
          )}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center gap-3 mt-2 pt-4 border-t border-gray-200">
        <button
          onClick={handleSubmit}
          disabled={submitAttempted && isInvalid}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
            ${
              submitAttempted && isInvalid 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "text-white bg-gray-900 hover:bg-gray-800"
            }
          `}
        >
          Guardar Cliente
        </button>
        
        <button
          onClick={() => {
            setSubmitAttempted(false);
            onCancel();
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}