import { Package } from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import ProductsManager from "@/modules/products/components/ProductsManager";

export default function ProductsPage() {
  return (
    <div className="relative">
      <PageHeader
        title="Productos"
        icon={Package}
      />

      <div className="mt-6">
        <ProductsManager />
      </div>
    </div>
  );
}