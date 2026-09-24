"use client";

import { useParams } from "next/navigation";

import PageHeader from "@/app/components/crm/PageHeader";
import ContractSummary from "@/app/components/crm/payments/ContractSummary";
import PaymentList from "@/app/components/crm/payments/PaymentList";
import PaymentForm from "@/app/components/crm/payments/PaymentForm";
import ErrorBox from "@/app/components/ErrorBox";

import { useContractPayments } from "@/app/hooks/useContractPayments";

export default function ContractPaymentsPage() {
  const params = useParams();
  const contractId = params.contractId as string;
  // hooks (toda la lógica vive aquí ahora)
  const {
    payments,
    contractTotal,
    paidAmount,
    remainingAmount,
    loading,
    error,
    errorCode,
    fetchPayments,
  } = useContractPayments(contractId);

  return (
    <div>
      <PageHeader title={`Contract ${contractId} Payments`} />

      <ContractSummary
        total={contractTotal}
        paid={paidAmount}
        remaining={remainingAmount}
      />

      {/* completamente encapsulado  parte de pagos */}
      <div style={{ marginTop: 20 }}>
        <PaymentForm contractId={contractId} onSuccess={fetchPayments} />
      </div>

      {error && <ErrorBox message={error} code={errorCode} />}

      <div style={{ marginTop: 20 }}>
        {loading ? (
          <p style={{ color: "var(--text-secondary)" }}>Loading payments...</p>
        ) : (
          <PaymentList payments={payments} onDeleteSuccess={fetchPayments} />
        )}
      </div>
    </div>
  );
}
