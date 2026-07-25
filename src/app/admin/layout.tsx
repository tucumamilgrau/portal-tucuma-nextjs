import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";

export const metadata = {
  title: "Painel Administrativo — Portal Tucumã Milgrau",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 min-w-0 p-6 lg:p-7">{children}</main>
      </div>
    </AdminGuard>
  );
}
