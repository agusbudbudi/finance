import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { MonthlyPlanner } from "./pages/MonthlyPlanner";
import { CreditCardPage } from "./pages/CreditCardPage";
import { InvestmentPage } from "./pages/InvestmentPage";
import { FreelancePage } from "./pages/FreelancePage";
import { ExpensePage } from "./pages/ExpensePage";
import { BucketPortfolioPage } from "./pages/BucketPortfolioPage";
import { RecurringPage } from "./pages/RecurringPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SimpleModePage } from "./pages/SimpleModePage";
import { SimpleSummaryPage } from "./pages/SimpleSummaryPage";
import { SimpleIncomePage } from "./pages/SimpleIncomePage";
import { SimpleBudgetPage } from "./pages/SimpleBudgetPage";
import { MasterPasswordGuard } from "./components/auth/MasterPasswordGuard";
import { AuthScreen } from "./components/auth/AuthScreen";
import { useAuthStore } from "./stores/useAuthStore";
import { useUIStore } from "./stores/useUIStore";
import { useEffect } from "react";
import "./index.css";

function SimpleModeRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSimpleMode = useUIStore((state) => state.isSimpleMode);

  useEffect(() => {
    const publicPaths = ["/settings", "/auth"]; // Paths allowed in both modes
    const isPublicPath = publicPaths.some(path => location.pathname.startsWith(path));

    if (isPublicPath) return;

    if (isSimpleMode && !location.pathname.startsWith("/simple")) {
      navigate("/simple", { replace: true });
    } else if (!isSimpleMode && location.pathname.startsWith("/simple")) {
      navigate("/dashboard", { replace: true });
    }
  }, [isSimpleMode, location.pathname, navigate]);

  return null;
}

function App() {
  const { user } = useAuthStore();

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <BrowserRouter>
      <SimpleModeRedirect />
      <MasterPasswordGuard>
        <Routes>
          <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="simple" element={<SimpleModePage />} />
          <Route path="simple/income" element={<SimpleIncomePage />} />
          <Route path="simple/summary" element={<SimpleSummaryPage />} />
          <Route path="simple/budget" element={<SimpleBudgetPage />} />
          <Route path="planner" element={<MonthlyPlanner />} />
          <Route path="credit-card" element={<CreditCardPage />} />
          <Route path="investment" element={<InvestmentPage />} />
          <Route path="freelance" element={<FreelancePage />} />
          <Route path="expense" element={<ExpensePage />} />
          <Route path="buckets" element={<BucketPortfolioPage />} />
          <Route path="recurring" element={<RecurringPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        </Routes>
      </MasterPasswordGuard>
    </BrowserRouter>
  );
}

export default App;
