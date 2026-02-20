import { useState, useEffect } from "react";
import { useInvestmentStore } from "../stores/useInvestmentStore";
import { Card } from "../components/common/Card";
import { formatCurrency, formatPercentage } from "../utils/formatters";
import {
  TrendingUp,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Info,
  ArrowUpRight,
  Target,
  Clock,
  ChevronRight,
  Settings2,
  Wallet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const InvestmentPage = () => {
  const { investment, updateConfig, updateProjections } = useInvestmentStore();

  // Local state for configuration inputs
  const [contribution, setContribution] = useState(
    investment?.monthlyContribution.toString() || "0",
  );
  const [expectedReturn, setExpectedReturn] = useState(
    (investment?.estimatedAnnualReturn
      ? investment.estimatedAnnualReturn * 100
      : 0
    ).toString(),
  );

  useEffect(() => {
    updateProjections();
  }, [updateProjections]);

  const handleUpdateConfig = () => {
    const monthly = parseInt(contribution);
    const annRate = parseFloat(expectedReturn) / 100;
    if (!isNaN(monthly) && !isNaN(annRate)) {
      updateConfig(monthly, annRate);
    }
  };

  if (!investment)
    return (
      <div className="text-gray-900 dark:text-white text-center py-20">
        Loading investment data...
      </div>
    );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Header & Config Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-gray-100 dark:border-white/10 backdrop-blur-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500 rounded-xl">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Wealth Growth
            </h2>
          </div>
          <p className="text-gray-500 dark:text-white/60 font-medium max-w-sm">
            Wealth accumulation starting{" "}
            <span className="text-primary-500 dark:text-primary-400 font-bold">
              February 2026
            </span>{" "}
            via monthly mutual fund contributions.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest ml-1">
              Monthly Contribution
            </label>
            <div className="relative group">
              <input
                type="number"
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                className="bg-gray-100 dark:bg-black/20 border-2 border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-bold outline-none focus:border-primary-500 transition-all w-48"
                placeholder="IDR Amount"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest ml-1">
              Est. Return (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
                className="bg-gray-100 dark:bg-black/20 border-2 border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-bold outline-none focus:border-primary-500 transition-all w-28"
                placeholder="12%"
              />
            </div>
          </div>
          <button
            onClick={handleUpdateConfig}
            className="p-4 bg-primary-500 hover:bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/20 transition-all active:scale-95"
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl group-hover:scale-150 transition-all"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
              <Target className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Total Contributed
            </p>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">
            {formatCurrency(investment.monthlyContribution * 12)}
          </h3>
          <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center text-[10px] font-black uppercase text-gray-400 tracking-wider">
            <Clock className="w-3 h-3 mr-1" />
            12-Month Base Projection
          </div>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:scale-150 transition-all"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Projected Value
            </p>
          </div>
          <h3 className="text-3xl font-black text-green-600">
            {formatCurrency(
              investment.projections[investment.projections.length - 1]
                ?.estimatedValue || 0,
            )}
          </h3>
          <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center text-[10px] font-black uppercase text-green-600 tracking-wider">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Estimated with {formatPercentage(
              investment.estimatedAnnualReturn,
            )}{" "}
            Yield
          </div>
        </Card>

        <Card
          variant="blue"
          className="hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-2 relative z-10">
            Monthly Commitment
          </p>
          <h3 className="text-3xl font-black text-white relative z-10">
            {formatCurrency(investment.monthlyContribution)}
          </h3>
          <p className="mt-4 text-[11px] font-bold text-white/50 leading-relaxed relative z-10">
            Automated transfer from main liquidity to Permata RDN for
            diversified asset acquisition.
          </p>
        </Card>
      </div>

      <Card
        title="12-Month Wealth Projection"
        subtitle="Simulated growth starting from February 2026 based on compound interest dynamics."
        variant="white"
      >
        <div className="h-[450px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={investment.projections}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3069fe" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3069fe" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 700 }}
                dy={10}
                tickFormatter={(val) => {
                  const date = new Date(val + "-01");
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    year: "2-digit",
                  });
                }}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 700 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "24px",
                  border: "none",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  padding: "20px",
                  backgroundColor: "#000",
                }}
                itemStyle={{
                  fontSize: "12px",
                  fontWeight: "black",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
                labelStyle={{
                  color: "rgba(255,255,255,0.4)",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  fontSize: "10px",
                }}
                formatter={(value) => [formatCurrency(value as number), ""]}
              />
              <Area
                type="monotone"
                dataKey="estimatedValue"
                name="Projected Value"
                stroke="#3069fe"
                strokeWidth={5}
                fillOpacity={1}
                fill="url(#colorValue)"
                animationDuration={2000}
              />
              <Area
                type="monotone"
                dataKey="cumulativeContribution"
                name="Base Savings"
                stroke="#cbd5e1"
                strokeWidth={2}
                strokeDasharray="10 10"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Snapshot Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
        <Card title="Strategy Mechanics" variant="white">
          <div className="space-y-4">
            {[
              {
                icon: Clock,
                title: "Time Horizon",
                value: "12 Months Initial",
                color: "text-blue-500",
                bg: "bg-blue-50",
              },
              {
                icon: LineIcon,
                title: "Formula",
                value: "Compound Monthly",
                color: "text-purple-500",
                bg: "bg-purple-50",
              },
              {
                icon: Wallet,
                title: "Custodian",
                value: "Permata RDN",
                color: "text-amber-500",
                bg: "bg-amber-50",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-50 dark:bg-gray-950/50 dark:border-gray-800"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${feature.bg} dark:bg-opacity-10 flex items-center justify-center ${feature.color}`}
                  >
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {feature.title}
                  </span>
                </div>
                <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                  {feature.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Portfolio Growth" variant="white">
          <div className="flex flex-col h-full bg-primary-500 rounded-xl p-6 text-white relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-all"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">
              Total Wealth Acceleration
            </p>
            <div className="text-5xl font-black my-4">
              +{" "}
              {formatPercentage(
                ((investment.projections[11]?.estimatedValue || 0) -
                  investment.monthlyContribution * 12) /
                  (investment.monthlyContribution * 12 || 1),
              )}
            </div>
            <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase text-white/40">
                  Interest Earned
                </p>
                <p className="text-xl font-bold">
                  {formatCurrency(
                    (investment.projections[11]?.estimatedValue || 0) -
                      investment.monthlyContribution * 12,
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
