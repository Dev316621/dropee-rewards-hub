import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardBottomNav from "./DashboardBottomNav";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-dashboard-bg flex w-full">
      <DashboardSidebar />
      <main className="flex-1 pb-20 sm:pb-0 overflow-y-auto">
        <Outlet />
      </main>
      <DashboardBottomNav />
    </div>
  );
};

export default DashboardLayout;
