import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import PublicLayout from "./components/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import AdminLayout from "./components/admin/AdminLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import BookService from "./pages/BookService";
import Shop from "./pages/Shop";
import Policies from "./pages/Policies";
import Tiers from "./pages/Tiers";
import Offers from "./pages/Offers";
import Partners from "./pages/Partners";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Donate from "./pages/Donate";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CompleteProfile from "./pages/CompleteProfile";
import ShareLocation from "./pages/ShareLocation";
import DashboardOverview from "./components/dashboard/DashboardOverview";
import DeliveryHistory from "./components/dashboard/DeliveryHistory";
import LoyaltyRewards from "./components/dashboard/LoyaltyRewards";
import DashboardAnalytics from "./components/dashboard/DashboardAnalytics";
import NotificationsPage from "./components/dashboard/NotificationsPage";
import SpinWheel from "./components/dashboard/SpinWheel";
import BadgesPage from "./components/dashboard/BadgesPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminCustomers from "./components/admin/AdminCustomers";
import AdminDeliveries from "./components/admin/AdminDeliveries";
import AdminCoupons from "./components/admin/AdminCoupons";
import AdminLoyalty from "./components/admin/AdminLoyalty";
import AdminSpin from "./components/admin/AdminSpin";
import AdminBlog from "./components/admin/AdminBlog";
import AdminPartners from "./components/admin/AdminPartners";
import AdminContent from "./components/admin/AdminContent";
import AdminCustomerDetail from "./components/admin/AdminCustomerDetail";
import AdminApiIntegrations from "./components/admin/AdminApiIntegrations";
import AdminPricing from "./components/admin/AdminPricing";
import AdminServices from "./components/admin/AdminServices";
import AdminShop from "./components/admin/AdminShop";
import AdminServiceBookings from "./components/admin/AdminServiceBookings";
import AdminHubOrders from "./components/admin/AdminHubOrders";
import AdminHubWebsites from "./components/admin/AdminHubWebsites";
import AdminHubAgents from "./components/admin/AdminHubAgents";
import AdminApiDocs from "./components/admin/AdminApiDocs";
import AgentRoute from "./components/AgentRoute";
import AgentLogin from "./pages/AgentLogin";
import AgentDashboard from "./pages/AgentDashboard";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public pages */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/tiers" element={<Tiers />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/book" element={<BookService />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/donate" element={<Donate />} />
            </Route>

            {/* Auth pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/share-location/:token" element={<ShareLocation />} />
            <Route path="/install" element={<Install />} />

            {/* Protected dashboard routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardOverview />} />
                <Route path="/dashboard/deliveries" element={<DeliveryHistory />} />
                <Route path="/dashboard/rewards" element={<LoyaltyRewards />} />
                <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />
                <Route path="/dashboard/notifications" element={<NotificationsPage />} />
                <Route path="/dashboard/spin" element={<SpinWheel />} />
                <Route path="/dashboard/badges" element={<BadgesPage />} />
              </Route>
            </Route>

            {/* Protected admin routes */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/analytics" element={<AdminDashboard />} />
                <Route path="/admin/customers" element={<AdminCustomers />} />
                <Route path="/admin/customers/:id" element={<AdminCustomerDetail />} />
                <Route path="/admin/deliveries" element={<AdminDeliveries />} />
                <Route path="/admin/api-integrations" element={<AdminApiIntegrations />} />
                <Route path="/admin/coupons" element={<AdminCoupons />} />
                <Route path="/admin/loyalty" element={<AdminLoyalty />} />
                <Route path="/admin/spin" element={<AdminSpin />} />
                <Route path="/admin/blog" element={<AdminBlog />} />
                <Route path="/admin/partners" element={<AdminPartners />} />
                <Route path="/admin/content" element={<AdminContent />} />
                <Route path="/admin/pricing" element={<AdminPricing />} />
                <Route path="/admin/services" element={<AdminServices />} />
                <Route path="/admin/shop" element={<AdminShop />} />
                <Route path="/admin/bookings" element={<AdminServiceBookings />} />
                <Route path="/admin/hub" element={<AdminHubOrders />} />
                <Route path="/admin/hub-websites" element={<AdminHubWebsites />} />
                <Route path="/admin/hub-agents" element={<AdminHubAgents />} />
                <Route path="/admin/hub-docs" element={<AdminApiDocs />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);
export default App;
