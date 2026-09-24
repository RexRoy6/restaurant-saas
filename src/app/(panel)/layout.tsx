"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { styles } from "@/styles/layout.styles";
import { useAdminDashboard } from "@/modules/admin/hooks/useAdminDashboard";
import { logout as logoutService } from "@/services/auth.services";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAdminDashboard();
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  const logout = async () => {
    try {
      await logoutService();
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={styles.page}>
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        logout={logout}
      />
      <div style={styles.body}>
        <Sidebar user={user} />
        <main style={styles.main}>{children}</main>
      </div>
    </div>
  );
}
