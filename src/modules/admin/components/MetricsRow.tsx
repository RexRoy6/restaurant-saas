import MetricCard from "./MetricCard";
import { Metrics } from "../types/admin";
import { styles } from "@/styles/layout.styles";

interface Props {
  metrics: Metrics;
}

export default function MetricsRow({ metrics }: Props) {
  return (
    <div style={styles.metricsRow}>
      <MetricCard title="Empresas totales" value={metrics.total.toString()} />

      <MetricCard title="Empresas activas" value={metrics.active.toString()} />

      <MetricCard
        title="Nuevos registros (últimos 7d)"
        value={metrics.newSignups.toString()}
      />
    </div>
  );
}
