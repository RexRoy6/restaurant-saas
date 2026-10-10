
"use client";

import { useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import ChangePasswordForm from "@/app/components/settings/ChangePasswordForm";
import CompanyPublicInfoForm from "@/app/components/settings/CompanyPublicInfoForm";

export default function SettingsPage() {
  const [showPublicInfo, setShowPublicInfo] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const cardStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 20,
    maxWidth: 650,
    backgroundColor: "#ffffff",
  };

  return (
    <div>
      <PageHeader
        title="Configuración"
        buttonLabel=""
        onClick={() => {}}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Información pública */}
        <section style={cardStyle}>
          <button
            type="button"
            onClick={() => setShowPublicInfo(!showPublicInfo)}
            aria-expanded={showPublicInfo}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              width: "100%",
              textAlign: "left",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span>
              <strong style={{ display: "block", fontSize: 16 }}>
                Información pública del negocio
              </strong>
              <span
                style={{
                  display: "block",
                  color: "#6b7280",
                  fontSize: 13,
                  marginTop: 5,
                }}
              >
                Google Maps, horarios y cierre temporal
              </span>
            </span>

            <span aria-hidden="true" style={{ fontSize: 20 }}>
              {showPublicInfo ? "−" : "+"}
            </span>
          </button>

          {showPublicInfo && (
            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid #e5e7eb",
                color: "#6b7280",
                fontSize: 14,
              }}
            >
              <CompanyPublicInfoForm />
            </div>
          )}
        </section>

        {/* Seguridad de la cuenta */}
        <section style={cardStyle}>
          <button
            type="button"
            onClick={() =>
              setShowChangePassword(!showChangePassword)
            }
            aria-expanded={showChangePassword}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              width: "100%",
              textAlign: "left",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span>
              <strong style={{ display: "block", fontSize: 16 }}>
                Seguridad de la cuenta
              </strong>
              <span
                style={{
                  display: "block",
                  color: "#6b7280",
                  fontSize: 13,
                  marginTop: 5,
                }}
              >
                Cambiar contraseña
              </span>
            </span>

            <span aria-hidden="true" style={{ fontSize: 20 }}>
              {showChangePassword ? "−" : "+"}
            </span>
          </button>

          {showChangePassword && (
            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <ChangePasswordForm
                onSuccess={() => setShowChangePassword(false)}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}