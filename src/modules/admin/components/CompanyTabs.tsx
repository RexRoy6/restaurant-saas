import { CompanyDashboard, User } from "../types/admin";
import { companyStyles } from "@/styles/companyAdmin.styles";
import CompanyTeamTab from "./CompanyTeamTab";

interface Props {
  users: User[];
  dashboard: CompanyDashboard | null;
  activeTab: "team" | "events" | "services";
  setActiveTab: (v: "team" | "events" | "services") => void;
  // onCreateOwner: (email: string, password: string) => void;
  onCreateOwner: (
    email: string,
    password: string,
    role: "owner" | "employee"
  ) => void;
  onDeactivateUser: (userId: number) => void;
  onReactivateUser: (userId: number) => void;
}

export default function CompanyTabs({
  users,
  dashboard,
  activeTab,
  setActiveTab,
  onCreateOwner,
  onDeactivateUser,
  onReactivateUser
}: Props) {
  console.log(1, dashboard);
  return (
    <div style={companyStyles.container}>
      <div style={companyStyles.card}>
        <div style={companyStyles.tabs}>
          <span
            style={
              activeTab === "team" ? companyStyles.activeTab : companyStyles.tab
            }
            onClick={() => setActiveTab("team")}
          >
            Team Users
          </span>

          <span
            style={
              activeTab === "events"
                ? companyStyles.activeTab
                : companyStyles.tab
            }
            onClick={() => setActiveTab("events")}
          >
            Info de cada compania
          </span>

          <span
            style={
              activeTab === "services"
                ? companyStyles.activeTab
                : companyStyles.tab
            }
            onClick={() => setActiveTab("services")}
          >
            Services Catalog
          </span>
        </div>

        {activeTab === "team" && <CompanyTeamTab
          users={users}
          onCreateOwner={onCreateOwner}
          onDeactivateUser={onDeactivateUser}
          onReactivateUser={onReactivateUser}
        />}

        {activeTab === "events" && dashboard && (
          <div>
            <p>Clientes: {dashboard.activity.clients}</p>

            <p>
              Nuevos clientes:
              {dashboard.activity.newClientsThisMonth}
            </p>

            <p>
              Contratos:
              {dashboard.activity.contractsTotal}
            </p>

            <p>
              Eventos:
              {dashboard.activity.eventsTotal}
            </p>

            <p>
              Pagos:
              {dashboard.activity.paymentsTotal}
            </p>

            <p>
              Empleados:
              {dashboard.activity.employees}
            </p>
          </div>
        )}

        {activeTab === "services" && (
          <div style={companyStyles.tabContent}>
            <p>Catálogo de servicios próximamente...</p>
          </div>
        )}
      </div>
    </div>
  );
}
