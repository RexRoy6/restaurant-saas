export default function ErrorBox({
  message,
  code,
}: {
  message: string;
  code?: number;
}) {
  return (
    <div
      style={{
        background: "#ffe3e3",
        color: "#b00020",
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
      }}
    >
      <strong>Error {code}</strong>: {message}
    </div>
  );
}