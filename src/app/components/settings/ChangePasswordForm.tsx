"use client";

import { useState } from "react";
import ErrorBox from "@/app/components/ErrorBox";

export default function ChangePasswordForm({
    onSuccess,
}: {
    onSuccess?: (message: string) => void;
}) {

    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswords, setShowPasswords] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState<number | undefined>();
    const [success, setSuccess] = useState("");

    // 🔒 reglas de seguridad
    const validations = {
        minLength: form.newPassword.length >= 6,
        hasUppercase: /[A-Z]/.test(form.newPassword),
        hasNumber: /[0-9]/.test(form.newPassword),
    };

    const passwordsMatch =
        form.newPassword &&
        form.confirmPassword &&
        form.newPassword === form.confirmPassword;

    const isValidPassword =
        validations.minLength &&
        validations.hasUppercase &&
        validations.hasNumber;

    const handleSubmit = async () => {
        try {
            setError("");
            setSuccess("");

            if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
                setError("All fields are required");
                return;
            }

            if (!passwordsMatch) {
                setError("Passwords do not match");
                return;
            }

            if (!isValidPassword) {
                setError("Password does not meet requirements");
                return;
            }

            setLoading(true);

            const res = await fetch("/api/auth/change-password", {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword: form.currentPassword,
                    newPassword: form.newPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to change password");
                setErrorCode(res.status);
                return;
            }

            const message = data.message || "Password updated successfully";

            setSuccess(message);

            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            onSuccess?.(message);

        } catch {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    const renderValidation = (valid: boolean, label: string) => (
        <div style={{ color: valid ? "green" : "#999", fontSize: 13 }}>
            {valid ? "✓" : "•"} {label}
        </div>
    );

    return (
        <div
            style={{
                maxWidth: 400,
                display: "flex",
                flexDirection: "column",
                gap: 10,
            }}
        >
            <h3>Change Password</h3>

            {error && <ErrorBox message={error} code={errorCode} />}

            {success && (
                <div
                    style={{
                        background: "#e6ffed",
                        color: "#067d3f",
                        padding: 12,
                        borderRadius: 8,
                    }}
                >
                    {success}
                </div>
            )}

            {/* toggle show/hide */}
            <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                style={{
                    alignSelf: "flex-end",
                    fontSize: 12,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                {showPasswords ? "Hide passwords" : "Show passwords"}
            </button>

            <input
                type={showPasswords ? "text" : "password"}
                placeholder="Current password"
                value={form.currentPassword}
                onChange={(e) =>
                    setForm({ ...form, currentPassword: e.target.value })
                }
            />

            <input
                type={showPasswords ? "text" : "password"}
                placeholder="New password"
                value={form.newPassword}
                onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                }
            />

            {/* 🔒 Validaciones visuales */}
            <div style={{ marginBottom: 5 }}>
                {renderValidation(validations.minLength, "At least 6 characters")}
                {renderValidation(validations.hasUppercase, "One uppercase letter")}
                {renderValidation(validations.hasNumber, "One number")}
            </div>

            <input
                type={showPasswords ? "text" : "password"}
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                }
            />

            {/* match indicator */}
            {form.confirmPassword && (
                <div
                    style={{
                        fontSize: 13,
                        color: passwordsMatch ? "green" : "#b00020",
                    }}
                >
                    {passwordsMatch
                        ? "✓ Passwords match"
                        : "Passwords do not match"}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                    padding: "10px",
                    borderRadius: 8,
                    border: "none",
                    background: "#111",
                    color: "#fff",
                    cursor: "pointer",
                    opacity: loading ? 0.7 : 1,
                }}
            >
                {loading ? "Updating..." : "Update Password"}
            </button>
        </div>
    );
}