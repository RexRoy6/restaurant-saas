
import Image from "next/image";
import styles from "./landing.module.css";

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <nav className={styles.navContainer} aria-label="Navegación principal">
        <a href="#inicio" className={styles.brand}>
          <Image
            src="/hospiHost.png"
            alt="HospiHost"
            width={46}
            height={46}
            className={styles.logo}
            priority
          />
          <span>HospiHost</span>
        </a>

        <div className={styles.navActions}>
          <a href="#funciones" className={styles.navLink}>
            Funciones
          </a>
          <a href="#login" className={styles.navButton}>
            Ingresar
          </a>
        </div>
      </nav>
    </header>
  );
}
