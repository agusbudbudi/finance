import { Clock } from "lucide-react";
import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/formatters";
import { useNavigate } from "react-router-dom";

interface RecurringItem {
  id: string;
  name: string;
  dueDay: number;
  category: string;
  amount: number;
}

interface UpcomingBillsListProps {
  unpostedRecurring: RecurringItem[];
}

export const UpcomingBillsList = ({
  unpostedRecurring,
}: UpcomingBillsListProps) => {
  const navigate = useNavigate();

  return (
    <Card title="Upcoming Bills" className="lg:col-span-1">
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Pending Post
        </h4>
        {unpostedRecurring.length > 0 ? (
          unpostedRecurring.slice(0, 5).map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-3 md:p-4 -mx-1 md:-mx-2 rounded-xl transition-all"
              onClick={() => navigate("/recurring")}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white truncate max-w-[120px]">
                    {sub.name}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Day {sub.dueDay} • {sub.category}
                  </p>
                </div>
              </div>
              <p className="font-black text-sm text-gray-900 dark:text-white">
                {formatCurrency(sub.amount)}
              </p>
            </div>
          ))
        ) : (
          <div className="py-6 text-center">
            <p className="text-xs text-gray-400 font-medium italic">
              No pending recurring payments
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
