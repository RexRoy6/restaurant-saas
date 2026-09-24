import { getAuthContext } from "@/lib/auth/getAuthContext";
import CompanyShell from "./CompanyShell";
import { redirect } from "next/navigation"


export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const auth = await getAuthContext();

  if (!auth) {
    redirect("/")
  }


  return (
    <CompanyShell
      role={auth.role}
    >
      {children}
    </CompanyShell>
  );
}