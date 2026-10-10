
"use client";

type Props = {
  isTemporarilyClosed: boolean;
  temporaryClosureReason: string;
  onClosedChange: (value: boolean) => void;
  onReasonChange: (value: string) => void;
  disabled?: boolean;
};

export default function CompanyTemporaryClosure({
  isTemporarilyClosed,
  temporaryClosureReason,
  onClosedChange,
  onReasonChange,
  disabled = false,
}: Props) {
  return (
    <section>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#111827",
          marginBottom: 6,
        }}
      >
        Cierre temporal del negocio
      </h3>

      <p
        style={{
          fontSize: 13,
          color: "#6b7280",
          marginBottom: 16,
        }}
      >
        Activa esta opción cuando el negocio no pueda
        atender temporalmente. Los horarios habituales
        se conservarán.
      </p>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 14,
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: disabled ? "default" : "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <input
            type="checkbox"
            checked={isTemporarilyClosed}
            disabled={disabled}
            onChange={(event) =>
              onClosedChange(event.target.checked)
            }
          />

          Marcar negocio como temporalmente cerrado
        </label>

        {isTemporarilyClosed && (
          <div style={{ marginTop: 16 }}>
            <label
              htmlFor="temporary-closure-reason"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              Motivo del cierre (opcional)
            </label>

            <textarea
              id="temporary-closure-reason"
              value={temporaryClosureReason}
              onChange={(event) =>
                onReasonChange(event.target.value)
              }
              disabled={disabled}
              maxLength={500}
              rows={3}
              placeholder="Ej. Cerrado por mantenimiento. Regresamos pronto."
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 14,
                resize: "vertical",
                outlineOffset: 2,
              }}
            />

            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginTop: 6,
              }}
            >
              {temporaryClosureReason.length}/500 caracteres
            </p>
          </div>
        )}
      </div>

      {isTemporarilyClosed && (
        <p
          role="status"
          style={{
            fontSize: 13,
            color: "#92400e",
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: 12,
            marginTop: 12,
          }}
        >
          El catálogo público indicará que el negocio
          está temporalmente cerrado cuando guardes
          esta configuración y conectemos la vista pública.
        </p>
      )}
    </section>
  );
}
