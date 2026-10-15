
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "owner" | "employee";

interface AuthUser {
  role?: string;
}

const roleRoutes: Record<UserRole, string> = {
  admin: "/admin",
  owner: "/company",
  employee: "/company/orders",
};

async function readError(
  response: Response,
  fallback: string
): Promise<string> {
  const data = await response.json().catch(() => ({}));

  return typeof data.error === "string"
    ? data.error
    : typeof data.message === "string"
      ? data.message
      : fallback;
}

export function useLogin() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (email: string, password: string) => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!res.ok) {
        setError(
          await readError(res, "Credenciales incorrectas.")
        );
        return;
      }

      const meRes = await fetch("/api/company/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (!meRes.ok) {
        setError(
          await readError(
            meRes,
            "No se pudo obtener la información del usuario."
          )
        );
        return;
      }

      const user: AuthUser = await meRes.json();

      const destination =
        user.role && user.role in roleRoutes
          ? roleRoutes[user.role as UserRole]
          : null;

      if (!destination) {
        setError(
          "Tu cuenta no tiene un rol válido. Contacta al administrador."
        );
        return;
      }

      router.replace(destination);
      router.refresh();
    } catch {
      setError(
        "Error de conexión. Verifica tu internet e inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
  };
}
