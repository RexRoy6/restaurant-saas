"use client";

import Link from "next/link";
import { Pencil, Trash2, Save, X, Calendar, RefreshCcw } from "lucide-react";

type Field = {
  name: string;
  label: string;
  type?: string;
  readOnly?: boolean;
};

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: any;
  variant?: "primary" | "danger" | "secondary";
};

type Props = {
  title: string;
  fields: Field[];
  data: any;
  form: any;
  setForm: (v: any) => void;
  editing: boolean;
  setEditing: (v: boolean) => void;
  saving: boolean;
  onSave: () => void;
  onDelete?: () => void;
  actions?: Action[];
};

export default function DetailCard({
  title,
  fields,
  data,
  form,
  setForm,
  editing,
  setEditing,
  saving,
  onSave,
  onDelete,
  actions = [],
}: Props) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm max-w-2xl w-full mx-auto flex flex-col gap-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
        {title}
      </h2>

      {/* ===================== MODO VISTA (LECTURA) ===================== */}
      {!editing && (
        <>
          <div className="flex flex-col gap-0 bg-gray-50/50 rounded-xl border border-gray-100 p-1">
            {fields.map((field) => {
              if (field.name === "notes") {
                return (
                  <div key={field.name} className="flex flex-col gap-2 p-4">
                    <span className="text-sm font-medium text-gray-500">
                      {field.label}
                    </span>
                    <div className="p-4 rounded-xl bg-yellow-50/50 border border-yellow-100 text-gray-700 whitespace-pre-line text-sm">
                      {data[field.name] || "Sin notas adicionales."}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={field.name}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-100 last:border-0 gap-1"
                >
                  <span className="text-sm font-medium text-gray-500">
                    {field.label}
                  </span>
                  <strong className="text-sm text-gray-900 font-semibold text-right">
                    {data[field.name] || "—"}
                  </strong>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2 pt-6 border-t border-gray-100">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
            >
              <Pencil size={16} />
              Editar
            </button>

            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-100 bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200 text-sm"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            )}

            <div className="flex-1" /> {/* Espaciador para empujar los siguientes a la derecha */}

            {actions.map((action, index) => {
              const ActionIcon = action.icon;
              const isPrimary = action.variant === "primary";
              
              const baseClasses = "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 text-sm";
              const colorClasses = isPrimary 
                ? "bg-gray-900 text-white hover:bg-gray-800 focus:ring-black"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-200";

              if (action.href) {
                return (
                  <Link key={index} href={action.href} className={`${baseClasses} ${colorClasses}`}>
                    {ActionIcon && <ActionIcon size={16} />}
                    {action.label}
                  </Link>
                );
              }

              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`${baseClasses} ${colorClasses}`}
                >
                  {ActionIcon && <ActionIcon size={16} />}
                  {action.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ===================== MODO EDICIÓN ===================== */}
      {editing && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-300">
          
          {fields.some((f) => f.readOnly) && (
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Información del Sistema
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {fields.map((field) => {
              // CAMPOS DE SOLO LECTURA
              if (field.readOnly) {
                return (
                  <div key={field.name} className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-gray-600 ml-1">
                      {field.label}
                    </label>
                    <div className="px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed">
                      {data[field.name]}
                    </div>
                  </div>
                );
              }

              // CAMPOS EDITABLES
              const isTextarea = field.type === "textarea";
              return (
                <div 
                  key={field.name} 
                  className={`flex flex-col gap-1.5 ${isTextarea ? 'sm:col-span-2' : ''}`}
                >
                  <label className="text-xs font-medium text-gray-700 ml-1">
                    {field.label}
                  </label>
                  {isTextarea ? (
                    <textarea
                      value={form[field.name] || ""}
                      onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                      rows={4}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-sm"
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={form[field.name] || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [field.name]: field.type === "number" ? Number(e.target.value) : e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-sm"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 mt-4 pt-6 border-t border-gray-100">
            <button
              onClick={onSave}
              disabled={saving}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                saving 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              <Save size={16} />
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>

            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}