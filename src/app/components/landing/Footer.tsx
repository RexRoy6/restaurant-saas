
import Image from "next/image";
import styles from "./landing.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <Image
            src="/hospiHost.png"
            alt=""
            width={36}
            height={36}
          />
          <span>HospiHost</span>
        </div>

        <p>
          © {new Date().getFullYear()} HospiHost.
          Todos los derechos reservados.
        </p>

        <a href="#inicio" className={styles.backToTop}>
          Volver arriba ↑
        </a>
      </div>
    </footer>
  );
}
