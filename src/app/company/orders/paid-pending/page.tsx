import {
  CircleCheckBig,
} from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import PaidPendingChecksManager from "@/modules/orders/components/PaidPendingChecksManager";

export default function PaidPendingOrdersPage() {
  return (
    <div className="relative">
      <PageHeader
        title="Pagadas pendientes"
        icon={CircleCheckBig}
      />

      <div className="mt-6">
        <PaidPendingChecksManager />
      </div>
    </div>
  );
}