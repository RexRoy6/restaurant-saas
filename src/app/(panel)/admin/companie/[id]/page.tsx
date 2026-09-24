"use client";

import { useParams } from "next/navigation";
import { useAdminCompany } from "@/modules/admin/hooks/useAdminCompany";

import CompanyHeaderCard from "@/modules/admin/components/CompanyHeaderCard";
import CompanyTabs from "@/modules/admin/components/CompanyTabs";
import ErrorBanner from "@/modules/admin/components/ErrorBanner";

export default function AdminCompanyPage() {
  const params = useParams();
  const companyId = params.id as string;

  const {
    company,
    users,
    dashboard,
    loading,
    actionError,
    clearActionError,
    loadError,
    activeTab,
    setActiveTab,
    suspendConfirm,
    setSuspendConfirm,
    reactivateConfirm,
    setReactivateConfirm,
    handleSuspend,
    handleReactivate,
    createOwner,
    deactivateUser,
    reactivateUser,
  } = useAdminCompany(companyId);

  if (loading) return <p>Cargando...</p>;
  if (loadError || !company) return <p>Error al cargar empresa</p>;

  return (
    <>
      <ErrorBanner error={actionError} clear={clearActionError} />

      <CompanyHeaderCard
        company={company}
        suspendConfirm={suspendConfirm}
        setSuspendConfirm={setSuspendConfirm}
        reactivateConfirm={reactivateConfirm}
        setReactivateConfirm={setReactivateConfirm}
        onSuspend={handleSuspend}
        onReactivate={handleReactivate}
      />

      <CompanyTabs
        users={users}
        dashboard={dashboard}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCreateOwner={createOwner}
        onDeactivateUser={deactivateUser}
        onReactivateUser={reactivateUser}
      />
    </>
  );
}
