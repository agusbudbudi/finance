import { Zap, ChevronRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/formatters";

interface BalanceHeroProps {
  totalBalance: number;
  activeBucketsCount: number;
  dailySafeSpend: number;
}

export const BalanceHero = ({
  totalBalance,
  activeBucketsCount,
  dailySafeSpend,
}: BalanceHeroProps) => {
  const navigate = useNavigate();

  return (
    <Card
      variant="blue"
      className="relative overflow-hidden group border-none shadow-2xl rounded-xl"
      bodyClassName="px-8 py-8 md:py-12"
    >
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <p className="text-white/60 font-black uppercase tracking-[0.2em] text-[10px] mb-4">
          Total Combined Balance
        </p>
        <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight mb-6">
          {formatCurrency(totalBalance).replace("Rp", "Rp ")}
        </h1>
        
        {/* Safe to Spend Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-full border border-green-500/30 backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-sm font-black tracking-wide">
            SAFE TO SPEND TODAY: {formatCurrency(dailySafeSpend)}
          </span>
        </div>

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
