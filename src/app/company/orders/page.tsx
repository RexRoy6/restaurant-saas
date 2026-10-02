import { FileText } from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import ChecksManager from "@/modules/orders/components/ChecksManager";
import OrdersTabs from "@/modules/orders/components/OrdersTabs";

export default function OrdersPage() {
  return (
    <div className="relative">
      <PageHeader
        title="Órdenes"
        icon={FileText}
      />

      <div className="mt-6">
        <OrdersTabs />
      </div>

      <div className="mt-6">
        <ChecksManager />
      </div>
    </div>
  );
}