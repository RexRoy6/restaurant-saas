import Image from "next/image";
import { styles } from "@/styles/layout.styles";

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  logout: () => void;
}

export default function Header({ searchTerm, setSearchTerm, logout }: Props) {
  return (
    <header style={styles.header}>
      <div style={styles.logoContainer}>
        <div style={styles.logoBox}>
          <Image
            src="/sandiasoft.png"
            alt="logo"
            style={{ borderRadius: 8 }}
            width={28}
            height={28}
          />
        </div>
        <span style={styles.logoText}>Sandiasoft</span>
      </div>

      <input
        placeholder="Buscar empresas..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
      />

      <div style={styles.headerRight}>
        <Image
          src="/notifications.svg"
          alt="notification"
          width={25}
          height={25}
          style={styles.notificationIcon}
        />
        <button style={styles.logout} onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
