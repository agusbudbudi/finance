import { useNavigate } from "react-router-dom";
import { ChevronRight, Target, ArrowUpRight } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/formatters";

interface ExpenseDataItem {
  name: string;
  spent: number;
  earned: number;
}

interface SpendingAnalyticsChartProps {
  expenseData: ExpenseDataItem[];
  monthlyExpenses: number;
  budgetLimit: number;
  hasBudget: boolean;
}

export const SpendingAnalyticsChart = ({
  expenseData,
  monthlyExpenses,
  budgetLimit,
  hasBudget,
}: SpendingAnalyticsChartProps) => {
  const navigate = useNavigate();

  return (
    <Card
      title="Income vs Spending"
      subtitle="Financial performance"
      className="lg:col-span-2"
    >
      <div className="flex justify-between items-end mb-6">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <span className="text-xs font-medium text-gray-500">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-500"></div>
            <span className="text-xs font-medium text-gray-500">Expenses</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-white cursor-pointer bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700">
          Last 6 Months <ChevronRight className="w-3 h-3 ml-1" />
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={expenseData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length >= 2) {
                  return (
                    <div className="bg-gray-900 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Spent</span>
                          <span className="text-xs font-black text-white ml-auto">
                            {formatCurrency(payload[0].value as number)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Income</span>
                          <span className="text-xs font-black text-white ml-auto">
                            {formatCurrency(payload[1].value as number)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Expense Bar */}
            <Bar dataKey="spent" radius={[4, 4, 0, 0]} barSize={10}>
              {expenseData.map((_entry, index) => (
                <Cell key={`cell-spent-${index}`} fill="#3069fe" />
              ))}
            </Bar>
            {/* Income Bar */}
            <Bar dataKey="earned" radius={[4, 4, 0, 0]} barSize={10}>
              {expenseData.map((_entry, index) => (
                <Cell
                  key={`cell-inc-${index}`}
                  fill="currentColor"
                  className="text-slate-200 dark:text-slate-700"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div 
        onClick={() => navigate("/planner")}
        className="mt-8 p-4 md:p-6 bg-primary-500 rounded-xl text-white flex items-center justify-between shadow-lg shadow-primary-500/20 cursor-pointer transition-all hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center transition-transform group-hover:rotate-12">
            <Target className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Monthly Strategy</p>
            <p className="text-xs text-white/70">
              {hasBudget
                ? `Completion: ${Math.round((monthlyExpenses / budgetLimit) * 100) || 0}% of budget used`
                : "No active budget set for this month"}
            </p>
          </div>
        </div>
        <ArrowUpRight className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </Card>
  );
};
