import { styles } from "@/styles/layout.styles";

interface Props {
  onCreate: () => void;
}

export default function AdminHeader({ onCreate }: Props) {
  return (
    <div style={styles.mainHeader}>
      <div>
        <h2 style={{ margin: 0 }}>Resumen del portafolio</h2>

        <p style={styles.subtitle}>
          Gestión del rendimiento de todas las entidades registradas.
        </p>
      </div>

      <button style={styles.primaryButton} onClick={onCreate}>
        + Añadir empresa
      </button>
    </div>
  );
}
