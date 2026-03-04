import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, CheckCircle2, XCircle } from "lucide-react";

const ShareLocation = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "ready" | "sharing" | "done" | "error" | "not_found">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setStatus("not_found"); return; }
    supabase
      .from("location_requests")
      .select("status")
      .eq("token", token)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setStatus("not_found");
        else if (data.status === "completed") setStatus("done");
        else setStatus("ready");
      });
  }, [token]);

  const handleShare = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      setStatus("error");
      return;
    }
    setStatus("sharing");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { error } = await supabase
          .from("location_requests")
          .update({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("token", token!)
          .eq("status", "pending");
        if (error) {
          setError("Failed to submit location");
          setStatus("error");
        } else {
          setStatus("done");
        }
      },
      (err) => {
        setError(err.message || "Location permission denied");
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-border text-center space-y-5">
        <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Share Your Location</h1>

        {status === "loading" && <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />}

        {status === "not_found" && (
          <div className="space-y-2">
            <XCircle className="h-10 w-10 mx-auto text-destructive" />
            <p className="text-muted-foreground text-sm">This location request was not found or has expired.</p>
          </div>
        )}

        {status === "ready" && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              DROPEE needs your location to deliver your package. Tap the button below to share your current GPS location.
            </p>
            <Button onClick={handleShare} size="lg" className="w-full gap-2">
              <MapPin className="h-4 w-4" /> Share My Location
            </Button>
          </div>
        )}

        {status === "sharing" && (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground text-sm">Getting your location…</p>
          </div>
        )}

        {status === "done" && (
          <div className="space-y-2">
            <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500" />
            <p className="text-foreground font-medium">Location shared successfully!</p>
            <p className="text-muted-foreground text-sm">Thank you! Our delivery team can now locate you.</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <XCircle className="h-10 w-10 mx-auto text-destructive" />
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" onClick={() => setStatus("ready")}>Try Again</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareLocation;
