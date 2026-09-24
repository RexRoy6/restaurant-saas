import { styles } from "@/styles/layout.styles";
import { Timezone } from "../types/admin";

interface Props {
  name: string;
  setName: (v: string) => void;

  timezoneId: number | null;
  setTimezoneId: (v: number | null) => void;
  timezones: Timezone[];

  creating: boolean;
  onClose: () => void;
  onCreate: () => void;
}

export default function CreateCompanyModal({
  name,
  setName,
  timezoneId,
  setTimezoneId,
  timezones,
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

       <select
  value={timezoneId ?? ""}
  onChange={(e) => {
    const value = e.target.value;

    setTimezoneId(
      value ? Number(value) : null,
    );
  }}
  style={styles.modalInput}
>
  <option value="">
    Selecciona una zona horaria
  </option>

  {timezones.map((timezone) => (
    <option
      key={timezone.id}
      value={timezone.id}
    >
      {timezone.label}
    </option>
  ))}
</select>
 

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
