import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FrontendContentProvider } from "./context/FrontendContentContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import RafflePage from "./pages/RafflePage";
import AdminPage from "./pages/AdminPage";
import BlogPage from "./pages/BlogPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import SponsorPage from "./pages/SponsorPage";
import "./App.css";

const ProtectedRoute = ({ children, requireAdmin = false, requireEditor = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (requireEditor && !["admin", "editor"].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <FrontendContentProvider>
        <BrowserRouter>
          <div className="App min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/raffle/:id" element={<RafflePage />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sponsor" 
                element={
                  <ProtectedRoute>
                    <SponsorPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Toaster position="top-right" richColors />
          </div>
        </BrowserRouter>
      </FrontendContentProvider>
    </AuthProvider>
  );
}

export default App;
