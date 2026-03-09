import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  amount: number; // in rupees
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
  prefill?: { name?: string; email?: string; contact?: string };
  description?: string;
  onSuccess: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  onError?: (error: any) => void;
}

const loadScript = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const useRazorpay = () => {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    loadScript("https://checkout.razorpay.com/v1/checkout.js").then((ok) => {
      scriptLoaded.current = ok;
    });
  }, []);

  const pay = useCallback(async (options: RazorpayOptions) => {
    if (!scriptLoaded.current) {
      const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!ok) {
        toast.error("Failed to load payment gateway");
        return;
      }
      scriptLoaded.current = true;
    }

    try {
      // Create order via edge function
      const { data, error } = await supabase.functions.invoke("razorpay-create-order", {
        body: {
          amount: Math.round(options.amount * 100), // convert rupees to paise
          currency: options.currency || "INR",
          receipt: options.receipt,
          notes: options.notes,
        },
      });

      if (error || !data?.order_id) {
        toast.error(data?.error || "Failed to create payment order");
        options.onError?.(error || data);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,
        name: "DROPEE",
        description: options.description || "Payment",
        prefill: options.prefill || {},
        theme: { color: "#FF6B35" },
        handler: (response: any) => {
          options.onSuccess(response);
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
          },
        },
      });

      rzp.on("payment.failed", (response: any) => {
        toast.error("Payment failed: " + (response?.error?.description || "Unknown error"));
        options.onError?.(response?.error);
      });

      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      toast.error("Payment error. Please try again.");
      options.onError?.(err);
    }
  }, []);

  return { pay };
};
