
"use client";

import { useState, type FormEvent } from "react";
import { useLogin } from "@/app/hooks/useLogin";
import ErrorBox from "@/app/components/ErrorBox";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const { login, loading, error } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerIcon} aria-hidden="true">
          ✦
        </div>

        <h3>Bienvenido de nuevo</h3>
        <p>Ingresa tus credenciales para continuar.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="login-email">
            Correo electrónico
          </label>

          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="nombre@restaurante.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="login-password">
            Contraseña
          </label>

          <div className={styles.passwordWrapper}>
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            <button
              type="button"
              className={styles.showPassword}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.6 5.1A10 10 0 0 1 12 5c7 0 11 7 11 7a17 17 0 0 1-4 4.5" />
                  <path d="M6.3 6.3C3 8.4 1 12 1 12s4 7 11 7c1.7 0 3.2-.4 4.5-1" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" aria-live="polite">
            <ErrorBox message={error} />
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>

      <p className={styles.footerText}>
        ¿Necesitas una cuenta?
        <br />
        Contacta al administrador de tu restaurante.
      </p>
    </div>
  );
}
