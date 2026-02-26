import { useAdminLoyaltySettings, useUpdateLoyaltySetting, useAdminTiers } from "@/hooks/useAdminData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Gift, Save } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AdminLoyalty = () => {
  const { data: settings, isLoading } = useAdminLoyaltySettings();
  const { data: tiers } = useAdminTiers();
  const updateSetting = useUpdateLoyaltySetting();
  const [local, setLocal] = useState<Record<string, string>>({});

  useEffect(() => { if (settings) setLocal(settings); }, [settings]);

  const handleSave = async (key: string) => {
    try { await updateSetting.mutateAsync({ key, value: local[key] }); toast.success(`${key} updated`); }
    catch { toast.error("Failed"); }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48 bg-dashboard-border" /><Skeleton className="h-64 bg-dashboard-border" /></div>;

  const settingFields = [
    { key: "welcome_bonus", label: "Welcome Bonus Points", type: "number" },
    { key: "referral_bonus", label: "Referral Bonus Points", type: "number" },
    { key: "mystery_box_threshold", label: "Mystery Box Threshold (deliveries)", type: "number" },
    { key: "double_points_multiplier", label: "Double Points Multiplier", type: "number" },
  ];

  const toggleFields = [
    { key: "double_points_enabled", label: "Double Points Mode" },
  ];

  const dateFields = [
    { key: "double_points_start", label: "Double Points Start" },
    { key: "double_points_end", label: "Double Points End" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-display text-dashboard-card-foreground flex items-center gap-2">
        <Gift className="h-5 w-5 text-primary" /> Loyalty & Gamification Settings
      </h1>

      {/* General settings */}
      <Card className="bg-dashboard-card border-dashboard-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm text-dashboard-card-foreground">Points Economy</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {settingFields.map(({ key, label, type }) => (
            <div key={key} className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input
                  type={type}
                  value={local[key] ?? ""}
                  onChange={e => setLocal({ ...local, [key]: e.target.value })}
                  className="bg-dashboard-bg border-dashboard-border text-dashboard-card-foreground mt-1"
                />
              </div>
              <Button size="icon" variant="outline" className="mt-5 h-8 w-8 border-dashboard-border" onClick={() => handleSave(key)}>
                <Save className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}

          {toggleFields.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Switch
                checked={local[key] === "true"}
                onCheckedChange={v => {
                  setLocal({ ...local, [key]: String(v) });
                  updateSetting.mutate({ key, value: String(v) });
                }}
              />
            </div>
          ))}

          {dateFields.map(({ key, label }) => (
            <div key={key}>
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <div className="flex gap-2">
                <Input
                  type="datetime-local"
                  value={local[key] ? local[key].slice(0, 16) : ""}
                  onChange={e => setLocal({ ...local, [key]: e.target.value })}
                  className="bg-dashboard-bg border-dashboard-border text-dashboard-card-foreground mt-1 flex-1"
                />
                <Button size="icon" variant="outline" className="mt-1 h-9 w-9 border-dashboard-border" onClick={() => handleSave(key)}>
                  <Save className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tiers display */}
      <Card className="bg-dashboard-card border-dashboard-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm text-dashboard-card-foreground">Tier Thresholds</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(tiers ?? []).map(t => (
              <div key={t.id} className="p-3 rounded-lg bg-dashboard-bg border border-dashboard-border text-center">
                <span className="text-2xl">{t.badge_icon}</span>
                <p className="text-sm font-medium text-dashboard-card-foreground mt-1">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">{t.min_deliveries}–{t.max_deliveries ?? "∞"} deliveries</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoyalty;
