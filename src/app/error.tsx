"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  return (
    // Cambiamos <html> y <body> por un simple <div> contenedor
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
        color: "var(--text-primary)",
        fontFamily: "sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border-color)",
          padding: 40,
          borderRadius: 12,
          textAlign: "center",
          maxWidth: 450,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
          }}
        >
          ⚠️
        </div>

        <h2>Something went wrong</h2>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 14,
          }}
        >
          {error.message || "Unexpected error"}
        </p>

        <button
          onClick={() => reset()}
          style={{
            marginTop: 10,
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}