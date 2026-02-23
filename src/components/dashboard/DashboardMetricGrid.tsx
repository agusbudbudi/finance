import { TrendingUp, TrendingDown, Target, CreditCard, AlertCircle, CheckCircle2, Flame } from "lucide-react";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface DashboardMetricGridProps {
  budgetUtilization: number;
  monthlyExpenses: number;
  ccUtilization: number;
  totalCCSpent: number;
  investmentGrowth: number;
  savingsRate: number;
}

export const DashboardMetricGrid = ({
  budgetUtilization,
  monthlyExpenses,
  ccUtilization,
  totalCCSpent,
  investmentGrowth,
  savingsRate,
}: DashboardMetricGridProps) => {
  // Determine date context for budget pacing
  const today = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const expectedPacing = (today / daysInMonth) * 100;
  
  let budgetStatus = { text: "SLAYING THIS MONTH 💅", color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 };
  if (budgetUtilization > 100) {
    budgetStatus = { text: "BROKE ERA 😭", color: "text-red-500", bg: "bg-red-500/10", icon: AlertCircle };
  } else if (budgetUtilization > expectedPacing + 15) {
    budgetStatus = { text: "CHILL OUT BRO 🛑", color: "text-amber-500", bg: "bg-amber-500/10", icon: TrendingUp };
  }

  const metrics = [
    {
      title: "Expense vs Budget",
      value: formatPercentage(budgetUtilization / 100),
      subtitle: `${formatCurrency(monthlyExpenses)} spent`,
      status: budgetStatus,
      icon: TrendingDown,
      color: budgetUtilization > 90 ? "text-red-500" : "text-primary-500",
      glow: budgetUtilization > 90 ? "bg-red-500/10" : "bg-primary-500/10",
      border:
        budgetUtilization > 90 ? "border-red-100/50" : "border-primary-100/50",
    },
    {
      title: "Credit Card Usage",
      value: formatPercentage(ccUtilization / 100),
      subtitle: `${formatCurrency(totalCCSpent)} utilization`,
      status: ccUtilization > 30 ? { text: "LIVING DANGEROUSLY 💀", color: "text-amber-500", bg: "bg-amber-500/10", icon: AlertCircle } : { text: "SAFE & SOUND 🧘", color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 },
      icon: CreditCard,
      color: "text-purple-500",
      glow: "bg-purple-500/10",
      border: "border-purple-100/50",
    },
    {
      title: "Invest. Progress",
      value:
        investmentGrowth > 0
          ? `+${formatPercentage(investmentGrowth / 100)}`
          : "0%",
      subtitle: "12-month projection",
      status: investmentGrowth > 5 ? { text: "STONKS GO UP 🚀", color: "text-green-500", bg: "bg-green-500/10", icon: TrendingUp } : { text: "HODL TIGHT 💎", color: "text-blue-500", bg: "bg-blue-500/10", icon: Target },
      icon: TrendingUp,
      color: "text-green-600",
      glow: "bg-green-500/10",
      border: "border-green-100/50",
    },
    {
      title: "Savings Rate",
      value: formatPercentage(savingsRate / 100),
      subtitle: "Of monthly income",
      status: savingsRate >= 20 ? { text: "WE COOKIN' 🔥", color: "text-green-500", bg: "bg-green-500/10", icon: Flame } : savingsRate > 0 ? { text: "NOT BAD NGL 👏", color: "text-blue-500", bg: "bg-blue-500/10", icon: CheckCircle2 } : { text: "NEED MORE HUSTLE 🎒", color: "text-amber-500", bg: "bg-amber-500/10", icon: Target },
      icon: Target,
      color: "text-amber-600",
      glow: "bg-amber-500/10",
      border: "border-amber-100/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((w, i) => (
        <div
          key={i}
          className={`relative group bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-xl flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 overflow-hidden`}
        >
          <div className="p-4 md:p-6 flex items-center gap-4 md:gap-5 flex-1">
            <div
              className={`absolute -right-2 -bottom-2 w-16 h-16 ${w.glow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
            ></div>

            <div
              className={`w-10 h-10 md:w-14 md:h-14 rounded-xl ${w.glow.replace("/10", "/20")} flex items-center justify-center ${w.color} shrink-0 border ${w.border.replace("/50", "/30")}`}
            >
              <w.icon className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div className="min-w-0 relative z-10 w-full flex flex-col">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1 truncate">
                {w.title}
              </p>
              
              <h4
                className={`text-xl md:text-2xl font-black ${w.color} tracking-tight leading-none mb-1.5`}
              >
                {w.value}
              </h4>
              
              <p className="text-[10px] font-bold text-gray-400/80 truncate">
                {w.subtitle}
              </p>
            </div>
          </div>
          
          {/* Full-width Gen-Z Status Bar */}
          {w.status && (
            <div className={`w-full py-2 px-4 flex items-center justify-center gap-1.5 ${w.status.bg} border-t border-white/5`}>
              <w.status.icon className={`w-3.5 h-3.5 ${w.status.color}`} />
              <span className={`text-[10px] font-black tracking-widest uppercase ${w.status.color}`}>
                {w.status.text}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
