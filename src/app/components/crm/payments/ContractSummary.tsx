"use client";

export default function ContractSummary({
  total,
  paid,
  remaining,
}: {
  total: number;
  paid: number;
  remaining: number;
}) {
  const progress = total > 0 ? (paid / total) * 100 : 0;

  return (
    <div style={styles.card}>
      {/* TOP */}
      <div style={styles.top}>
        <div>
          <span style={styles.label}>Remaining</span>
          <div style={styles.mainAmount}>${remaining}</div>
        </div>

        <div style={styles.progressBadge}>{progress.toFixed(0)}%</div>
      </div>

      {/* PROGRESS */}
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${progress}%`,
          }}
        />
      </div>

      {/* METRICS */}
      <div style={styles.grid}>
        <div style={styles.metric}>
          <span style={styles.label}>Total</span>
          <span style={styles.value}>${total}</span>
        </div>

        <div style={styles.metric}>
          <span style={styles.label}>Paid</span>
          <span style={styles.value}>${paid}</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "var(--bg-primary)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  mainAmount: {
    fontSize: "26px",
    fontWeight: 600,
    color: "var(--text-primary)",
    letterSpacing: "-0.5px",
  },

  progressBadge: {
    fontSize: "12px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "var(--bg-secondary)",
    color: "var(--text-secondary)",
    fontWeight: 500,
  },

  progressBar: {
    height: "6px",
    borderRadius: "999px",
    background: "var(--bg-secondary)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#22c55e",
    opacity: 0.9,
    transition: "width 0.3s ease",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  metric: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  label: {
    fontSize: "12px",
    color: "var(--text-secondary)",
  },

  value: {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--text-primary)",
  },
};
