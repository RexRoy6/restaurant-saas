import { styles } from "@/styles/layout.styles";

interface Props {
  title: string;
  value: string;
}

export default function MetricCard({ title, value }: Props) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricTitle}>{title}</p>

      <h3 style={{ margin: 0, fontSize: 28 }}>{value}</h3>
    </div>
  );
}
