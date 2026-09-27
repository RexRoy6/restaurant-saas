import { FileText } from "lucide-react";
import { notFound } from "next/navigation";

import PageHeader from "@/app/components/PageHeader";
import CheckDetail from "@/modules/orders/components/CheckDetail";

type OrdersCheckPageProps = {
  params: Promise<{
    checkId: string;
  }>;
};

export default async function OrdersCheckPage({
  params,
}: OrdersCheckPageProps) {
  const { checkId } = await params;

  const parsedCheckId =
    Number(checkId);

  if (
    !Number.isSafeInteger(
      parsedCheckId,
    ) ||
    parsedCheckId <= 0
  ) {
    notFound();
  }

  return (
    <div className="relative">
      <PageHeader
        title="Detalle de cuenta"
        icon={FileText}
      />

      <div className="mt-6">
        <CheckDetail
          checkId={parsedCheckId}
        />
      </div>
    </div>
  );
}