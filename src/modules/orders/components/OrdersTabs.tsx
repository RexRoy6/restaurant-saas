"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    label: "Cuentas abiertas",
    href: "/company/orders",
  },
  {
    label: "Pagadas pendientes",
    href: "/company/orders/paid-pending",
  },
];

export default function OrdersTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200">
      <nav
        className="-mb-px flex gap-6"
        aria-label="Órdenes"
      >
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "border-b-2 px-1 pb-3 text-sm font-medium transition",
                isActive
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}