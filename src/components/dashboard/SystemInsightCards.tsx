import { Calendar, ShieldCheck } from "lucide-react";
import { Card } from "../common/Card";

interface InsightsData {
  dailySafeSpend: number;
  daysToPayday: number;
  monthsBuffer: number;
  salaryBank: string | null;
}

interface ProfileData {
  salaryDay?: number;
}

interface SystemInsightCardsProps {
  insights: InsightsData;
  profile?: ProfileData;
}

export const SystemInsightCards = ({
  insights,
  profile,
}: SystemInsightCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1 flex flex-col justify-center px-2">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
          System Insights
        </h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
          Real-time financial guidance
        </p>
      </div>

      <Card
        className="group hover:border-primary-200/50 transition-all duration-300"
        bodyClassName="p-4 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center text-primary-500 border border-primary-100 dark:border-primary-900/20 shrink-0 shadow-sm transition-transform group-hover:scale-110">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 truncate">
            next Payday
          </p>
          <p className="text-md font-black text-gray-900 dark:text-white leading-none truncate">
            {insights.daysToPayday} Days Left
          </p>
          <p className="text-[9px] font-bold text-primary-500 uppercase mt-1.5 flex items-center gap-1 truncate w-full">
            <span className="w-1 h-1 bg-primary-500 rounded-full shrink-0"></span>
            <span className="truncate">{insights.salaryBank ? `${insights.salaryBank} • ` : ''}{profile?.salaryDay ? `Day ${profile.salaryDay}` : "Schedule"}</span>
          </p>
        </div>
      </Card>

      <Card
        className="group hover:border-green-200/50 transition-all duration-300"
        bodyClassName="p-4 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/10 flex items-center justify-center text-green-500 border border-green-100 dark:border-green-900/20 shrink-0 shadow-sm transition-transform group-hover:scale-110">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 truncate">
            Buffer Health
          </p>
          <p className="text-md font-black text-gray-900 dark:text-white leading-none">
            {insights.monthsBuffer.toFixed(1)} Months
          </p>
          <p className="text-[9px] font-bold text-green-600 uppercase mt-1.5 flex items-center gap-1">
            <span className="w-1 h-1 bg-green-600 rounded-full shrink-0"></span>
            Coverage
          </p>
        </div>
      </Card>
    </div>
  );
};
