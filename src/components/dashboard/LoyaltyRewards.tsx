import { motion } from "framer-motion";
import { Coins, Gift, Copy, Clock, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLoyalty } from "@/hooks/useLoyalty";
import { useDashboardData } from "@/hooks/useDashboardData";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const LoyaltyRewards = () => {
  const { pointsLog, coupons, redeemPoints } = useLoyalty();
  const { pointsBalance, freeCredits } = useDashboardData();
  const points = pointsBalance.data ?? 0;
  const credits = freeCredits.data;
  const available = credits ? credits.total_credits - credits.used_credits : 0;

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-xl font-bold font-display text-dashboard-card-foreground">Loyalty & Rewards</h2>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-4 text-center"
        >
          <Coins className="h-6 w-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold font-display text-dashboard-card-foreground">{points}</p>
          <p className="text-xs text-muted-foreground">Loyalty Points</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-4 text-center"
        >
          <Gift className="h-6 w-6 text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-bold font-display text-dashboard-card-foreground">{available}</p>
          <p className="text-xs text-muted-foreground">Free Deliveries</p>
        </motion.div>
      </div>

      {/* Economy Info */}
      <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-semibold text-dashboard-card-foreground">How it works</h3>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>• Earn <strong className="text-primary">2 points</strong> per completed delivery</p>
          <p>• Redeem <strong className="text-secondary">20 points</strong> = 1 free delivery</p>
          <p>• Spin the wheel for bonus points & rewards!</p>
        </div>
      </div>

      {/* Redeem Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            className="w-full gap-2"
            size="lg"
            disabled={points < 20 || redeemPoints.isPending}
          >
            <Gift className="h-4 w-4" />
            {points < 20 ? `Need ${20 - points} more points` : "Redeem 20 pts → Free Delivery"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-dashboard-card border-dashboard-border text-dashboard-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Redeem Points?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Spend 20 loyalty points to get 1 free delivery credit. Your balance: {points} pts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-dashboard-border text-dashboard-card-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => redeemPoints.mutate()}>Redeem</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Active Coupons */}
      {coupons.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-dashboard-card-foreground">Active Coupons</h3>
          {coupons.map((c) => (
            <div
              key={c.id}
              className="bg-dashboard-card border border-dashboard-border rounded-xl p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-mono font-semibold text-primary">{c.code}</p>
                <p className="text-xs text-muted-foreground">
                  {c.discount_type === "percentage" ? `${c.discount_value}% off` : `AED ${c.discount_value} off`}
                  {c.expiry_date && (
                    <span className="ml-1.5">
                      · Expires {format(new Date(c.expiry_date), "MMM d")}
                    </span>
                  )}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => copyCoupon(c.code)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Points History */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-dashboard-card-foreground">Points History</h3>
        {pointsLog.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No points activity yet</p>
        ) : (
          pointsLog.map((log) => (
            <div
              key={log.id}
              className="bg-dashboard-card border border-dashboard-border rounded-xl p-3 flex items-center gap-3"
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${log.amount > 0 ? "bg-green-500/20" : "bg-red-500/20"}`}>
                {log.amount > 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-dashboard-card-foreground truncate">{log.note || log.source}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(log.created_at), "MMM d, h:mm a")}
                </p>
              </div>
              <span className={`text-sm font-semibold ${log.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                {log.amount > 0 ? "+" : ""}{log.amount}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LoyaltyRewards;
