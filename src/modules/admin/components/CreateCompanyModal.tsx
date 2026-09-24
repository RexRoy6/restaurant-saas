import { styles } from "@/styles/layout.styles";

interface Props {
  name: string;
  setName: (v: string) => void;
  creating: boolean;
  onClose: () => void;
  onCreate: () => void;
}

export default function CreateCompanyModal({
  name,
  setName,
  creating,
  onClose,
  onCreate,
}: Props) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Nueva empresa</h3>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.modalInput}
        />

        <div style={styles.modalActions}>
          <button onClick={onClose} style={styles.modalCancel}>
            Cancelar
          </button>

          <button
            onClick={onCreate}
            disabled={creating}
            style={styles.modalCreate}
          >
            {creating ? "Creando..." : "Crear empresa"}
          </button>
        </div>
      </div>
    </div>
  );
}
