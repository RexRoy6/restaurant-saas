import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        height: "100vh",
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
          maxWidth: 420,
        }}
      >
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          404
        </div>

        <h2 style={{ marginBottom: 10 }}>
          Page not found
        </h2>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: 25,
          }}
        >
          The page you are looking for does not exist or was moved.
        </p>

        <Link href="/">
          <button
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "#2563eb",
              color: "white",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Go back home
          </button>
        </Link>
      </div>
    </div>
  );
}