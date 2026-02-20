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
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-gray-900 text-white px-3 py-2 rounded-xl text-[10px] font-black shadow-lg border border-white/10 uppercase tracking-widest">
                      Spent: {formatCurrency(payload[0].value as number)}
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Expense Bar */}
            <Bar dataKey="spent" radius={[6, 6, 0, 0]} barSize={8}>
              {expenseData.map((_entry, index) => (
                <Cell key={`cell-spent-${index}`} fill="#3069fe" />
              ))}
            </Bar>
            {/* Income Bar (lighter color) */}
            <Bar dataKey="earned" radius={[6, 6, 0, 0]} barSize={8}>
              {expenseData.map((_entry, index) => (
                <Cell
                  key={`cell-inc-${index}`}
                  fill="#f1f5f9"
                  className="opacity-20 dark:opacity-10"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 p-6 bg-primary-500 rounded-xl text-white flex items-center justify-between shadow-lg  shadow-primary-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
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
        <ArrowUpRight className="w-6 h-6 opacity-50" />
      </div>
    </Card>
  );
};
