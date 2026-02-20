import { Zap, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/formatters";

interface BalanceHeroProps {
  totalBalance: number;
  activeBucketsCount: number;
}

export const BalanceHero = ({
  totalBalance,
  activeBucketsCount,
}: BalanceHeroProps) => {
  const navigate = useNavigate();

  return (
    <Card
      variant="blue"
      className="relative overflow-hidden group border-none shadow-2xl rounded-xl"
      bodyClassName="px-8 py-12 md:py-12"
    >
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <p className="text-white/60 font-black uppercase tracking-[0.2em] text-[10px] mb-4">
          Total Combined Balance
        </p>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8">
          {formatCurrency(totalBalance).replace("Rp", "Rp ")}
        </h1>
        <div
          onClick={() => navigate("/buckets")}
          className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-white transition-all cursor-pointer group/btn active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold">
            Monitoring {activeBucketsCount} active buckets
          </span>
          <ChevronRight className="w-4 h-4 opacity-30 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
        </div>
      </div>
    </Card>
  );
};
