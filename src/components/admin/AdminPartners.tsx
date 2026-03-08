import { useState } from "react";
import { useAdminPartners, useUpsertPartner, useDeletePartner } from "@/hooks/useAdminData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Handshake, Plus, Trash2, Edit, Star } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import ImageUpload from "./ImageUpload";

const emptyForm = { name: "", description: "", link: "", logo_url: "", discount_code: "", is_featured: false, display_order: 0 };

const AdminPartners = () => {
  const { data: partners, isLoading } = useAdminPartners();
  const upsertPartner = useUpsertPartner();
  const deletePartner = useDeletePartner();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<typeof emptyForm & { id?: string }>(emptyForm);

  const openEdit = (p: any) => {
    setForm({ id: p.id, name: p.name, description: p.description ?? "", link: p.link ?? "", logo_url: p.logo_url ?? "", discount_code: p.discount_code ?? "", is_featured: p.is_featured ?? false, display_order: p.display_order ?? 0 });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    try { await upsertPartner.mutateAsync(form); toast.success("Saved"); setDialogOpen(false); setForm(emptyForm); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold font-display text-dashboard-card-foreground flex items-center gap-2">
          <Handshake className="h-5 w-5 text-primary" /> Partner Management
        </h1>
        <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) setForm(emptyForm); }}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Partner</Button></DialogTrigger>
          <DialogContent className="bg-dashboard-card border-dashboard-border text-dashboard-card-foreground">
            <DialogHeader><DialogTitle>{form.id ? "Edit Partner" : "New Partner"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs text-muted-foreground">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
              <div><Label className="text-xs text-muted-foreground">Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Link</Label><Input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
                <div><Label className="text-xs text-muted-foreground">Discount Code</Label><Input value={form.discount_code} onChange={e => setForm({ ...form, discount_code: e.target.value })} className="bg-dashboard-bg border-dashboard-border font-mono" /></div>
              </div>
              <div><Label className="text-xs text-muted-foreground">Logo URL</Label><Input value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} className="bg-dashboard-bg border-dashboard-border" /></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v => setForm({ ...form, is_featured: v })} /><Label className="text-xs">Featured</Label></div>
                <div className="flex items-center gap-2"><Label className="text-xs text-muted-foreground">Order:</Label><Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: +e.target.value })} className="w-16 h-7 bg-dashboard-bg border-dashboard-border text-xs" /></div>
              </div>
              <Button onClick={handleSave} disabled={upsertPartner.isPending} className="w-full">{upsertPartner.isPending ? "Saving…" : "Save Partner"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 bg-dashboard-border rounded-lg" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(partners ?? []).map(p => (
            <Card key={p.id} className="bg-dashboard-card border-dashboard-border">
              <CardContent className="p-3 flex items-center gap-3">
                {p.logo_url ? (
                  <img src={p.logo_url} alt={p.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-dashboard-bg flex items-center justify-center shrink-0">
                    <Handshake className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-dashboard-card-foreground truncate">{p.name}</p>
                    {p.is_featured && <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{p.description || "No description"}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground shrink-0" onClick={() => openEdit(p)}><Edit className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={async () => { if (confirm("Delete?")) { await deletePartner.mutateAsync(p.id); toast.success("Deleted"); } }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {(partners ?? []).length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No partners yet</p>}
        </div>
      )}
    </div>
  );
};

export default AdminPartners;
