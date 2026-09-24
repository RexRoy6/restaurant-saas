import { User } from "@/modules/admin/types/admin";
import { styles } from "@/styles/layout.styles";

export default function Sidebar({ user }: { user: User | null }) {
  return (
    <aside style={styles.sidebar}>
      <div>
        <p style={styles.sidebarTitle}>MENU</p>
        <button style={styles.sidebarActive}>Home</button>
        <button style={styles.sidebarItem}>Services</button>
        <button style={styles.sidebarItem}>Clients</button>
        <button style={styles.sidebarItem}>Events</button>
      </div>
      <div>
        <p style={styles.sidebarTitle}>SOPORTE</p>
        <button style={styles.sidebarItem}>Configuraciones</button>
        <button style={styles.sidebarItem}>Centro de ayuda</button>
      </div>

      {user && (
        <div style={styles.userBox}>
          <strong>{user.name}</strong>
          <br />
          <span style={{ fontSize: 12, color: "#6b7280" }}>{user.email}</span>
        </div>
      )}
    </aside>
  );
}
