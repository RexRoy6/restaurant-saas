import type {
  SalesProductSummary,
} from "../types/sales";

type SalesProductsTableProps = {
  products: SalesProductSummary[];
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat(
    "es-MX",
  ).format(num);
};

const formatCurrency = (
  cents: number,
) => {
  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
    },
  ).format(cents / 100);
};

export default function SalesProductsTable({
  products,
}: SalesProductsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-6 py-5">
        <h3 className="font-semibold text-gray-900">
          Productos vendidos
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Desglose de productos del período seleccionado.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-gray-500">
            No hay productos vendidos en este período.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Producto
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Cantidad
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr
                  key={product.productId}
                  className="transition-colors hover:bg-gray-50/60"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {product.productName}
                  </td>

                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {formatNumber(
                      product.quantity,
                    )}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(
                      product.totalInCents,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}