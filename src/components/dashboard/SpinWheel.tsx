import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Disc3, Zap, Trophy, Clock, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSpinWheel } from "@/hooks/useSpinWheel";
import { fireConfetti, fireCenterBurst } from "@/lib/confetti";
import { format } from "date-fns";

type SpinState = "idle" | "spinning" | "won" | "lost" | "used" | "disabled";

const SpinWheel = () => {
  const [activeType, setActiveType] = useState<"daily" | "weekly">("daily");
  const { slots, spin, canSpin, remaining, maxSpins, history, config } = useSpinWheel(activeType);
  const [state, setState] = useState<SpinState>("idle");
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<{ label: string; icon: string; prize_type: string } | null>(null);
  const wheelRef = useRef<SVGSVGElement>(null);

  const activeSlots = slots.data ?? [];
  const slotCount = activeSlots.length;

  const handleSpin = useCallback(async () => {
    if (!canSpin || state === "spinning") return;
    setState("spinning");
    setPrize(null);

    try {
      const result = await spin.mutateAsync();
      const winSlot = result.slot;
      const winIndex = activeSlots.findIndex((s) => s.id === winSlot.id);

      // Calculate landing angle
      const sliceAngle = 360 / slotCount;
      const targetAngle = 360 - (winIndex * sliceAngle + sliceAngle / 2);
      const spins = 5 + Math.random() * 3; // 5-8 full rotations
      const finalRotation = rotation + spins * 360 + targetAngle;

      setRotation(finalRotation);

      // Wait for animation to complete
      setTimeout(() => {
        if (winSlot.prize_type === "no_prize") {
          setState("lost");
          setPrize({ label: winSlot.label, icon: winSlot.icon ?? "😔", prize_type: "no_prize" });
        } else {
          setState("won");
          setPrize({ label: winSlot.label, icon: winSlot.icon ?? "🎁", prize_type: winSlot.prize_type });
          fireConfetti();
          setTimeout(fireCenterBurst, 500);
        }
      }, 4500);
    } catch {
      setState("idle");
    }
  }, [canSpin, state, spin, activeSlots, slotCount, rotation]);

  const resetWheel = () => {
    setState(canSpin ? "idle" : "used");
    setPrize(null);
  };

  // SVG Wheel rendering
  const renderWheel = () => {
    if (slotCount === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          No slots configured for {activeType} spin
        </div>
      );
    }

    const size = 300;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 10;
    const sliceAngle = (2 * Math.PI) / slotCount;

    return (
      <div className="relative flex items-center justify-center">
        {/* Pointer */}
        <div className="absolute -top-1 z-20 text-3xl drop-shadow-lg" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
          ▼
        </div>

        {/* Outer glow ring */}
        <div className={`absolute inset-0 rounded-full ${state === "spinning" ? "animate-pulse" : ""}`} 
          style={{ 
            background: "radial-gradient(circle, transparent 45%, hsl(24 95% 53% / 0.15) 60%, transparent 70%)",
            width: size + 40, height: size + 40, 
            left: "50%", top: "50%", 
            transform: "translate(-50%, -50%)" 
          }} 
        />

        <svg
          ref={wheelRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="drop-shadow-2xl"
        >
          <motion.g
            animate={{ rotate: rotation }}
            transition={{ duration: 4.5, ease: [0.17, 0.67, 0.12, 0.99] }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            {activeSlots.map((slot, i) => {
              const startAngle = i * sliceAngle - Math.PI / 2;
              const endAngle = startAngle + sliceAngle;
              const x1 = cx + r * Math.cos(startAngle);
              const y1 = cy + r * Math.sin(startAngle);
              const x2 = cx + r * Math.cos(endAngle);
              const y2 = cy + r * Math.sin(endAngle);
              const largeArc = sliceAngle > Math.PI ? 1 : 0;
              const midAngle = startAngle + sliceAngle / 2;
              const labelR = r * 0.65;
              const lx = cx + labelR * Math.cos(midAngle);
              const ly = cy + labelR * Math.sin(midAngle);
              const iconR = r * 0.4;
              const ix = cx + iconR * Math.cos(midAngle);
              const iy = cy + iconR * Math.sin(midAngle);

              return (
                <g key={slot.id}>
                  <path
                    d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
                    fill={slot.color ?? "#FF6B35"}
                    stroke="hsl(222 47% 6%)"
                    strokeWidth="2"
                  />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    transform={`rotate(${(midAngle * 180) / Math.PI + 90}, ${lx}, ${ly})`}
                    className="select-none"
                  >
                    {slot.label.length > 10 ? slot.label.slice(0, 10) + "…" : slot.label}
                  </text>
                  <text
                    x={ix}
                    y={iy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="18"
                    transform={`rotate(${(midAngle * 180) / Math.PI + 90}, ${ix}, ${iy})`}
                    className="select-none"
                  >
                    {slot.icon}
                  </text>
                </g>
              );
            })}
            {/* Center circle */}
            <circle cx={cx} cy={cy} r={20} fill="hsl(222 47% 6%)" stroke="hsl(24 95% 53%)" strokeWidth="3" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="12" fontWeight="bold">
              GO
            </text>
          </motion.g>
        </svg>
      </div>
    );
  };

  const isEnabled = config.data?.enabled ?? true;
  const effectiveState: SpinState = !isEnabled ? "disabled" : !canSpin && state === "idle" ? "used" : state;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-dashboard-card-foreground flex items-center gap-2">
          <Disc3 className="h-6 w-6 text-primary" />
          Spin & Win
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Try your luck and win amazing prizes!</p>
      </motion.div>

      {/* Type Toggle */}
      <div className="flex gap-2">
        {(["daily", "weekly"] as const).map((type) => (
          <Button
            key={type}
            variant={activeType === type ? "default" : "outline"}
            size="sm"
            onClick={() => { setActiveType(type); setState("idle"); setPrize(null); }}
            className={activeType !== type ? "border-dashboard-border text-muted-foreground" : ""}
          >
            {type === "daily" ? "🎯 Daily" : "⭐ Weekly Mega"}
          </Button>
        ))}
      </div>

      {/* Wheel Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dashboard-card border border-dashboard-border rounded-2xl p-6 flex flex-col items-center gap-6"
      >
        {renderWheel()}

        {/* Spins remaining */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {remaining}/{maxSpins} spins remaining
          </span>
        </div>

        {/* Spin Button */}
        <Button
          size="lg"
          disabled={effectiveState !== "idle" || spin.isPending}
          onClick={handleSpin}
          className="gap-2 text-base px-8 btn-glow"
        >
          <Zap className="h-5 w-5" />
          {effectiveState === "spinning" ? "Spinning…" :
            effectiveState === "used" ? "No spins left" :
            effectiveState === "disabled" ? "Disabled" : "SPIN!"}
        </Button>
      </motion.div>

      {/* Result Modal */}
      <AnimatePresence>
        {(effectiveState === "won" || effectiveState === "lost") && prize && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={resetWheel}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-dashboard-card border border-dashboard-border rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-6xl"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
              >
                {prize.prize_type === "no_prize" ? "😔" : prize.icon}
              </motion.div>
              <h2 className="text-xl font-bold font-display text-dashboard-card-foreground">
                {prize.prize_type === "no_prize" ? "Better luck next time!" : "🎉 You Won!"}
              </h2>
              <p className="text-muted-foreground">{prize.label}</p>
              {prize.prize_type === "no_prize" ? null : (
                <Badge className="bg-primary/20 text-primary">{prize.prize_type.replace(/_/g, " ")}</Badge>
              )}
              <Button onClick={resetWheel} className="w-full mt-4">
                {canSpin ? "Spin Again" : "Close"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spin History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dashboard-card border border-dashboard-border rounded-xl p-4"
      >
        <h3 className="text-sm font-semibold text-dashboard-card-foreground flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-primary" />
          Recent Spins
        </h3>
        {(history.data ?? []).length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No spins yet. Give it a try!</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(history.data ?? []).map((h) => (
              <div key={h.id} className="flex items-center justify-between p-2 rounded-lg bg-dashboard-bg border border-dashboard-border">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{h.spin_type}</Badge>
                  <span className="text-sm text-dashboard-card-foreground">
                    {h.prize_type === "no_prize" ? "No prize" : `${h.prize_type.replace(/_/g, " ")} ${h.prize_value ? `· ${h.prize_value}` : ""}`}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">{format(new Date(h.created_at), "MMM d, HH:mm")}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SpinWheel;
