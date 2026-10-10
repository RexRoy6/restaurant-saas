
"use client";

export type BusinessHour = {
  dayOfWeek: number;
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
};

type Props = {
  value: BusinessHour[];
  onChange: (hours: BusinessHour[]) => void;
  disabled?: boolean;
};

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export const DEFAULT_BUSINESS_HOURS: BusinessHour[] =
  DAY_NAMES.map((_, dayOfWeek) => ({
    dayOfWeek,
    isClosed: true,
    opensAt: null,
    closesAt: null,
  }));

export default function CompanyBusinessHoursEditor({
  value,
  onChange,
  disabled = false,
}: Props) {
  function updateDay(
    dayOfWeek: number,
    changes: Partial<BusinessHour>,
  ) {
    onChange(
      value.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, ...changes }
          : day,
      ),
    );
  }

  return (
    <section>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        Horarios de atención
      </h3>

      <p
        style={{
          fontSize: 13,
          color: "#6b7280",
          marginBottom: 16,
        }}
      >
        Configura un horario por día. Si el cierre es
        anterior a la apertura, se interpretará como
        cierre al día siguiente.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {value.map((day) => (
          <div
            key={day.dayOfWeek}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: day.isClosed ? 0 : 12,
              }}
            >
              <strong style={{ fontSize: 14 }}>
                {DAY_NAMES[day.dayOfWeek]}
              </strong>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  cursor: disabled ? "default" : "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={day.isClosed}
                  disabled={disabled}
                  onChange={(event) => {
                    const isClosed = event.target.checked;

                    updateDay(day.dayOfWeek, {
                      isClosed,
                      opensAt: isClosed ? null : "09:00",
                      closesAt: isClosed ? null : "18:00",
                    });
                  }}
                />
                Cerrado
              </label>
            </div>

            {!day.isClosed && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <label style={{ fontSize: 12 }}>
                  Apertura
                  <input
                    type="time"
                    value={day.opensAt ?? ""}
                    disabled={disabled}
                    onChange={(event) =>
                      updateDay(day.dayOfWeek, {
                        opensAt: event.target.value,
                      })
                    }
                    style={{
                      display: "block",
                      width: "100%",
                      minWidth: 0,
                      marginTop: 6,
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      padding: 8,
                    }}
                  />
                </label>

                <label style={{ fontSize: 12 }}>
                  Cierre
                  <input
                    type="time"
                    value={day.closesAt ?? ""}
                    disabled={disabled}
                    onChange={(event) =>
                      updateDay(day.dayOfWeek, {
                        closesAt: event.target.value,
                      })
                    }
                    style={{
                      display: "block",
                      width: "100%",
                      minWidth: 0,
                      marginTop: 6,
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      padding: 8,
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
