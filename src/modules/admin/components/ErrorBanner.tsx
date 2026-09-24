import { styles } from "@/styles/layout.styles";

interface Props {
  error: string| null;
  clear: () => void;
}

export default function ErrorBanner({ error, clear }: Props) {
  if (!error) return null;

  return (
    <div style={styles.errorBanner}>
      <span>❌ {error}</span>

      <button style={styles.errorClose} onClick={clear}>
        ×
      </button>
    </div>
  );
}
