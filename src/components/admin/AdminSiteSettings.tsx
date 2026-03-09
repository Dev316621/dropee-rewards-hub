import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useContentData";

const SETTING_GROUPS = [
  {
    title: "Hero Section",
    fields: [
      { key: "hero_title", label: "Hero Title", type: "text" },
      { key: "hero_subtitle", label: "Hero Subtitle", type: "textarea" },
      { key: "hero_cta_text", label: "CTA Button Text", type: "text" },
      { key: "hero_image_url", label: "Hero Image URL", type: "text" },
    ],
  },
  {
    title: "About Section",
    fields: [
      { key: "about_title", label: "About Title", type: "text" },
      { key: "about_description", label: "About Description", type: "textarea" },
      { key: "about_image_url", label: "About Image URL", type: "text" },
    ],
  },
  {
    title: "Services Section",
    fields: [
      { key: "services_title", label: "Services Title", type: "text" },
      { key: "services_subtitle", label: "Services Subtitle", type: "text" },
    ],
  },
  {
    title: "Contact Information",
    fields: [
      { key: "contact_address", label: "Address", type: "text" },
      { key: "contact_phone", label: "Phone", type: "text" },
      { key: "contact_email", label: "Email", type: "text" },
      { key: "contact_whatsapp", label: "WhatsApp Number", type: "text" },
    ],
  },
  {
    title: "Social Links",
    fields: [
      { key: "social_facebook", label: "Facebook URL", type: "text" },
      { key: "social_instagram", label: "Instagram URL", type: "text" },
      { key: "social_twitter", label: "Twitter/X URL", type: "text" },
      { key: "social_youtube", label: "YouTube URL", type: "text" },
    ],
  },
  {
    title: "Branding",
    fields: [
      { key: "site_name", label: "Site Name", type: "text" },
      { key: "site_tagline", label: "Tagline", type: "text" },
      { key: "logo_url", label: "Logo URL", type: "text" },
      { key: "favicon_url", label: "Favicon URL", type: "text" },
    ],
  },
  {
    title: "Footer",
    fields: [
      { key: "footer_text", label: "Footer Copyright Text", type: "text" },
      { key: "footer_description", label: "Footer Description", type: "textarea" },
    ],
  },
];

const AdminSiteSettings = () => {
  const { data: settings = {}, isLoading } = useSiteSettings();
  const update = useUpdateSiteSetting();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const getValue = (key: string) => form[key] ?? settings[key] ?? "";
  const hasChanges = Object.keys(form).length > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(form).map(([key, value]) => update.mutateAsync({ key, value }))
      );
      toast.success("All settings saved!");
      setForm({});
    } catch {
      toast.error("Failed to save some settings");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground p-4">Loading settings...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-foreground">Site Settings</h1>
          <p className="text-sm text-muted-foreground">Manage all website text, images, and branding</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || saving} className="gap-1">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save All Changes
        </Button>
      </div>

      {SETTING_GROUPS.map((group) => (
        <Card key={group.title}>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm text-foreground">{group.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.fields.map((f) => (
                <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                  <Label className="text-xs font-medium mb-1 block text-muted-foreground">{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea
                      value={getValue(f.key)}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="text-sm"
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={getValue(f.key)}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminSiteSettings;
