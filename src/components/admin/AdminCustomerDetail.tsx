import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package, Coins, Award, MapPin, Save, Loader2, Truck, Star, Navigation, ExternalLink, Wifi, WifiOff, Phone, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const useAdminCustomerDetail = (userId: string) => {
  const profile = useQuery({
    queryKey: ["admin-customer-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const deliveries = useQuery({
    queryKey: ["admin-customer-deliveries", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("deliveries").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

  const pointsLog = useQuery({
    queryKey: ["admin-customer-points", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("loyalty_points_log").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

  const spinHistory = useQuery({
    queryKey: ["admin-customer-spins", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("spin_results").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

  const badges = useQuery({
    queryKey: ["admin-customer-badges", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_badges").select("*, badges(*)").eq("user_id", userId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

  const location = useQuery({
    queryKey: ["admin-customer-location", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("location_requests").select("*").eq("user_id", userId).eq("status", "completed").order("completed_at", { ascending: false }).limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: !!userId,
  });

  const pointsBalance = useQuery({
    queryKey: ["admin-customer-balance", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_points_balance", { _user_id: userId });
      if (error) throw error;
      return data ?? 0;
    },
    enabled: !!userId,
  });

  const tier = useQuery({
    queryKey: ["admin-customer-tier", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_tier", { _user_id: userId });
      if (error) throw error;
      return data?.[0] ?? { tier_name: "Starter", tier_badge: "bronze" };
    },
    enabled: !!userId,
  });

  return { profile, deliveries, pointsLog, spinHistory, badges, location, pointsBalance, tier };
};

const AdminCustomerDetail = () => {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { profile, deliveries, pointsLog, spinHistory, badges, location, pointsBalance, tier } = useAdminCustomerDetail(userId!);

  const [editForm, setEditForm] = useState({ full_name: "", phone: "", date_of_birth: "", address: "", plus_code: "", latitude: null as number | null, longitude: null as number | null });
  const [editing, setEditing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (profile.data) {
      setEditForm({
        full_name: profile.data.full_name || "",
        phone: profile.data.phone || "",
        date_of_birth: profile.data.date_of_birth || "",
        address: profile.data.address || "",
        plus_code: (profile.data as any)?.plus_code || "",
        latitude: (profile.data as any)?.latitude ?? null,
        longitude: (profile.data as any)?.longitude ?? null,
      });
    }
  }, [profile.data]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEditForm(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setIsLocating(false);
        setEditing(true);
        toast.success("Location captured! Click Save to store it.");
      },
      (err) => {
        console.error(err);
        toast.error("Could not get location. Please allow GPS access.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const updateProfile = useMutation({
    mutationFn: async (data: typeof editForm) => {
      const { error } = await supabase.from("profiles").update(data).eq("user_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-customer-profile", userId] });
      toast.success("Profile updated");
      setEditing(false);
    },
    onError: () => toast.error("Failed to update"),
  });

  if (!userId) return null;

  const isLoading = profile.isLoading;
  const p = profile.data;
  const completedDeliveries = (deliveries.data ?? []).filter(d => d.status === "completed").length;
  const totalDeliveries = deliveries.data?.length ?? 0;
  const loc = location.data;
  const isOnline = p?.updated_at && (Date.now() - new Date(p.updated_at).getTime()) < 15 * 60 * 1000;
  if (isLoading) return <div className="space-y-4 p-6"><Skeleton className="h-8 w-48 bg-dashboard-border" /><Skeleton className="h-64 bg-dashboard-border" /></div>;

  // Clean phone for links
  const cleanPhone = (p?.phone || "").replace(/[^0-9+]/g, "");
  const hasPhone = cleanPhone.length >= 7;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin/customers")} className="gap-1 text-muted-foreground -mb-2">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers
      </Button>

      {/* Profile Cover + Header */}
      <div className="relative rounded-xl overflow-hidden">
        {/* Cover gradient */}
        <div className="h-24 sm:h-32 bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/20" />
        
        {/* Profile info overlay */}
        <div className="bg-card border border-border rounded-b-xl px-4 sm:px-6 pb-4 pt-0 -mt-0">
          <div className="flex items-start gap-4 -mt-10">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="h-20 w-20 rounded-full bg-card border-4 border-background flex items-center justify-center text-2xl font-bold text-primary shadow-lg">
                {p?.full_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background ${isOnline ? "bg-green-500" : "bg-muted-foreground/40"}`} />
            </div>

            {/* Name + meta */}
            <div className="pt-12 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold font-display text-foreground">{p?.full_name || "Customer"}</h1>
                <Badge variant="outline" className="text-[10px] gap-1">
                  {isOnline ? (
                    <><Wifi className="h-2.5 w-2.5 text-green-500" /> Online</>
                  ) : (
                    <><WifiOff className="h-2.5 w-2.5 text-muted-foreground" /> Offline</>
                  )}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">{tier.data?.tier_name ?? "Starter"}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {p?.updated_at && (
                  <>Last seen {format(new Date(p.updated_at), "MMM d, yyyy 'at' h:mm a")} · </>
                )}
                Joined {p ? format(new Date(p.created_at), "MMM d, yyyy") : "—"}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="pt-12 flex gap-1.5 shrink-0">
              {hasPhone && (
                <>
                  <a href={`https://wa.me/${cleanPhone.replace(/^\+/, "")}`} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="outline" className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200" title="WhatsApp">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </a>
                  <a href={`tel:${cleanPhone}`}>
                    <Button size="icon" variant="outline" className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200" title="Call">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile + Map Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile Card */}
        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-dashboard-card-foreground">Profile Details</CardTitle>
            <Button size="sm" variant={editing ? "default" : "outline"} onClick={() => editing ? updateProfile.mutate(editForm) : setEditing(true)} className="gap-1 text-xs">
              {updateProfile.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : editing ? <><Save className="h-3 w-3" /> Save</> : "Edit"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Full Name", key: "full_name" as const },
              { label: "Phone", key: "phone" as const },
              { label: "Date of Birth", key: "date_of_birth" as const },
              { label: "Address", key: "address" as const },
              { label: "Plus Code", key: "plus_code" as const },
            ].map(({ label, key }) => (
              <div key={key}>
                <Label className="text-[10px] text-muted-foreground uppercase">{label}</Label>
                {editing ? (
                  <Input
                    type={key === "date_of_birth" ? "date" : "text"}
                    value={editForm[key]}
                    onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                    className="bg-dashboard-bg border-dashboard-border text-sm"
                  />
                ) : (
                  <p className="text-sm text-dashboard-card-foreground">{(p as any)?.[key] || "—"}</p>
                )}
              </div>
            ))}
            <div>
              <Label className="text-[10px] text-muted-foreground uppercase">Referral Code</Label>
              <Badge variant="outline" className="font-mono text-xs border-dashboard-border">{p?.referral_code || "—"}</Badge>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground uppercase">Joined</Label>
              <p className="text-sm text-dashboard-card-foreground">{p ? format(new Date(p.created_at), "MMM d, yyyy") : "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Map Card */}
        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-dashboard-card-foreground flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Location</CardTitle>
            <Button size="sm" variant="outline" onClick={handleLocateMe} disabled={isLocating} className="gap-1 text-xs">
              <Navigation className={`h-3 w-3 ${isLocating ? "animate-pulse" : ""}`} />
              {isLocating ? "Getting..." : "Locate Me"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Profile saved location (priority) or location request */}
            {(editForm.latitude && editForm.longitude) || (loc?.latitude && loc?.longitude) ? (
              <div className="space-y-2">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${(editForm.longitude ?? loc?.longitude)! - 0.01},${(editForm.latitude ?? loc?.latitude)! - 0.01},${(editForm.longitude ?? loc?.longitude)! + 0.01},${(editForm.latitude ?? loc?.latitude)! + 0.01}&layer=mapnik&marker=${editForm.latitude ?? loc?.latitude},${editForm.longitude ?? loc?.longitude}`}
                  className="w-full h-40 rounded-lg border border-dashboard-border"
                  title="Customer location"
                />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Lat: {(editForm.latitude ?? loc?.latitude)?.toFixed(6)}, Lng: {(editForm.longitude ?? loc?.longitude)?.toFixed(6)}</span>
                  <a
                    href={`https://www.google.com/maps?q=${editForm.latitude ?? loc?.latitude},${editForm.longitude ?? loc?.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Open in Maps <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-sm rounded-lg bg-dashboard-bg border border-dashboard-border gap-2">
                <MapPin className="h-5 w-5" />
                <span>No location saved</span>
                <span className="text-[10px]">Use "Locate Me" when at customer's home</span>
              </div>
            )}
            {/* Plus Code display */}
            {(p as any)?.plus_code && (
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="font-mono border-dashboard-border">{(p as any).plus_code}</Badge>
                <a
                  href={`https://plus.codes/${(p as any).plus_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-[10px]"
                >
                  View Plus Code →
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Deliveries", value: totalDeliveries, icon: Package, color: "text-primary" },
          { label: "Completed", value: completedDeliveries, icon: Truck, color: "text-green-400" },
          { label: "Points Balance", value: pointsBalance.data ?? 0, icon: Coins, color: "text-secondary" },
          { label: "Current Tier", value: tier.data?.tier_name ?? "Starter", icon: Star, color: "text-yellow-400", isText: true },
        ].map(stat => (
          <Card key={stat.label} className="bg-dashboard-card border-dashboard-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-lg font-bold text-dashboard-card-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Badges */}
      {(badges.data ?? []).length > 0 && (
        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-dashboard-card-foreground flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Badges Earned</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(badges.data ?? []).map((ub: any) => (
              <Badge key={ub.id} variant="secondary" className="gap-1 text-xs">
                {ub.badges?.icon} {ub.badges?.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Delivery History */}
      <Card className="bg-dashboard-card border-dashboard-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-dashboard-card-foreground">Delivery History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-dashboard-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Pickup → Dropoff</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Fee</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(deliveries.data ?? []).map(d => (
                  <TableRow key={d.id} className="border-dashboard-border">
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(d.created_at), "MMM d, yy")}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{d.status}</Badge></TableCell>
                    <TableCell className="text-xs text-dashboard-card-foreground truncate max-w-[200px]">{d.pickup} → {d.dropoff}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">AED {d.fee ?? 0}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">+{d.points_earned ?? 0}</TableCell>
                  </TableRow>
                ))}
                {(deliveries.data ?? []).length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6 text-xs">No deliveries</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Points Log & Spin History side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-dashboard-card-foreground">Points Log</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-dashboard-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Amount</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Source</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(pointsLog.data ?? []).map(p => (
                    <TableRow key={p.id} className="border-dashboard-border">
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(p.created_at), "MMM d")}</TableCell>
                      <TableCell className={`text-xs font-medium ${p.amount > 0 ? "text-green-400" : "text-red-400"}`}>{p.amount > 0 ? "+" : ""}{p.amount}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.source}</TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">{p.note || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-dashboard-card-foreground">Spin History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-dashboard-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Type</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Prize</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(spinHistory.data ?? []).map(s => (
                    <TableRow key={s.id} className="border-dashboard-border">
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(s.created_at), "MMM d")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground capitalize">{s.spin_type}</TableCell>
                      <TableCell className="text-xs text-dashboard-card-foreground">{s.prize_type.replace(/_/g, " ")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.prize_value || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCustomerDetail;
