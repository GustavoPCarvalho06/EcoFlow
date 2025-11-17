import { UserManagementTable } from "@/components/dashboard/UserManagementTable";
import Layout from "@/components/dashboard/layout/Layout";

export default async function UsuariosPage() {
  return (
    <Layout>

      <main className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">

        <div className="flex items-center justify-between pb-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Gerenciamento de Usuários
          </h1>
        </div>

        <div className="w-full bg-white rounded-xl shadow-md border p-5">
          <UserManagementTable />
        </div>

      </main>

    </Layout>
  );
}
