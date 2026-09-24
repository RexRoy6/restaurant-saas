import { User } from "../types/admin";
import { companyStyles } from "@/styles/companyAdmin.styles";
import CompanyTeamTab from "./CompanyTeamTab";

interface Props {
  users: User[];

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
  onCreateOwner,
  onDeactivateUser,
  onReactivateUser,
}: Props) {
  return (
    <div style={companyStyles.container}>
      <div style={companyStyles.card}>
        <CompanyTeamTab
          users={users}
          onCreateOwner={onCreateOwner}
          onDeactivateUser={onDeactivateUser}
          onReactivateUser={onReactivateUser}
        />
      </div>
    </div>
  );
}