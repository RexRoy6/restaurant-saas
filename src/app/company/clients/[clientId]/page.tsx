"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, RefreshCcw } from "lucide-react";
import ErrorBox from "@/app/components/ErrorBox";
import DetailCard from "@/app/components/crm/DetailCard";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();

  const clientId = params.clientId;

  const [client, setClient] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ¡Textos traducidos al español!
  const clientFields = [
    { name: "name", label: "Nombre Completo" },
    { name: "phone", label: "Teléfono" },
    { name: "email", label: "Correo Electrónico" },
  ];

  const fetchClient = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/company/clients/${clientId}`, {
        credentials: "include",
      });
      const data = await res.json();
      setClient(data);
      setForm({
        name: data.name,
        phone: data.phone,
        email: data.email,
      });
    } catch {
      setError("Error de conexión al cargar el cliente.");
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async () => {
    try {
      setSaving(true);
      await fetch(`/api/company/clients/${clientId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      await fetchClient();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteClient = async () => {
    const confirmed = confirm("¿Estás seguro de que deseas eliminar este cliente?");
    if (!confirmed) return;

    await fetch(`/api/company/clients/${clientId}`, {
      method: "DELETE",
      credentials: "include",
    });
    router.push("/company/clients");
  };

  const reactivateClient = async () => {
    try {
      const res = await fetch(`/api/company/clients/${clientId}?reactivate=true`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) {
        setError("Error al reactivar el cliente.");
        return;
      }
      await fetchClient();
    } catch {
      setError("Error de conexión.");
    }
  };

  useEffect(() => {
    fetchClient();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full mx-auto pb-10">
      
      {/* Navegación y Cabecera */}
      <div className="flex items-center gap-4 mb-2">
        <Link 
          href="/company/clients"
          className="p-2 -ml-2 text-gray-400 hover:text-gray-900 bg-transparent hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
          title="Volver a la lista"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight m-0">
          Perfil del Cliente
        </h1>
      </div>

      {error && <ErrorBox message={error} />}

      {loading && (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-2xl w-full mx-auto animate-pulse flex flex-col gap-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="flex flex-col gap-0 bg-gray-50 rounded-xl border border-gray-100 p-1">
            <div className="h-14 border-b border-gray-100"></div>
            <div className="h-14 border-b border-gray-100"></div>
            <div className="h-14"></div>
          </div>
          <div className="h-10 bg-gray-100 rounded w-1/2 mt-4"></div>
        </div>
      )}

      {client && (
        <div className="animate-in fade-in duration-300 w-full">
          <DetailCard
            title={client.name}
            fields={clientFields}
            data={client}
            form={form}
            setForm={setForm}
            editing={editing}
            setEditing={setEditing}
            saving={saving}
            onSave={updateClient}
            onDelete={deleteClient}
            actions={[
              ...(client.deletedAt
                ? [{ 
                    label: "Reactivar", 
                    onClick: reactivateClient, 
                    icon: RefreshCcw 
                  }]
                : []),
              {
                label: "Ver Eventos",
                href: `/company/clients/${clientId}/events`,
                icon: Calendar,
                variant: "primary" // Este botón resaltará en negro
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}