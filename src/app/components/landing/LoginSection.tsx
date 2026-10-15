
import LoginForm from "@/app/components/auth/LoginForm";
import styles from "./landing.module.css";

export default function LoginSection() {
  return (
    <section id="login" className={styles.loginSection}>
      <div className={styles.loginLayout}>
        <div className={styles.loginInformation}>
          <span className={styles.sectionEyebrow}>
            ACCEDE A TU ESPACIO
          </span>

          <h2>
            Tu operación
            <br />
            comienza aquí.
          </h2>

          <p>
            Inicia sesión para acceder a las herramientas
            de administración de tu restaurante.
          </p>

          <div className={styles.loginBenefits}>
            <span>✓ Acceso seguro a tu cuenta</span>
            <span>✓ Panel según tu rol</span>
            <span>✓ Gestión centralizada</span>
          </div>
        </div>

        <LoginForm />
      </div>
    </section>
  );
}
