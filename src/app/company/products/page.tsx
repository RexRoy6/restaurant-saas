
import { Package } from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import ProductsWorkspace from "@/modules/products/components/ProductsWorkspace";

export default function ProductsPage() {
  return (
    <div className="relative">
      <PageHeader
        title="Productos"
        icon={Package}
      />

      <div className="mt-6">
        <ProductsWorkspace />
      </div>
    </div>
  );
}