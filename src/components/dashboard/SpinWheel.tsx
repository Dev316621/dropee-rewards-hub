import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Disc3, Zap, Trophy, Clock, History, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSpinWheel } from "@/hooks/useSpinWheel";
import { fireConfetti, fireCenterBurst } from "@/lib/confetti";
import { format } from "date-fns";

type SpinState = "idle" | "spinning" | "won" | "lost" | "used" | "disabled";

// Generate gradient pairs from a base color
const getGradientPair = (color: string) => {
  return [color, `${color}cc`]; // base + slightly transparent
};

const SPIN_DURATION = 7000; // 7s spin

const SpinWheel = () => {
  const [activeType, setActiveType] = useState<"daily" | "weekly">("daily");
  const { slots, spin, canSpin, remaining, maxSpins, history, config } = useSpinWheel(activeType);
  const [state, setState] = useState<SpinState>("idle");
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<{ label: string; icon: string; prize_type: string } | null>(null);
  const [winIndex, setWinIndex] = useState<number | null>(null);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const wheelRef = useRef<SVGSVGElement>(null);

  const activeSlots = slots.data ?? [];
  const slotCount = activeSlots.length;

  // Particle generation during spin
  useEffect(() => {
    if (state !== "spinning") { setParticles([]); return; }
    const interval = setInterval(() => {
      const colors = activeSlots.map(s => s.color || "#FF6B35");
      setParticles(prev => {
        const next = [...prev, {
          id: Date.now() + Math.random(),
          x: Math.random() * 100,
          y: 100 + Math.random() * 20,
          color: colors[Math.floor(Math.random() * colors.length)],
        }].slice(-20);
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [state, activeSlots]);

  const handleSpin = useCallback(async () => {
    if (!canSpin || state === "spinning") return;
    setState("spinning");
    setPrize(null);
    setWinIndex(null);

    try {
      const result = await spin.mutateAsync();
      const winSlot = result.slot;
      const idx = activeSlots.findIndex((s) => s.id === winSlot.id);

      const sliceAngle = 360 / slotCount;
      const targetAngle = 360 - (idx * sliceAngle + sliceAngle / 2);
      const spins = 8 + Math.floor(Math.random() * 6); // 8-13 rotations
      const finalRotation = rotation + spins * 360 + targetAngle;

      setRotation(finalRotation);

      setTimeout(() => {
        setWinIndex(idx);
        if (winSlot.prize_type === "no_prize") {
          setState("lost");
          setPrize({ label: winSlot.label, icon: winSlot.icon ?? "😔", prize_type: "no_prize" });
        } else {
          setState("won");
          setPrize({ label: winSlot.label, icon: winSlot.icon ?? "🎁", prize_type: winSlot.prize_type });
          setTimeout(() => { fireConfetti(); setTimeout(fireCenterBurst, 300); }, 500);
        }
      }, SPIN_DURATION + 500);
    } catch {
      setState("idle");
    }
  }, [canSpin, state, spin, activeSlots, slotCount, rotation]);

  const resetWheel = () => {
    setState(canSpin ? "idle" : "used");
    setPrize(null);
    setWinIndex(null);
  };

  const renderWheel = () => {
    if (slotCount === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          No slots configured for {activeType} spin
        </div>
      );
    }

    const size = 320;
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 5;
    const r = outerR - 12;
    const sliceAngle = (2 * Math.PI) / slotCount;
    const gemCount = 24;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size + 40, height: size + 60 }}>
        {/* Particles */}
        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0.8, x: `${p.x}%`, y: `${p.y}%`, scale: 0.5 }}
              animate={{ opacity: 0, y: "-20%", scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute w-3 h-3 rounded-full pointer-events-none"
              style={{ backgroundColor: p.color, filter: `blur(1px)`, left: 0, top: 0 }}
            />
          ))}
        </AnimatePresence>

        {/* Pulsing glow backdrop */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size + 60, height: size + 60,
            background: "radial-gradient(circle, hsl(45 100% 50% / 0.12) 0%, transparent 70%)",
          }}
          animate={state === "spinning" ? { scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] } : { scale: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Gold needle with sway */}
        <motion.div
          className="absolute z-30"
          style={{ transformOrigin: "50% 100%", top: -2, left: "50%", transform: "translateX(-50%)" }}
          animate={
            state === "spinning"
              ? { rotateZ: [0, -8, 8, -5, 5, 0], transition: { duration: 0.15, repeat: Infinity } }
              : { rotateZ: [0, -3, 3, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } }
          }
        >
          {/* Glowing circle */}
          <div className="w-5 h-5 rounded-full mx-auto mb-[-2px] z-10 relative"
            style={{ background: "radial-gradient(circle, #FFD700, #B8860B)", boxShadow: "0 0 12px #FFD700aa" }} />
          {/* Triangle */}
          <div style={{
            width: 0, height: 0,
            borderLeft: "10px solid transparent", borderRight: "10px solid transparent",
            borderTop: "20px solid #FFD700",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
            margin: "0 auto",
          }} />
        </motion.div>

        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-2xl">
          <defs>
            {activeSlots.map((slot, i) => {
              const [c1, c2] = getGradientPair(slot.color ?? "#FF6B35");
              return (
                <linearGradient key={`grad-${i}`} id={`seg-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={c1} />
                  <stop offset="100%" stopColor={c2} />
                </linearGradient>
              );
            })}
            <radialGradient id="gold-ring-grad">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#DAA520" />
              <stop offset="100%" stopColor="#B8860B" />
            </radialGradient>
            <radialGradient id="center-grad">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="60%" stopColor="#DAA520" />
              <stop offset="100%" stopColor="#8B7355" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Gold outer ring */}
          <circle cx={cx} cy={cy} r={outerR} fill="url(#gold-ring-grad)" filter="url(#glow)" />
          {/* Gem dots around ring */}
          {Array.from({ length: gemCount }).map((_, i) => {
            const angle = (i / gemCount) * Math.PI * 2 - Math.PI / 2;
            const gx = cx + (outerR - 6) * Math.cos(angle);
            const gy = cy + (outerR - 6) * Math.sin(angle);
            return <circle key={`gem-${i}`} cx={gx} cy={gy} r={2} fill={i % 2 === 0 ? "#FFF8DC" : "#FFD700"} opacity={0.9} />;
          })}

          {/* Inner dark ring */}
          <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke="hsl(222 47% 8%)" strokeWidth="3" />

          <motion.g
            animate={{ rotate: rotation }}
            transition={{
              duration: SPIN_DURATION / 1000,
              ease: [0.15, 0.6, 0.08, 1.02], // cubic-bezier with slight bounce
            }}
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
              const labelR = r * 0.7;
              const lx = cx + labelR * Math.cos(midAngle);
              const ly = cy + labelR * Math.sin(midAngle);
              const descR = r * 0.52;
              const dx = cx + descR * Math.cos(midAngle);
              const dy = cy + descR * Math.sin(midAngle);
              const iconR = r * 0.38;
              const ix = cx + iconR * Math.cos(midAngle);
              const iy = cy + iconR * Math.sin(midAngle);
              const rotDeg = (midAngle * 180) / Math.PI + 90;

              return (
                <g key={slot.id}>
                  <path
                    d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
                    fill={`url(#seg-grad-${i})`}
                    stroke="hsl(222 47% 10%)"
                    strokeWidth="1.5"
                  />
                  {/* Bold prize label */}
                  <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="white"
                    fontSize={slotCount > 8 ? "8" : "10"} fontWeight="800" letterSpacing="0.5"
                    transform={`rotate(${rotDeg}, ${lx}, ${ly})`} className="select-none"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                    {slot.label.length > 12 ? slot.label.slice(0, 12) + "…" : slot.label}
                  </text>
                  {/* Short description */}
                  <text x={dx} y={dy} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.7)"
                    fontSize={slotCount > 8 ? "6" : "7"}
                    transform={`rotate(${rotDeg}, ${dx}, ${dy})`} className="select-none">
                    {slot.prize_type.replace(/_/g, " ")}
                  </text>
                  {/* Icon */}
                  <text x={ix} y={iy} textAnchor="middle" dominantBaseline="middle" fontSize="16"
                    transform={`rotate(${rotDeg}, ${ix}, ${iy})`} className="select-none">
                    {slot.icon}
                  </text>
                </g>
              );
            })}

            {/* Glowing gold center hub */}
            <circle cx={cx} cy={cy} r={22} fill="url(#center-grad)" filter="url(#glow)" />
            <circle cx={cx} cy={cy} r={18} fill="url(#center-grad)" stroke="#FFD700" strokeWidth="2" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#4a3600" fontSize="14" fontWeight="bold">
              ★
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
            onClick={() => { setActiveType(type); setState("idle"); setPrize(null); setWinIndex(null); }}
            className={activeType !== type ? "border-dashboard-border text-muted-foreground" : ""}
          >
            {type === "daily" ? "🎯 Daily Draw" : "⭐ Mega Draw"}
          </Button>
        ))}
      </div>

      {/* Wheel Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dashboard-card border border-dashboard-border rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-6"
      >
        {renderWheel()}

        {/* Spins remaining */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{remaining}/{maxSpins} spins remaining</span>
        </div>

        {/* Spin Button */}
        <Button
          size="lg"
          disabled={effectiveState !== "idle" || spin.isPending}
          onClick={handleSpin}
          className="gap-2 text-base px-10 py-3 btn-glow"
          style={effectiveState === "idle" ? { background: "linear-gradient(135deg, hsl(var(--primary)), hsl(24 95% 53%))", boxShadow: "0 0 20px hsl(var(--primary) / 0.4)" } : {}}
        >
          <Zap className="h-5 w-5" />
          {effectiveState === "spinning" ? "Spinning…" :
            effectiveState === "used" ? "No spins left" :
            effectiveState === "disabled" ? "Disabled" : "SPIN!"}
        </Button>

        {/* Prize pills */}
        {activeSlots.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {activeSlots.map((slot, i) => (
              <motion.div
                key={slot.id}
                animate={winIndex === i ? { scale: [1, 1.1, 1], boxShadow: [`0 0 0px ${slot.color}`, `0 0 16px ${slot.color}`, `0 0 8px ${slot.color}`] } : {}}
                transition={{ duration: 0.8, repeat: winIndex === i ? Infinity : 0 }}
                className="px-3 py-1 rounded-full text-xs font-medium text-white border"
                style={{
                  backgroundColor: `${slot.color}33`,
                  borderColor: slot.color ?? "hsl(var(--border))",
                  color: slot.color ?? "hsl(var(--foreground))",
                }}
              >
                {slot.icon} {slot.label}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Result Modal */}
      <AnimatePresence>
        {(effectiveState === "won" || effectiveState === "lost") && prize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={resetWheel}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              className="bg-dashboard-card border border-dashboard-border rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-7xl"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {prize.prize_type === "no_prize" ? "😔" : "🎉"}
              </motion.div>
              <h2 className="text-2xl font-bold font-display text-dashboard-card-foreground">
                {prize.prize_type === "no_prize" ? "Better luck next time!" : "You Won!"}
              </h2>
              <div className="flex items-center justify-center gap-2 text-lg">
                <span>{prize.icon}</span>
                <span className="text-foreground font-semibold">{prize.label}</span>
              </div>
              {prize.prize_type !== "no_prize" && (
                <Badge className="bg-primary/20 text-primary text-sm">{prize.prize_type.replace(/_/g, " ")}</Badge>
              )}
              <Button onClick={resetWheel} className="w-full mt-4 h-11" size="lg">
                {canSpin ? "Spin Again!" : "Close"}
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
