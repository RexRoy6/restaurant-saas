import ClientsModule from "@/app/components/crm/clients/ClientsModule";
import { requireRole } from "@/lib/auth/requireRole";

export default async function ClientsPage() {

  await requireRole(["owner","employee"]);

  return <ClientsModule />;
}