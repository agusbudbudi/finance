import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useExpenseStore } from "../../stores/useExpenseStore";
import { useFreelanceStore } from "../../stores/useFreelanceStore";
import { Modal } from "../common/Modal";

interface DayData {
  date: Date;
  expenses: any[];
  incomes: any[];
  totalExpense: number;
  totalIncome: number;
}

const formatCompactIDR = (amount: number) => {
  if (amount === 0) return "";
  if (amount >= 1000000) {
    const jt = amount / 1000000;
    return jt % 1 === 0 ? `${jt}jt` : `${jt.toFixed(1).replace(".", ",")}jt`;
  }
  if (amount >= 1000) {
    return `${Math.floor(amount / 1000)}rb`;
  }
  return amount.toString();
};

export const CalendarOverview = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { expenses } = useExpenseStore();
  const { incomes } = useFreelanceStore();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = getDay(monthStart);
  const paddingDays = Array.from({ length: startDay }, (_, i) => null);

  const getDayData = (date: Date): DayData => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const dayExpenses = expenses.filter(e => e.date === formattedDate);
    const dayIncomes = incomes.filter(i => i.date === formattedDate);

    return {
      date,
      expenses: dayExpenses,
      incomes: dayIncomes,
      totalExpense: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
      totalIncome: dayIncomes.reduce((sum, i) => sum + i.amount, 0),
    };
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  const allActivities = [
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
    ...incomes.map(i => ({ ...i, type: 'income' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastActivities = allActivities.slice(0, 3);

  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Activity</h2>
          <p className="text-xs text-gray-500 font-medium">{format(currentDate, "MMMM yyyy")}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1">
        {dayNames.map((day, i) => (
          <div key={`name-${i}`} className="text-center text-[10px] font-bold text-gray-400 uppercase mb-1">
            {day}
          </div>
        ))}

        {paddingDays.map((_, i) => (
          <div key={`padding-${i}`} className="aspect-square" />
        ))}

        {daysInMonth.map(date => {
          const data = getDayData(date);
          const isToday = isSameDay(date, new Date());
          
          return (
            <div
              key={date.toString()}
              onClick={() => setSelectedDate(date)}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all relative
                ${isToday 
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }
              `}
            >
              <span className={`text-[11px] font-bold ${isToday ? "text-white" : "text-gray-600 dark:text-gray-400"}`}>
                {format(date, "d")}
              </span>

              <div className="mt-0.5 flex flex-col items-center gap-1">
                {data.totalIncome > 0 && (
                  <span className={`text-[8px] font-bold leading-none ${isToday ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`}>
                    +{formatCompactIDR(data.totalIncome)}
                  </span>
                )}
                {data.totalExpense > 0 && (
                  <span className={`text-[8px] font-bold leading-none ${isToday ? "text-white/80" : "text-rose-600 dark:text-rose-400"}`}>
                    -{formatCompactIDR(data.totalExpense)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Recent Activity</h3>
          <button 
            onClick={() => setIsViewAllOpen(true)}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Lihat Semua
          </button>
        </div>
        
        <div className="space-y-2">
          {lastActivities.map((activity: any) => (
            <div 
              key={activity.id} 
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer group"
              onClick={() => setSelectedDate(new Date(activity.date))}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activity.type === 'income' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                }`}>
                  {activity.type === 'income' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{activity.note || activity.client || activity.category}</p>
                  <p className="text-[10px] text-gray-500">{format(new Date(activity.date), "dd MMM")}</p>
                </div>
              </div>
              <p className={`text-xs font-bold ${
                activity.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {activity.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(activity.amount).replace('IDR', '')}
              </p>
            </div>
          ))}
          {lastActivities.length === 0 && (
            <p className="text-center py-4 text-xs text-gray-500 font-medium">No recent activity</p>
          )}
        </div>
      </div>

      {selectedDate && (
        <DailyTransactionPreview 
          date={selectedDate} 
          onClose={() => setSelectedDate(null)} 
          data={getDayData(selectedDate)}
        />
      )}

      {isViewAllOpen && (
        <ViewAllActivitiesModal 
          activities={allActivities} 
          onClose={() => setIsViewAllOpen(false)} 
        />
      )}
    </div>
  );
};

interface DailyPreviewProps {
  date: Date;
  onClose: () => void;
  data: DayData;
}

interface ViewAllProps {
  activities: any[];
  onClose: () => void;
}

const DailyTransactionPreview = ({ date, onClose, data }: DailyPreviewProps) => {
  return (
    <Modal isOpen={true} onClose={onClose} title={format(date, "EEEE, d MMMM")} maxW="md:max-w-md">
      <div className="space-y-6">
        {/* Income Section */}
        {data.incomes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
              <h4 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-widest">Income</h4>
            </div>
            <div className="space-y-3">
              {data.incomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{income.client || income.project || income.category}</p>
                    <p className="text-xs text-gray-500">{income.category}</p>
                  </div>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(income.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expense Section */}
        {data.expenses.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowDownCircle className="w-5 h-5 text-rose-500" />
              <h4 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-widest">Expenses</h4>
            </div>
            <div className="space-y-3">
              {data.expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{expense.note || expense.category}</p>
                    <p className="text-xs text-gray-500">{expense.category}</p>
                  </div>
                  <p className="font-bold text-rose-600 dark:text-rose-400">
                    -{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(expense.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.incomes.length === 0 && data.expenses.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 font-medium">No transactions on this day</p>
          </div>
        )}

        {/* Totals Footer */}
        {(data.totalIncome > 0 || data.totalExpense > 0) && (
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center flex-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Total Income</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.totalIncome)}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
            <div className="text-center flex-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Total Expense</p>
              <p className="font-bold text-rose-600 dark:text-rose-400">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.totalExpense)}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
const ViewAllActivitiesModal = ({ activities, onClose }: ViewAllProps) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="All Recent Activity" maxW="md:max-w-lg">
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              activity.type === 'income'
              ? 'bg-emerald-50/50 dark:bg-emerald-900/5 border-emerald-100/50 dark:border-emerald-900/20'
              : 'bg-rose-50/50 dark:bg-rose-900/5 border-rose-100/50 dark:border-rose-900/20'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activity.type === 'income'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
              }`}>
                {activity.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{activity.note || activity.client || activity.category}</p>
                <p className="text-xs text-gray-500 font-medium">{format(new Date(activity.date), "EEEE, dd MMMM yyyy")}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{activity.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold text-lg ${
                activity.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {activity.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(activity.amount)}
              </p>
              <p className="text-[10px] text-gray-400 capitalize">{activity.accountType || 'local'}</p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 font-medium">No activity recorded yet</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
