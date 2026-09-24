"use client";

import { ReactNode } from "react";
import { X } from "lucide-react"; // Importamos la X

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "date" | "time" | "datetime-local" | "textarea";
  options?: { value: string; label: string }[];
  onChange?: (value: string) => void;
  readOnly?: boolean;
  hideInput?: boolean;
  required?: boolean;
  after?: ReactNode;
  fullWidth?: boolean; 
};

type Props = {
  title?: string;
  fields: Field[];
  form: any;
  setForm: (value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  clearError?: () => void;
  submitLabel?: string;
  loading?: boolean;
  
  // NUEVAS PROPIEDADES MÁGICAS
  mode?: "card" | "transparent"; 
  onCloseIcon?: () => void; // Acción para la crucecita superior
};

export default function CreateForm({
  title,
  fields,
  form,
  setForm,
  onSubmit,
  onCancel,
  clearError,
  submitLabel = "Guardar",
  loading = false,
  mode = "card", // Por defecto se comporta como una tarjeta/modal independiente
  onCloseIcon,
}: Props) {
  function handleFieldChange(field: Field, value: string) {
    clearError?.();
    if (field.onChange) {
      field.onChange(value);
      return;
    }
    setForm((prev: any) => ({
      ...prev,
      [field.name]: field.type === "number" ? Number(value) : String(value),
    }));
  }

  const baseInputStyles = "w-full px-3.5 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all shadow-sm";
  const activeInputStyles = "bg-white border-gray-300 text-gray-900 focus:ring-gray-200 focus:border-black";
  const disabledInputStyles = "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed";

  return (
    <div className={`w-full flex flex-col ${
      mode === "card" ? "bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" : ""
    }`}>
      
      {/* HEADER TIPO MODAL */}
      {title && (
        <div className={`flex items-center justify-between border-b border-gray-100 ${
          mode === "card" ? "px-5 sm:px-6 py-4 bg-gray-50/50" : "pb-4 mb-4"
        }`}>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
          {onCloseIcon && (
            <button 
              type="button" 
              onClick={onCloseIcon} 
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors focus:outline-none"
            >
              <X size={20} />
            </button>
          )}
        </div>
      )}

      {/* BODY (CUADRÍCULA) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 sm:gap-y-5 ${
        mode === "card" ? "p-5 sm:p-6" : ""
      }`}>
        {fields.map((field) => {
          const isFullWidth = field.type === "textarea" || field.fullWidth;
          const colSpanClass = isFullWidth ? "sm:col-span-2" : "col-span-1";

          const Label = () => (
            <label className="text-xs font-medium text-gray-700 ml-1 mb-1.5 flex items-center">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          );

          if (field.type === "select") {
            return (
              <div key={field.name} className={`flex flex-col ${colSpanClass}`}>
                <Label />
                <select
                  required={field.required}
                  value={form[field.name] ?? ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  disabled={field.readOnly}
                  className={`${baseInputStyles} ${field.readOnly ? disabledInputStyles : activeInputStyles} cursor-pointer appearance-none`}
                >
                  <option value="" disabled className="text-gray-400">Seleccionar...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {field.after && <div className="mt-1">{field.after}</div>}
              </div>
            );
          }

          if (field.type === "textarea") {
            return (
              <div key={field.name} className={`flex flex-col ${colSpanClass}`}>
                <Label />
                <textarea
                  required={field.required}
                  value={form[field.name] ?? ""}
                  rows={3}
                  readOnly={field.readOnly}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className={`${baseInputStyles} ${field.readOnly ? disabledInputStyles : activeInputStyles} resize-y min-h-[80px]`}
                />
                {field.after && <div className="mt-1">{field.after}</div>}
              </div>
            );
          }

          return (
            <div key={field.name} className={`flex flex-col ${colSpanClass}`}>
              <Label />
              {!field.hideInput && (
                <input
                  required={field.required}
                  type={field.type || "text"}
                  value={form[field.name] ?? ""}
                  readOnly={field.readOnly}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className={`${baseInputStyles} ${field.readOnly ? disabledInputStyles : activeInputStyles}`}
                />
              )}
              {field.after && <div className="mt-1">{field.after}</div>}
            </div>
          );
        })}
      </div>

      {/* FOOTER TIPO MODAL */}
      <div className={`flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-gray-100 ${
        mode === "card" ? "px-5 sm:px-6 py-4 bg-gray-50" : "pt-4 mt-6"
      }`}>
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-white sm:bg-transparent border border-gray-300 sm:border-transparent hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className={`w-full sm:w-auto px-6 py-2.5 text-sm font-medium rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black flex items-center justify-center ${
            loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "text-white bg-gray-900 hover:bg-gray-800"
          }`}
        >
          {loading ? "Guardando..." : submitLabel}
        </button>
      </div>
    </div>
  );
}