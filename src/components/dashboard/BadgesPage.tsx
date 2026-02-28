import { motion } from "framer-motion";
import { Award, Lock, CheckCircle2, Flame, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBadges } from "@/hooks/useBadges";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

const BadgesPage = () => {
  const { allBadges, earnedIds } = useBadges();
  const { deliveryCount, pointsBalance } = useDashboardData();

  const count = deliveryCount.data ?? 0;
  const badges = allBadges.data ?? [];

  // Calculate streak (simplified — consecutive days with deliveries)
  const streak = Math.min(count, 7); // Placeholder streak based on delivery count

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } };

  if (allBadges.isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48 bg-dashboard-border" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 bg-dashboard-border rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-dashboard-card-foreground flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Badges & Achievements
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Earn badges by completing milestones
        </p>
      </motion.div>

      {/* Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-xl p-4 flex items-center gap-4"
      >
        <motion.div
          className="text-4xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          🔥
        </motion.div>
        <div>
          <p className="text-sm font-semibold text-dashboard-card-foreground">
            {streak} Day Streak
          </p>
          <p className="text-xs text-muted-foreground">
            Keep delivering to maintain your streak!
          </p>
        </div>
        <div className="ml-auto flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                i < streak
                  ? "bg-primary text-primary-foreground"
                  : "bg-dashboard-border text-muted-foreground"
              }`}
            >
              {i < streak ? <Flame className="h-3 w-3" /> : i + 1}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        <Badge className="bg-primary/15 text-primary text-sm py-1 px-3">
          <Award className="h-3.5 w-3.5 mr-1" />
          {earnedIds.size} Earned
        </Badge>
        <Badge variant="secondary" className="text-sm py-1 px-3">
          {badges.length - earnedIds.size} Locked
        </Badge>
        <Badge variant="secondary" className="text-sm py-1 px-3">
          {count} Deliveries
        </Badge>
      </div>

      {/* Badges Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
      >
        {badges.map((badge) => {
          const earned = earnedIds.has(badge.id);
          return (
            <motion.div
              key={badge.id}
              variants={item}
              whileHover={{ scale: 1.03 }}
              className={`relative bg-dashboard-card border rounded-xl p-4 text-center transition-all ${
                earned
                  ? "border-primary/50 shadow-lg shadow-primary/10"
                  : "border-dashboard-border opacity-60"
              }`}
            >
              {/* Earned indicator */}
              {earned && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
              )}
              {!earned && (
                <div className="absolute top-2 right-2">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}

              <motion.div
                className="text-4xl mb-2"
                animate={earned ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
              >
                {badge.icon ?? "🏆"}
              </motion.div>
              <h3 className="text-sm font-semibold text-dashboard-card-foreground mb-1">{badge.name}</h3>
              <p className="text-[10px] text-muted-foreground leading-tight">{badge.description}</p>

              {/* Progress hint */}
              {!earned && badge.condition_type === "delivery_count" && badge.condition_value && (
                <div className="mt-2">
                  <div className="h-1.5 bg-dashboard-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(100, (count / badge.condition_value) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    {count}/{badge.condition_value}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {badges.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No badges available yet</p>
        </div>
      )}
    </div>
  );
};

export default BadgesPage;
