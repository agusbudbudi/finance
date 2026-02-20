import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import "./index.css";

function App() {
  // Normalize basename: ensures no trailing slash unless it's just "/"
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
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
    </BrowserRouter>
  );
}

export default App;
