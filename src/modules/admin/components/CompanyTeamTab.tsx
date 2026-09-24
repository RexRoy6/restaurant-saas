import { User } from "../types/admin";
import { companyStyles } from "@/styles/companyAdmin.styles";
import UserCard from "./UserCard";
import { useState } from "react";


export default function CompanyTeamTab({ users, onCreateOwner, onDeactivateUser, onReactivateUser, }:
  {
    users: User[],
    onCreateOwner: (
      email: string,
      password: string,
      role: "owner" | "employee"
    ) => void;
    onDeactivateUser: (userId: number) => void;
    onReactivateUser: (userId: number) => void;

  }) {
  const owners = users.filter((u) => u.role === "owner");
  const staff = users.filter(
    (u) => u.role === "employee"
  );


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "employee">("employee");

  const handleSubmit = () => {
    if (!email || !password) return;

    onCreateOwner(email, password, role);

    setEmail("");
    setPassword("");
    setRole("employee");
  };

  return (
    <>
      <h4 style={companyStyles.sectionTitle}>Owners ({owners.length})</h4>

      {owners.length > 0 ? (
        <div style={companyStyles.userGrid}>
          {owners.map((u) => (
            <UserCard key={u.id} user={u} onDeactivate={onDeactivateUser} onReactivate={onReactivateUser} />
          ))}
        </div>
      ) : (
        <p style={companyStyles.emptyText}>No owners assigned</p>
      )}


      <h4 style={companyStyles.sectionTitle}>Staff ({staff.length})</h4>
      {staff.length > 0 ? (
        <div style={companyStyles.userGrid}>
          {staff.map((u) => (
            <UserCard key={u.id} user={u} onDeactivate={onDeactivateUser} onReactivate={onReactivateUser} />
          ))}
        </div>
      ) : (
        <p style={companyStyles.emptyText}>  No employees assigned</p>
      )}

      <div style={{ marginBottom: 20 }}>
        <h4>Crear usuario</h4>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />


        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "owner" | "employee")
          }
        >
          <option value="employee">Employee</option>
          <option value="owner">Owner</option>
        </select>



        <button onClick={handleSubmit}>
          Crear
        </button>
      </div>

    </>


  );
}
