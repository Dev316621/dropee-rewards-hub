import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardBottomNav from "./DashboardBottomNav";
import NotificationOptIn from "./NotificationOptIn";

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isOverview = location.pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-dashboard-bg flex w-full">
      <DashboardSidebar />
      <main className="flex-1 pb-20 sm:pb-0 overflow-y-auto">
        {/* Top bar with back + home (mobile) */}
        <div className="sticky top-0 z-30 bg-dashboard-bg/80 backdrop-blur-lg border-b border-dashboard-border px-4 py-2.5 flex items-center gap-3 sm:hidden">
          {!isOverview && (
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-dashboard-card touch-manipulation">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <Link to="/" className="p-1.5 rounded-lg hover:bg-dashboard-card touch-manipulation">
            <Home className="w-4 h-4 text-muted-foreground" />
          </Link>
          <span className="text-sm font-semibold text-dashboard-card-foreground font-display ml-auto">DROPEE</span>
        </div>
        <Outlet />
      </main>
      <DashboardBottomNav />
      <NotificationOptIn />
    </div>
  );
};

export default DashboardLayout;
