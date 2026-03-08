import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share, Smartphone, CheckCircle, ArrowLeft, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>("default");

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const enableNotifications = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    if (result === "granted") {
      new Notification("DROPEE 🚀", {
        body: "You'll now receive delivery updates and reward alerts!",
        icon: "/pwa-192x192.png",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-8"
      >
        {/* Header */}
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Install DROPEE</h1>
          <p className="text-muted-foreground">
            Get the full app experience — fast, offline-ready, and always one tap away.
          </p>
        </div>

        {/* Install Section */}
        {isInstalled ? (
          <div className="bg-primary/10 rounded-xl p-6 space-y-3">
            <CheckCircle className="w-12 h-12 text-primary mx-auto" />
            <p className="font-semibold text-foreground">DROPEE is installed!</p>
            <p className="text-sm text-muted-foreground">Open it from your home screen.</p>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} size="lg" className="w-full gap-2 text-lg py-6">
            <Download className="w-5 h-5" />
            Install DROPEE
          </Button>
        ) : isIOS ? (
          <div className="bg-muted rounded-xl p-6 space-y-4 text-left">
            <p className="font-semibold text-foreground text-center">Install on iPhone / iPad</p>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3 items-start">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Tap the <Share className="inline w-4 h-4 -mt-0.5" /> <strong>Share</strong> button in Safari</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Tap <strong>"Add"</strong> to confirm</span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="bg-muted rounded-xl p-6 space-y-4 text-left">
            <p className="font-semibold text-foreground text-center">Install on Android</p>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3 items-start">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Tap the <strong>⋮ menu</strong> in your browser</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Tap <strong>"Install"</strong> to confirm</span>
              </li>
            </ol>
          </div>
        )}

        {/* Push Notifications Section */}
        <div className="bg-muted rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <p className="font-semibold text-foreground">Push Notifications</p>
          </div>
          {notifPermission === "granted" ? (
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <CheckCircle className="w-4 h-4" />
              <span>Notifications enabled — you'll get delivery updates!</span>
            </div>
          ) : notifPermission === "denied" ? (
            <p className="text-sm text-muted-foreground">
              Notifications are blocked. Enable them in your browser settings to get delivery updates.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Get real-time alerts for delivery status, rewards, and spin wheel availability.
              </p>
              <Button onClick={enableNotifications} variant="outline" className="w-full gap-2">
                <Bell className="w-4 h-4" />
                Enable Notifications
              </Button>
            </>
          )}
        </div>

        {/* Why install */}
        <div className="space-y-2 pt-4">
          <h3 className="font-semibold text-foreground">Why install?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>⚡ Loads instantly, even offline</li>
            <li>🏠 One-tap access from home screen</li>
            <li>🔔 Real-time delivery notifications</li>
            <li>📦 Track deliveries on the go</li>
          </ul>
        </div>

        <Link to="/">
          <Button variant="ghost" className="text-muted-foreground gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default Install;
