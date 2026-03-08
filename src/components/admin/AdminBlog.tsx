import { useState } from "react";
import { useAdminBlogPosts, useUpsertBlogPost, useDeleteBlogPost } from "@/hooks/useAdminData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Trash2, Edit, Ticket } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import ImageUpload from "./ImageUpload";

const emptyForm = { title: "", slug: "", content: "", excerpt: "", category: "general", status: "draft", image_url: "", is_pinned: false, booking_enabled: false, booking_label: "" };

const AdminBlog = () => {
  const { data: posts, isLoading } = useAdminBlogPosts();
  const upsertPost = useUpsertBlogPost();
  const deletePost = useDeleteBlogPost();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<typeof emptyForm & { id?: string }>(emptyForm);

  const openEdit = (post: any) => {
    setForm({
      id: post.id, title: post.title, slug: post.slug, content: post.content ?? "", excerpt: post.excerpt ?? "",
      category: post.category ?? "general", status: post.status, image_url: post.image_url ?? "", is_pinned: post.is_pinned ?? false,
      booking_enabled: post.booking_enabled ?? false, booking_label: post.booking_label ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) { toast.error("Title & slug required"); return; }
    try {
      const payload: any = { ...form };
      if (form.status === "published" && !form.id) payload.published_at = new Date().toISOString();
      await upsertPost.mutateAsync(payload);
      toast.success("Saved");
      setDialogOpen(false);
      setForm(emptyForm);
    } catch { toast.error("Failed"); }
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold font-display text-dashboard-card-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Blog Management
        </h1>
        <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) setForm(emptyForm); }}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> New Post</Button></DialogTrigger>
          <DialogContent className="bg-dashboard-card border-dashboard-border text-dashboard-card-foreground max-h-[80vh] overflow-y-auto max-w-lg">
            <DialogHeader><DialogTitle>{form.id ? "Edit Post" : "New Post"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Title</Label>
                <Input value={form.title} onChange={e => { setForm({ ...form, title: e.target.value, slug: form.id ? form.slug : generateSlug(e.target.value) }); }} className="bg-dashboard-bg border-dashboard-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Slug</Label>
                <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="bg-dashboard-bg border-dashboard-border font-mono text-xs" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Excerpt</Label>
                <Input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="bg-dashboard-bg border-dashboard-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Content</Label>
                <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={8} className="bg-dashboard-bg border-dashboard-border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger className="bg-dashboard-bg border-dashboard-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["general", "delivery_updates", "rain_season", "promo", "partner_promotions", "events"].map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger className="bg-dashboard-bg border-dashboard-border"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <ImageUpload value={form.image_url} onChange={url => setForm({ ...form, image_url: url })} label="Cover Image" folder="blog" />
              <div className="flex items-center gap-2"><Switch checked={form.is_pinned} onCheckedChange={v => setForm({ ...form, is_pinned: v })} /><Label className="text-xs">Pinned</Label></div>

              {/* Booking CTA */}
              <div className="border border-dashboard-border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Switch checked={form.booking_enabled} onCheckedChange={v => setForm({ ...form, booking_enabled: v })} />
                  <Label className="text-xs flex items-center gap-1"><Ticket className="w-3 h-3 text-primary" /> Enable Booking CTA</Label>
                </div>
                {form.booking_enabled && (
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Button Label (optional)</Label>
                    <Input value={form.booking_label} onChange={e => setForm({ ...form, booking_label: e.target.value })} placeholder="e.g. Register for Event" className="bg-dashboard-bg border-dashboard-border text-xs h-8" />
                  </div>
                )}
              </div>

              <Button onClick={handleSave} disabled={upsertPost.isPending} className="w-full">{upsertPost.isPending ? "Saving…" : "Save Post"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 bg-dashboard-border rounded-lg" />)}</div>
      ) : (
        <div className="space-y-2">
          {(posts ?? []).map(post => (
            <Card key={post.id} className="bg-dashboard-card border-dashboard-border">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-dashboard-card-foreground truncate">{post.title}</p>
                    {post.is_pinned && <Badge variant="secondary" className="text-[10px] bg-amber-500/20 text-amber-400">📌 Pinned</Badge>}
                    {(post as any).booking_enabled && <Badge variant="secondary" className="text-[10px] bg-emerald-500/20 text-emerald-400"><Ticket className="w-2.5 h-2.5 mr-0.5" /> Booking</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={post.status === "published" ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"} variant="secondary">
                      {post.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{post.category}</span>
                    <span className="text-[10px] text-muted-foreground">· {format(new Date(post.created_at), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => openEdit(post)}><Edit className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={async () => { if (confirm("Delete post?")) { await deletePost.mutateAsync(post.id); toast.success("Deleted"); } }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {(posts ?? []).length === 0 && <p className="text-center text-muted-foreground py-8">No blog posts yet</p>}
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
