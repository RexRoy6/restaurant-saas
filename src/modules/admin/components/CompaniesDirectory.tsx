import Link from "next/link";
import { Company } from "../types/admin";
import { styles } from "@/styles/layout.styles";

interface Props {
  companies: Company[];
  loading: boolean;
}

export default function CompaniesDirectory({ companies, loading }: Props) {
  if (loading) {
    return <div style={styles.loading}>Cargando empresas...</div>;
  }

  if (companies.length === 0) {
    return <div style={styles.noResults}>No hay empresas</div>;
  }

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Empresa</th>
          <th style={styles.th}>Estado</th>
          <th style={styles.th}>Acción</th>
        </tr>
      </thead>

      <tbody>
        {companies.map((c) => (
          <tr key={c.id} style={styles.tr}>
            <td style={styles.td}>{c.name}</td>

            <td style={styles.td}>{c.deletedAt ? "Inactiva" : "Activa"}</td>

            <td style={styles.td}>
              <Link href={`/admin/companie/${c.id}`}>
                <button style={styles.manageButton}>Gestionar →</button>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
