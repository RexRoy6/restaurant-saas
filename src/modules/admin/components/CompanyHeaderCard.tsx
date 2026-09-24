import { Company } from "../types/admin";
import { companyStyles } from "@/styles/companyAdmin.styles";

interface Props {
  company: Company;

  suspendConfirm: boolean;
  setSuspendConfirm: (v: boolean) => void;

  reactivateConfirm: boolean;
  setReactivateConfirm: (v: boolean) => void;

  onSuspend: () => void;
  onReactivate: () => void;
}

export default function CompanyHeaderCard({
  company,
  suspendConfirm,
  setSuspendConfirm,
  reactivateConfirm,
  setReactivateConfirm,
  onSuspend,
  onReactivate,
}: Props) {
  const isSuspended = !!company.deletedAt;

  return (
    <div style={companyStyles.container}>
      <div style={companyStyles.companyCard}>

        {/* COMPANY INFO */}
        <div style={companyStyles.companyInfo}>

          

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <h3 style={companyStyles.companyName}>
                {company.name}
              </h3>

              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 600,
                  backgroundColor: isSuspended
                    ? "#fee2e2"
                    : "#dcfce7",
                  color: isSuspended
                    ? "#b91c1c"
                    : "#15803d",
                }}
              >
                {isSuspended ? "Suspendida" : "Activa"}
              </span>
            </div>

            {isSuspended && company.deletedAt && (
              <p style={companyStyles.companyMeta}>
                Suspendida el{" "}
                {new Date(company.deletedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div style={companyStyles.actions}>

          {isSuspended ? (

            /* ---------- REACTIVATE ---------- */
            reactivateConfirm ? (
              <div style={companyStyles.confirmBox}>
                <span>
                  ¿Seguro que quieres reactivar esta empresa?
                </span>

                <button
                  onClick={onReactivate}
                  style={companyStyles.confirmYes}
                >
                  Sí
                </button>

                <button
                  onClick={() => setReactivateConfirm(false)}
                  style={companyStyles.confirmNo}
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={onReactivate}
                style={{
                  ...companyStyles.suspendBtn,
                  backgroundColor: "#16a34a",
                }}
              >
                Reactivar
              </button>
            )

          ) : (

            /* ---------- SUSPEND ---------- */
            suspendConfirm ? (
              <div style={companyStyles.confirmBox}>
                <span>
                  ¿Seguro que quieres suspender esta empresa?
                </span>

                <button
                  onClick={onSuspend}
                  style={companyStyles.confirmYes}
                >
                  Sí
                </button>

                <button
                  onClick={() => setSuspendConfirm(false)}
                  style={companyStyles.confirmNo}
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={onSuspend}
                style={companyStyles.suspendBtn}
              >
                Suspender
              </button>
            )
          )}

        </div>
      </div>
    </div>
  );
}