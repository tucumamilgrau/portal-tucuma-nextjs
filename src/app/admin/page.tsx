import DashboardOverview from "@/components/admin/DashboardOverview";
import AdminGreeting from "@/components/admin/AdminGreeting";

export default function AdminDashboard() {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h1 className="text-[1.3rem] font-title font-semibold">Dashboard</h1>
          <AdminGreeting />
        </div>
      </div>

      <DashboardOverview />
    </div>
  );
}
