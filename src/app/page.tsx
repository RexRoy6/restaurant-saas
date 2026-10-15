
import type { Metadata } from "next";

import Navbar from "@/app/components/landing/Navbar";
import HeroSection from "@/app/components/landing/HeroSection";
import FeaturesSection from "@/app/components/landing/FeaturesSection";
import LoginSection from "@/app/components/landing/LoginSection";
import Footer from "@/app/components/landing/Footer";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "HospiHost | Sistema POS para restaurantes",
  description:
    "Gestiona pedidos, controla costos y administra tu restaurante con HospiHost.",
};

export default function HomePage() {
  return (
    <main className={styles.page}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <LoginSection />
      <Footer />
    </main>
  );
}
