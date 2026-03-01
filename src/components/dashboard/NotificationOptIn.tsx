import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const NotificationOptIn = () => {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (!("Notification" in window)) return;
    setPermission(Notification.permission);
    const dismissed = localStorage.getItem("notif-opt-in-dismissed");
    if (Notification.permission === "default" && !dismissed) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      new Notification("DROPEE 🚀", { body: "You'll now receive delivery updates and reward alerts!" });
    }
    setShow(false);
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("notif-opt-in-dismissed", "true");
  };

  if (permission !== "default") return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 sm:bottom-6 right-4 left-4 sm:left-auto sm:w-80 z-50 bg-dashboard-card border border-dashboard-border rounded-xl p-4 shadow-xl"
        >
          <button onClick={dismiss} className="absolute top-2 right-2 p-1 rounded-lg hover:bg-dashboard-border">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-dashboard-card-foreground mb-1">Enable Notifications</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Get alerts for deliveries, rewards, and spin wheel availability.
              </p>
              <Button size="sm" onClick={requestPermission} className="text-xs h-8">
                Enable Notifications
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationOptIn;
