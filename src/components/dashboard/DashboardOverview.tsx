import { motion } from "framer-motion";
import { Package, Coins, Truck, Award, Copy, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDashboardData } from "@/hooks/useDashboardData";
import CountUp from "@/components/CountUp";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const tierColors: Record<string, string> = {
  bronze: "from-tier-bronze to-amber-700",
  silver: "from-tier-silver to-gray-400",
  gold: "from-tier-gold to-yellow-500",
  diamond: "from-tier-diamond to-purple-400",
};

const tierIcons: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  diamond: "💎",
};

const DashboardOverview = () => {
  const { profile, pointsBalance, deliveryCount, userTier, tiers, freeCredits, totalFees } =
    useDashboardData();

  const tierName = userTier.data?.tier_name ?? "Starter";
  const tierBadge = userTier.data?.tier_badge ?? "bronze";
  const count = deliveryCount.data ?? 0;
  const points = pointsBalance.data ?? 0;
  const fees = totalFees.data ?? 0;
  const credits = freeCredits.data;
  const availableCredits = credits ? credits.total_credits - credits.used_credits : 0;

  // Calculate next tier progress
  const allTiers = tiers.data ?? [];
  const currentTierIdx = allTiers.findIndex((t) => t.name === tierName);
  const nextTier = currentTierIdx >= 0 && currentTierIdx < allTiers.length - 1
    ? allTiers[currentTierIdx + 1]
    : null;
  const progressToNext = nextTier
    ? Math.min(100, ((count - allTiers[currentTierIdx].min_deliveries) / (nextTier.min_deliveries - allTiers[currentTierIdx].min_deliveries)) * 100)
    : 100;
  const deliveriesUntilNext = nextTier ? nextTier.min_deliveries - count : 0;

  // Points progress toward free delivery (20 pts = 1 free)
  const pointsProgress = Math.min(100, (points / 20) * 100);

  const copyReferral = () => {
    if (profile.data?.referral_code) {
      navigator.clipboard.writeText(profile.data.referral_code);
      toast.success("Referral code copied!");
    }
  };

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold font-display text-dashboard-card-foreground">
          Welcome back{profile.data?.full_name ? `, ${profile.data.full_name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="text-sm text-muted-foreground">Here's your delivery overview</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Deliveries", value: count, icon: Package, color: "text-primary" },
          { label: "Points", value: points, icon: Coins, color: "text-secondary" },
          { label: "Total Spent", value: fees, icon: Truck, prefix: "AED ", color: "text-primary" },
          { label: "Free Credits", value: availableCredits, icon: Award, color: "text-green-400" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            className="bg-dashboard-card border border-dashboard-border rounded-xl p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold font-display text-dashboard-card-foreground">
              <CountUp end={stat.value} prefix={stat.prefix} duration={1500} />
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Tier & Points Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tier Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dashboard-card border border-dashboard-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-dashboard-card-foreground">Tier Progress</h3>
            <span className={`text-lg bg-gradient-to-r ${tierColors[tierBadge] || tierColors.bronze} bg-clip-text text-transparent font-bold`}>
              {tierIcons[tierBadge]} {tierName}
            </span>
          </div>
          <Progress value={progressToNext} className="h-2.5 mb-2 bg-dashboard-border" />
          <p className="text-xs text-muted-foreground">
            {nextTier
              ? `${deliveriesUntilNext} more deliveries to ${nextTier.name}`
              : "🎉 You've reached the highest tier!"}
          </p>
        </motion.div>

        {/* Points to Free Delivery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-dashboard-card border border-dashboard-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-dashboard-card-foreground">Free Delivery Progress</h3>
            <span className="text-xs text-muted-foreground">{points}/20 pts</span>
          </div>
          <div className="relative mb-2">
            <Progress value={pointsProgress} className="h-2.5 bg-dashboard-border" />
            {/* Walking character */}
            <motion.div
              className="absolute -top-5 text-lg"
              style={{ left: `${Math.min(pointsProgress, 95)}%` }}
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            >
              🚶
            </motion.div>
          </div>
          <p className="text-xs text-muted-foreground">
            {points >= 20
              ? "🎉 You can redeem a free delivery!"
              : `${20 - points} more points needed`}
          </p>
        </motion.div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Referral Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dashboard-card border border-dashboard-border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold text-dashboard-card-foreground mb-2">Refer & Earn</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Share your code and earn bonus points when friends sign up!
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-dashboard-border rounded-lg px-3 py-2 text-sm font-mono text-primary">
              {profile.data?.referral_code || "Loading..."}
            </code>
            <Button size="sm" variant="outline" onClick={copyReferral} className="border-dashboard-border text-dashboard-card-foreground">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Spin Wheel CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 rounded-xl p-4 relative overflow-hidden"
        >
          <motion.div
            className="absolute -right-4 -top-4 text-6xl opacity-20"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          >
            🎡
          </motion.div>
          <h3 className="text-sm font-semibold text-dashboard-card-foreground mb-1">Daily Spin</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Spin the wheel and win points, coupons, or free deliveries!
          </p>
          <Button size="sm" className="gap-1.5" asChild>
            <Link to="/dashboard/spin">
              <Zap className="h-4 w-4" />
              Spin Now
              <ChevronRight className="h-3 w-3" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;
