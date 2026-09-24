"use client";

import CreateForm from "@/app/components/crm/CreateForm";

export default function ClientCreateForm({
  form,
  setForm,
  onSubmit,
  onCancel,
}: any) {
  const fields = [
    {
      name: "name",
      label: "Name",
    },
    {
      name: "phone",
      label: "Phone",
    },
    {
      name: "email",
      label: "Email",
    },
  ];

  return (
    <CreateForm
      title="Create Client"
      fields={fields}
      form={form}
      setForm={setForm}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}