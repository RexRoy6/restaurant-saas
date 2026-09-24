"use client";

import { useAdminDashboard } from "@/modules/admin/hooks/useAdminDashboard";
import React, { useState } from "react";
import AdminHeader from "@/modules/admin/components/AdminHeader";
import MetricsRow from "@/modules/admin/components/MetricsRow";
import CompaniesDirectory from "@/modules/admin/components/CompaniesDirectory";
import CreateCompanyModal from "@/modules/admin/components/CreateCompanyModal";
import ErrorBanner from "@/modules/admin/components/ErrorBanner";

export default function AdminPage() {
  const {
    filteredCompanies,
    metrics,
    loading,
    error,
    setError,
    creating,
    createCompany,
    newCompanyName,
    setNewCompanyName,
  } = useAdminDashboard();

  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <main>
        <AdminHeader onCreate={() => setShowCreateModal(true)} />

        <MetricsRow metrics={metrics} />

        {error && <ErrorBanner error={error} clear={() => setError("")} />}

        <CompaniesDirectory companies={filteredCompanies} loading={loading} />
      </main>

      {showCreateModal && (
        <CreateCompanyModal
          name={newCompanyName}
          setName={setNewCompanyName}
          creating={creating}
          onCreate={createCompany}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}
