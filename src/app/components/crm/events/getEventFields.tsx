import { Calendar, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import ClientSelector from "@/app/components/crm/clients/ClientSelector";
import { Field } from "@/app/components/crm/CreateForm";

type Props = {
  form: any;
  setForm: any;
  errors?: Record<string, string>;
  onOpenClientModal?: () => void;
};

export function getEventFields({ form, setForm, errors = {}, onOpenClientModal }: Props): Field[] {
  
  const renderError = (field: string) => {
    if (!errors[field]) return undefined;
    return (
      <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1 animate-pulse">
        <AlertCircle size={14} /> {errors[field]}
      </span>
    );
  };

  return [
    {
      name: "clientId",
      label: "Cliente",
      hideInput: true,
      readOnly: true,
      fullWidth: true,
      after: (
        <>
          <ClientSelector
            selected={form.client}
            onSelect={(client: any) => {
              setForm((prev: any) => ({
                ...prev,
                clientId: String(client.id),
                client: {
                  id: client.id,
                  name: client.name,
                  phone: client.phone,
                },
              }));
            }}
            onClear={() => {
              setForm((prev: any) => ({
                ...prev,
                clientId: "",
                client: undefined,
              }));
            }}
            onAddNew={onOpenClientModal}
          />
          {renderError("clientId")}
        </>
      ),
    },
    {
      name: "name",
      label: "Nombre del Evento",
      fullWidth: true,
      after: renderError("name"),
    },
    {
      name: "eventDate",
      label: "Fecha del Evento",
      type: "date",
      after: (
        <>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-gray-500">
            <Calendar size={14} className="text-gray-400" />
            {form.eventDate
              ? `Fecha confirmada: ${formatDate(form.eventDate)}`
              : "Selecciona un día en el calendario"}
          </div>
          {renderError("eventDate")}
        </>
      ),
    },
    {
      name: "location",
      label: "Ubicación (Lugar)",
      after: renderError("location"),
    },
    {
      name: "eventStart",
      label: "Hora de Inicio",
      type: "time",
      after: renderError("eventStart"),
    },
    {
      name: "eventEnd",
      label: "Hora de Finalización",
      type: "time",
      after: renderError("eventEnd"),
    },
    {
      name: "notes",
      label: "Notas Adicionales",
      type: "textarea",
      fullWidth: true,
    },
  ];
}