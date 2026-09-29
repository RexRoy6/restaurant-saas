import type {
  SalesPeriod,
} from "../types/sales";

type SalesPeriodSelectorProps = {
  period: SalesPeriod;
  onChange: (period: SalesPeriod) => void;
  disabled?: boolean;
};

const periodOptions: {
  value: SalesPeriod;
  label: string;
}[] = [
  {
    value: "today",
    label: "Hoy",
  },
  {
    value: "yesterday",
    label: "Ayer",
  },
  {
    value: "last5days",
    label: "Últimos 5 días",
  },
  {
    value: "last7days",
    label: "Últimos 7 días",
  },
  {
    value: "last30days",
    label: "Últimos 30 días",
  },
];

export default function SalesPeriodSelector({
  period,
  onChange,
  disabled = false,
}: SalesPeriodSelectorProps) {
  return (
    <select
      value={period}
      onChange={(event) =>
        onChange(
          event.target.value as SalesPeriod,
        )
      }
      disabled={disabled}
      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {periodOptions.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}