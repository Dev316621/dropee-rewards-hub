import confetti from "canvas-confetti";

export const fireConfetti = () => {
  const duration = 2000;
  const end = Date.now() + duration;
  const colors = ["#FF6B35", "#0EA5E9", "#FFD700", "#A855F7"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};

export const fireCenterBurst = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#FF6B35", "#0EA5E9", "#FFD700", "#A855F7", "#10B981"],
  });
};
