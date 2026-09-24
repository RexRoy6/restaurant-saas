"use client";

import ClientSearch from "@/app/components/crm/ClientSearch";
import { UserPlus, UserCheck, X } from "lucide-react";

export default function ClientSelector({
  selected,
  onSelect,
  onClear,
  onAddNew, 
}: {
  selected?: any;
  onSelect: (client: any) => void;
  onClear?: () => void;
  onAddNew?: () => void; 
}) {

  return (
    <div className="flex flex-col w-full mt-1.5">
      
      {selected ? (
        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
          <div className="flex flex-col">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <UserCheck size={16} className="text-green-600" />
              {selected.name}
            </span>
            <span className="text-xs text-gray-500 mt-0.5 ml-5">
              {selected.phone}
            </span>
          </div>

          <button
            type="button" 
            onClick={onClear}
            title="Cambiar cliente"
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors focus:outline-none"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2 w-full">
            <div className="flex-1">
              <ClientSearch selected={String(selected?.id || "")} onSelect={onSelect} />
            </div>
            
            {onAddNew && (
              <button
                type="button" 
                onClick={onAddNew}
                className="flex items-center gap-1.5 px-3 py-2 h-[38px] text-sm font-medium bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors shadow-sm whitespace-nowrap"
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">Nuevo</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}