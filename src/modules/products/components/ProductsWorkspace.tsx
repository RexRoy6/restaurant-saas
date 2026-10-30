
"use client";

import { useState } from "react";
import { Package, SlidersHorizontal } from "lucide-react";

import ProductsManager from "./ProductsManager";
import ModifierGroupsManager from "./ModifierGroupsManager";

type ActiveTab = "products" | "modifiers";

export default function ProductsWorkspace() {
  const [activeTab, setActiveTab] =
    useState<ActiveTab>("products");

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === "products"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
        >
          <Package size={17} />
          Productos
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("modifiers")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === "modifiers"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
        >
          <SlidersHorizontal size={17} />
          Modificadores
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "products" ? (
          <ProductsManager />
        ) : (
          <ModifierGroupsManager />
        )}
      </div>
    </div>
  );
}