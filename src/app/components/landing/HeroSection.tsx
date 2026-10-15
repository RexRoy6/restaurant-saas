
import styles from "./landing.module.css";

export default function HeroSection() {
  return (
    <section id="inicio" className={styles.hero}>
      <div className={styles.heroContent}>
        <span className={styles.eyebrow}>
          SISTEMA POS PARA RESTAURANTES
        </span>

        <h1 className={styles.heroTitle}>
          Tu restaurante.
          <br />
          <span>Todo bajo control.</span>
        </h1>

        <p className={styles.heroDescription}>
          Simplifica la gestión de pedidos, controla tus costos
          y administra tu restaurante desde un solo lugar.
          HospiHost te ayuda a mantener tu operación organizada.
        </p>

        <div className={styles.heroActions}>
          <a href="#login" className={styles.primaryButton}>
            Comenzar ahora
            <span aria-hidden="true">→</span>
          </a>

          <a href="#funciones" className={styles.secondaryButton}>
            Conocer funciones
          </a>
        </div>

        <div className={styles.heroHighlights}>
          <span>✓ Gestión de pedidos</span>
          <span>✓ Control de costos</span>
          <span>✓ Acceso por roles</span>
        </div>
      </div>

      <div className={styles.heroVisual} aria-label="Vista ilustrativa de HospiHost">
        <div className={styles.dashboardPreview}>
          <div className={styles.previewHeader}>
            <div className={styles.previewDots}>
              <i />
              <i />
              <i />
            </div>
            <span>HospiHost / Dashboard</span>
          </div>

          <div className={styles.previewBody}>
            <div className={styles.previewHeading}>
              <div>
                <small>Panel de control</small>
                <h2>Resumen del negocio</h2>
              </div>
              <span className={styles.previewStatus}>
                ● Sistema activo
              </span>
            </div>

            <div className={styles.previewStats}>
              <div className={styles.previewStat}>
                <small>Pedidos activos</small>
                <strong>24</strong>
                <span>Órdenes en proceso</span>
              </div>

              <div className={styles.previewStat}>
                <small>Ventas del día</small>
                <strong>$8,450</strong>
                <span>Ejemplo ilustrativo</span>
              </div>
            </div>

            <div className={styles.previewOrders}>
              <h3>Pedidos recientes</h3>

              <div className={styles.previewOrder}>
                <span>Mesa 04</span>
                <span className={styles.orderPreparing}>
                  Preparando
                </span>
              </div>

              <div className={styles.previewOrder}>
                <span>Mesa 08</span>
                <span className={styles.orderReady}>
                  Listo
                </span>
              </div>

              <div className={styles.previewOrder}>
                <span>Mesa 12</span>
                <span className={styles.orderPreparing}>
                  Preparando
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className={styles.previewCaption}>
          Vista conceptual · Datos de demostración
        </p>
      </div>
    </section>
  );
}
