// Push notification utility for delivery updates
export const requestPushPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) return false;
  const result = await Notification.requestPermission();
  return result === "granted";
};

export const sendLocalNotification = (title: string, body: string, tag?: string) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  new Notification(title, {
    body,
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    tag: tag || "dropee-notification",
    vibrate: [200, 100, 200],
  });
};

export const notifyDeliveryUpdate = (status: string, deliveryId: string) => {
  const messages: Record<string, string> = {
    pending: "Your delivery request has been received!",
    picked_up: "Your package has been picked up! 📦",
    in_transit: "Your delivery is on the way! 🚚",
    delivered: "Your delivery has arrived! ✅",
    cancelled: "Your delivery has been cancelled.",
  };

  const body = messages[status] || `Delivery status updated to: ${status}`;
  sendLocalNotification("DROPEE Delivery Update", body, `delivery-${deliveryId}`);
};

export const notifyReward = (message: string) => {
  sendLocalNotification("DROPEE Rewards 🎉", message, "reward");
};

export const notifySpinAvailable = () => {
  sendLocalNotification(
    "Spin the Wheel! 🎡",
    "You have a spin available — try your luck for free deliveries!",
    "spin"
  );
};
