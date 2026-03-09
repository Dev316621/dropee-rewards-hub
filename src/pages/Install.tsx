import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, CheckCircle, ArrowLeft, Bell, ExternalLink, Chrome } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Install = () => {
  const [notifPermission, setNotifPermission] = useState<string>(
    "Notification" in window ? Notification.permission : "denied"
  );

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

  const APK_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/public-assets/DROPEE.apk`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center">
            <img src="/pwa-512x512.png" alt="DROPEE" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Get DROPEE</h1>
            <p className="text-muted-foreground mt-1">
              Download the app for the fastest delivery experience in Ukhrul.
            </p>
          </div>
        </div>

        {/* Download APK */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Download for Android</h2>
              <p className="text-xs text-muted-foreground">APK • v1.0 • ~3 MB</p>
            </div>
          </div>

          {APK_URL ? (
            <a href={APK_URL} download>
              <Button size="lg" className="w-full gap-2 text-base py-6">
                <Download className="w-5 h-5" />
                Download APK
              </Button>
            </a>
          ) : (
            <div className="space-y-3">
              <Button size="lg" className="w-full gap-2 text-base py-6" disabled>
                <Download className="w-5 h-5" />
                APK Coming Soon
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                The Android APK is being prepared. Check back shortly!
              </p>
            </div>
          )}
        </div>

        {/* Alternative: Use in browser */}
        <div className="bg-muted/50 border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Chrome className="w-5 h-5 text-muted-foreground shrink-0" />
            <div>
              <h3 className="font-medium text-foreground text-sm">Use in Browser</h3>
              <p className="text-xs text-muted-foreground">
                Don't want to download? Use DROPEE directly at{" "}
                <a href="https://dropee.discoverukhrul.site" className="text-primary underline">dropee.discoverukhrul.site</a>
              </p>
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-medium text-foreground text-sm">Push Notifications</h3>
          </div>
          {notifPermission === "granted" ? (
            <div className="flex items-center gap-2 text-sm text-primary px-1">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Enabled — you'll get delivery updates!</span>
            </div>
          ) : notifPermission === "denied" ? (
            <p className="text-xs text-muted-foreground px-1">
              Notifications are blocked. Enable them in your browser/device settings.
            </p>
          ) : (
            <Button onClick={enableNotifications} variant="outline" size="sm" className="w-full gap-2">
              <Bell className="w-4 h-4" />
              Enable Notifications
            </Button>
          )}
        </div>

        {/* App info */}
        <div className="space-y-3 px-1">
          <h3 className="font-semibold text-foreground text-sm">What you get</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex gap-2 items-start">
              <span className="text-primary mt-0.5">⚡</span>
              <span>Native Android app experience — fast & smooth</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-primary mt-0.5">🔔</span>
              <span>Real-time delivery status notifications</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-primary mt-0.5">🏠</span>
              <span>Home screen icon — one tap to open</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-primary mt-0.5">🎡</span>
              <span>Spin the wheel for rewards & free deliveries</span>
            </li>
          </ul>
        </div>

        {/* Back */}
        <div className="text-center">
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Install;
