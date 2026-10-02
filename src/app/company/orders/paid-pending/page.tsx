import {
  CircleCheckBig,
} from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import OrdersTabs from "@/modules/orders/components/OrdersTabs";
import PaidPendingChecksManager from "@/modules/orders/components/PaidPendingChecksManager";

export default function PaidPendingOrdersPage() {
  return (
    <div className="relative">
      <PageHeader
        title="Órdenes"
        icon={CircleCheckBig}
      />

      <div className="mt-6">
        <OrdersTabs />
      </div>

      <div className="mt-6">
        <PaidPendingChecksManager />
      </div>
    </div>
  );
}