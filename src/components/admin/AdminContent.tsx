import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  usePolicySections, useUpsertPolicySection, useDeletePolicySection,
  useFaqs, useUpsertFaq, useDeleteFaq,
  useFooterLinks, useUpsertFooterLink, useDeleteFooterLink,
  useSiteSettings, useUpdateSiteSetting,
} from "@/hooks/useContentData";

// ── Reusable inline editor row ──
type ItemFormProps = {
  fields: { key: string; label: string; type?: "text" | "textarea" | "switch" | "number" }[];
  initial: Record<string, any>;
  onSave: (data: Record<string, any>) => void;
  onCancel: () => void;
};

const ItemForm = ({ fields, initial, onSave, onCancel }: ItemFormProps) => {
  const [form, setForm] = useState(initial);
  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <Card className="border-primary/30">
      <CardContent className="p-4 space-y-3">
        {fields.map(f => (
          <div key={f.key}>
            <Label className="text-xs font-medium mb-1 block">{f.label}</Label>
            {f.type === "textarea" ? (
              <Textarea value={form[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} className="text-sm" rows={3} />
            ) : f.type === "switch" ? (
              <Switch checked={!!form[f.key]} onCheckedChange={v => set(f.key, v)} />
            ) : f.type === "number" ? (
              <Input type="number" value={form[f.key] ?? 0} onChange={e => set(f.key, Number(e.target.value))} className="text-sm" />
            ) : (
              <Input value={form[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} className="text-sm" />
            )}
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={() => onSave(form)}><Save className="h-3.5 w-3.5 mr-1" />Save</Button>
          <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Policies Tab ──
const PoliciesTab = () => {
  const { data: policies = [], isLoading } = usePolicySections();
  const upsert = useUpsertPolicySection();
  const remove = useDeletePolicySection();
  const [editing, setEditing] = useState<string | null>(null);

  const fields = [
    { key: "title", label: "Title" },
    { key: "content", label: "Content", type: "textarea" as const },
    { key: "display_order", label: "Order", type: "number" as const },
    { key: "is_active", label: "Active", type: "switch" as const },
  ];

  const handleSave = (data: Record<string, any>) => {
    upsert.mutate(data as any, {
      onSuccess: () => { toast.success("Policy saved"); setEditing(null); },
      onError: () => toast.error("Failed to save"),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Policy Sections</h3>
        <Button size="sm" onClick={() => setEditing("new")}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
      </div>
      {editing === "new" && <ItemForm fields={fields} initial={{ title: "", content: "", display_order: policies.length, is_active: true }} onSave={handleSave} onCancel={() => setEditing(null)} />}
      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : policies.map(p => (
        editing === p.id ? (
          <ItemForm key={p.id} fields={fields} initial={p} onSave={handleSave} onCancel={() => setEditing(null)} />
        ) : (
          <Card key={p.id} className={!p.is_active ? "opacity-50" : ""}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{p.title}</p>
                <p className="text-xs text-muted-foreground truncate">{p.content?.slice(0, 80)}…</p>
              </div>
              <div className="flex gap-1 shrink-0 ml-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(p.id)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Delete?")) remove.mutate(p.id, { onSuccess: () => toast.success("Deleted") }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        )
      ))}
    </div>
  );
};

// ── FAQs Tab ──
const FaqsTab = () => {
  const { data: faqs = [], isLoading } = useFaqs();
  const upsert = useUpsertFaq();
  const remove = useDeleteFaq();
  const [editing, setEditing] = useState<string | null>(null);

  const fields = [
    { key: "question", label: "Question" },
    { key: "answer", label: "Answer", type: "textarea" as const },
    { key: "category", label: "Category" },
    { key: "display_order", label: "Order", type: "number" as const },
    { key: "is_active", label: "Active", type: "switch" as const },
  ];

  const handleSave = (data: Record<string, any>) => {
    upsert.mutate(data as any, {
      onSuccess: () => { toast.success("FAQ saved"); setEditing(null); },
      onError: () => toast.error("Failed to save"),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">FAQs</h3>
        <Button size="sm" onClick={() => setEditing("new")}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
      </div>
      {editing === "new" && <ItemForm fields={fields} initial={{ question: "", answer: "", category: "general", display_order: faqs.length, is_active: true }} onSave={handleSave} onCancel={() => setEditing(null)} />}
      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : faqs.map(f => (
        editing === f.id ? (
          <ItemForm key={f.id} fields={fields} initial={f} onSave={handleSave} onCancel={() => setEditing(null)} />
        ) : (
          <Card key={f.id} className={!f.is_active ? "opacity-50" : ""}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{f.question}</p>
                <p className="text-xs text-muted-foreground">{f.category}</p>
              </div>
              <div className="flex gap-1 shrink-0 ml-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(f.id)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Delete?")) remove.mutate(f.id, { onSuccess: () => toast.success("Deleted") }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        )
      ))}
    </div>
  );
};

// ── Footer Links Tab ──
const FooterLinksTab = () => {
  const { data: links = [], isLoading } = useFooterLinks();
  const upsert = useUpsertFooterLink();
  const remove = useDeleteFooterLink();
  const [editing, setEditing] = useState<string | null>(null);

  const fields = [
    { key: "label", label: "Label" },
    { key: "url", label: "URL" },
    { key: "display_order", label: "Order", type: "number" as const },
    { key: "is_active", label: "Active", type: "switch" as const },
  ];

  const handleSave = (data: Record<string, any>) => {
    upsert.mutate(data as any, {
      onSuccess: () => { toast.success("Link saved"); setEditing(null); },
      onError: () => toast.error("Failed to save"),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Footer Quick Links</h3>
        <Button size="sm" onClick={() => setEditing("new")}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
      </div>
      {editing === "new" && <ItemForm fields={fields} initial={{ label: "", url: "/", display_order: links.length, is_active: true }} onSave={handleSave} onCancel={() => setEditing(null)} />}
      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : links.map(l => (
        editing === l.id ? (
          <ItemForm key={l.id} fields={fields} initial={l} onSave={handleSave} onCancel={() => setEditing(null)} />
        ) : (
          <Card key={l.id} className={!l.is_active ? "opacity-50" : ""}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{l.label}</p>
                <p className="text-xs text-muted-foreground">{l.url}</p>
              </div>
              <div className="flex gap-1 shrink-0 ml-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(l.id)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Delete?")) remove.mutate(l.id, { onSuccess: () => toast.success("Deleted") }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        )
      ))}
    </div>
  );
};

// ── Contact / Site Settings Tab ──
const ContactTab = () => {
  const { data: settings = {}, isLoading } = useSiteSettings();
  const update = useUpdateSiteSetting();
  const [form, setForm] = useState<Record<string, string>>({});

  const contactFields = [
    { key: "contact_address", label: "Address" },
    { key: "contact_phone", label: "Phone" },
    { key: "contact_email", label: "Email" },
  ];

  // Sync form with settings
  const getValue = (key: string) => form[key] ?? settings[key] ?? "";

  const handleSave = () => {
    const promises = Object.entries(form).map(([key, value]) =>
      update.mutateAsync({ key, value })
    );
    Promise.all(promises).then(() => {
      toast.success("Contact info saved");
      setForm({});
    }).catch(() => toast.error("Failed to save"));
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Contact Information</h3>
      {contactFields.map(f => (
        <div key={f.key}>
          <Label className="text-xs font-medium mb-1 block">{f.label}</Label>
          <Input value={getValue(f.key)} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} className="text-sm" />
        </div>
      ))}
      <Button size="sm" onClick={handleSave} disabled={Object.keys(form).length === 0}>
        <Save className="h-3.5 w-3.5 mr-1" />Save Changes
      </Button>
    </div>
  );
};

// ── Main Component ──
const AdminContent = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display text-dashboard-card-foreground">Site Content</h1>
        <p className="text-sm text-muted-foreground">Manage policies, FAQs, footer links, and contact info</p>
      </div>

      <Tabs defaultValue="policies">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="policies" className="text-xs">Policies</TabsTrigger>
          <TabsTrigger value="faqs" className="text-xs">FAQs</TabsTrigger>
          <TabsTrigger value="footer" className="text-xs">Footer Links</TabsTrigger>
          <TabsTrigger value="contact" className="text-xs">Contact</TabsTrigger>
        </TabsList>
        <TabsContent value="policies"><PoliciesTab /></TabsContent>
        <TabsContent value="faqs"><FaqsTab /></TabsContent>
        <TabsContent value="footer"><FooterLinksTab /></TabsContent>
        <TabsContent value="contact"><ContactTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
