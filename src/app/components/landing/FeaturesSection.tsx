
import styles from "./landing.module.css";

const features = [
  {
    icon: "📋",
    title: "Gestión de pedidos",
    description:
      "Organiza las órdenes de tu restaurante y facilita el seguimiento de cada pedido.",
  },
  {
    icon: "📊",
    title: "Control de costos",
    description:
      "Mantén una mejor visión de los costos de tu operación.",
  },
  {
    icon: "👥",
    title: "Administración de personal",
    description:
      "Organiza el acceso al sistema mediante roles y permisos.",
  },
  {
    icon: "📱",
    title: "Acceso desde cualquier dispositivo",
    description:
      "Utiliza una interfaz adaptable a computadoras, tablets y celulares.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="funciones" className={styles.features}>
      <div className={styles.sectionHeading}>
        <span className={styles.sectionEyebrow}>
          ¿POR QUÉ HOSPIHOST?
        </span>

        <h2>
          Menos complicaciones.
          <br />
          <span>Más control.</span>
        </h2>

        <p>
          Herramientas diseñadas para simplificar la operación
          diaria de restaurantes, bares y cafeterías.
        </p>
      </div>

      <div className={styles.featuresGrid}>
        {features.map((feature) => (
          <article key={feature.title} className={styles.featureCard}>
            <div className={styles.featureIcon} aria-hidden="true">
              {feature.icon}
            </div>

            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
