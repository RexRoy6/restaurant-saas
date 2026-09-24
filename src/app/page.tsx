"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ErrorBox from "@/app/components/ErrorBox";

const AdminLogin: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {

      /* ---------- LOGIN ---------- */

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || data.message || "Invalid credentials");
        return;
      }

      /* ---------- GET USER ROLE ---------- */

      const meRes = await fetch("/api/company/me", {
        credentials: "include",
      });

      if (!meRes.ok) {
        const data = await meRes.json().catch(() => ({}));
        setError(data.error || data.message || "Authentication error");
        return;
      }

      const user = await meRes.json();

      /* ---------- REDIRECT BASED ON ROLE ---------- */

      if (user.role === "admin") {
        router.replace("/admin");
        return;
      }

      if (user.role === "owner" || user.role === "employee") {
        router.replace("/company");
        return;
      }

      router.replace("/");

    } catch {
      setError("Connection error. Please try again.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* LEFT SIDE */}
        <div style={styles.left}>
          <div style={styles.brandBox}>
            <Image
              src="/sandiasoft.png"
              alt="CRM Logo"
              style={{ borderRadius: 13 }}
              width={150}
              height={150}
            />
          </div>
          <h1 style={styles.brandTitle}>CRM Corporate System</h1>
          <p style={styles.brandSubtitle}>
            Manage customer relationships, contracts, services and operations
            from a centralized enterprise platform.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div style={styles.right}>
          <div style={styles.card}>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />

              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  required
                />
                <button
                  type="button"
                  style={styles.showButton}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    // Ícono "ojo tachado" (SVG)
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    // Ícono "ojo abierto"
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {error && <ErrorBox message={error} />}

              <button type="submit" style={styles.loginButton}>
                Log In
              </button>

              <div style={styles.divider} />

              <button
                type="button"
                style={styles.registerButton}
                onClick={() => alert("Generic registration flow")}
              >
                Create New Account
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>© 2024 CRM Corporate System. All rights reserved.</p>
        <div>
          <a style={styles.footerLink}>Privacy Policy</a>
          <a style={styles.footerLink}>Terms of Service</a>
          <a style={styles.footerLink}>Security Standards</a>
        </div>
      </footer>
    </div>
  );
};

export default AdminLogin;

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "120px",
    padding: "40px",
  },
  left: {
    maxWidth: 500,
  },
  brandBox: {
    width: 160,
    height: 160,
    borderRadius: 14,
    backgroundColor: "#1877f2",
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginLeft: "auto",
    marginRight: "auto",
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: 700,
    margin: 0,
    color: "#1c1e21",
  },
  brandSubtitle: {
    fontSize: 20,
    color: "#606770",
    marginTop: 16,
  },
  right: {
    width: 400,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    padding: "14px",
    paddingRight: "44px", // espacio para el botón
    borderRadius: 6,
    border: "1px solid #dddfe2",
    fontSize: 16,
    width: "100%",
    boxSizing: "border-box",
  },
  showButton: {
    position: "absolute",
    right: 10,
    background: "none",
    border: "none",
    color: "#606770",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 4,
    transition: "background 0.2s",
  },
  loginButton: {
    marginTop: 4,
    padding: "14px",
    backgroundColor: "#1877f2",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  divider: {
    height: 1,
    backgroundColor: "#dadde1",
    margin: "10px 0",
  },
  registerButton: {
    padding: "14px",
    backgroundColor: "#42b72a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "10px",
    borderRadius: 6,
    fontSize: 14,
    textAlign: "center",
    border: "1px solid #fecaca",
  },
  footer: {
    padding: 20,
    textAlign: "center",
    fontSize: 12,
    color: "#8a8d91",
  },
  footerLink: {
    margin: "0 8px",
    cursor: "pointer",
  },
};
