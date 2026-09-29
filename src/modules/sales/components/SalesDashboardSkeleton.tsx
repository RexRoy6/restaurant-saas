export default function SalesDashboardSkeleton() {
  return (
    <div className="mt-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-[120px] rounded-2xl border border-gray-200 bg-white p-6"
          >
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="mt-5 h-8 w-32 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="mt-3 h-3 w-64 max-w-full rounded bg-gray-100" />
        </div>

        <div className="space-y-4 px-6 py-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between gap-4"
            >
              <div className="h-4 w-36 rounded bg-gray-100" />
              <div className="h-4 w-16 rounded bg-gray-100" />
              <div className="h-4 w-24 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}