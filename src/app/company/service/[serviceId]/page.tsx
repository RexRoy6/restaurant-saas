"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ErrorBox from "@/app/components/ErrorBox";
import DetailCard from "@/app/components/crm/DetailCard";

export default function ServiceDetailPage() {
    const params = useParams();
    const router = useRouter();

    const serviceId = params.serviceId;

    const [service, setService] = useState<any>(null);
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState<number | undefined>();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    //compos 
    const serviceFields = [
        { name: "name", label: "Name" },
        { name: "description", label: "Description" },
        { name: "stockTotal", label: "Stock", type: "number" },
        { name: "priceBase", label: "Price" },
    ];

    //form de edicion:
    const [form, setForm] = useState({
        name: "",
        description: "",
        stockTotal: 0,
        priceBase: "",
    });

    //update
    const [saving, setSaving] = useState(false);


    const fetchService = async () => {
        try {
            setLoading(true);

            const res = await fetch(`/api/company/services/${serviceId}`, {
                credentials: "include",
            });

            if (!res.ok) {
  const data = await res.json();

  if (data?.error?.fieldErrors) {
    const messages = Object.values(data.error.fieldErrors)
      .flat()
      .join(", ");

    setError(messages);
  } else {
    setError("Update failed");
  }

  return;
}

            const data = await res.json();

            setService(data);

            setForm({
                name: data.name,
                description: data.description,
                stockTotal: data.stockTotal,
                priceBase: data.priceBase,
            });


        } catch {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    //update service
    const updateService = async () => {
        try {
            setSaving(true);
            setError("");

            const res = await fetch(`/api/company/services/${serviceId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(form),
            });

            if (!res.ok) {
  const data = await res.json();

  if (data?.error?.fieldErrors) {
    const messages = Object.values(data.error.fieldErrors)
      .flat()
      .join(", ");

    setError(messages);
  } else {
    setError("Update failed");
  }

  return;
}

            await fetchService();
            setEditing(false);

        } catch {
            setError("Connection error");
        } finally {
            setSaving(false);
        }
    };

    //soft delete
    const deleteService = async () => {
        if (!confirm("Are you sure you want to delete this service?")) return;

        try {
            const res = await fetch(`/api/company/services/${serviceId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
  const data = await res.json();

  if (data?.error?.fieldErrors) {
    const messages = Object.values(data.error.fieldErrors)
      .flat()
      .join(", ");

    setError(messages);
  } else {
    setError("Update failed");
  }

  return;
}

            router.push("/company/service");

        } catch {
            setError("Connection error");
        }
    };
    //reactiate service:
    const reactivateService = async () => {
        try {
            const res = await fetch(
                `/api/company/services/${serviceId}?reactivate=true`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            if (!res.ok) {
  const data = await res.json();

  if (data?.error?.fieldErrors) {
    const messages = Object.values(data.error.fieldErrors)
      .flat()
      .join(", ");

    setError(messages);
  } else {
    setError("Update failed");
  }

  return;
}

            await fetchService();

        } catch {
            setError("Connection error");
        }
    };


    useEffect(() => {
        fetchService();
    }, []);

    useEffect(() => {
        if (service) {
            setForm({
                name: service.name ?? "",
                description: service.description ?? "",
                stockTotal: service.stockTotal ?? 0,
                priceBase: service.priceBase ?? "",
            });
        }
    }, [service]);

    return (
        <div>
            <h1>Service Details</h1>

            {error && <ErrorBox message={error} code={errorCode} />}

            {loading && <p>Loading...</p>}

            {service && (
                <DetailCard
                    title={service.name}
                    fields={serviceFields}
                    data={service}
                    form={form}
                    setForm={setForm}
                    editing={editing}
                    setEditing={setEditing}
                    saving={saving}
                    onSave={updateService}
                    onDelete={deleteService}
                    actions={[
                        ...(service.deletedAt
                            ? [{ label: "Reactivate", onClick: reactivateService }]
                            : []),
                    ]}
                />
            )}
        </div>
    );
}