import { useState } from "react";
import { useHubWebsites, useCreateHubWebsite, useUpdateHubWebsite, useRegenerateApiKey, useDeleteHubWebsite, useHubOrders, useHubAgents } from "@/hooks/useHubData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Copy, RefreshCw, Trash2, Eye, EyeOff, Package, Wifi, WifiOff, Users, ShoppingBag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminHubWebsites = () => {
  const { data: websites, isLoading } = useHubWebsites();
  const { data: orders } = useHubOrders();
  const { data: agents } = useHubAgents();
  const createWebsite = useCreateHubWebsite();
  const updateWebsite = useUpdateHubWebsite();
  const regenerateKey = useRegenerateApiKey();
  const deleteWebsite = useDeleteHubWebsite();

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  // Compute per-website stats
  const getWebsiteStats = (websiteId: string) => {
    const websiteOrders = (orders || []).filter(o => o.website_id === websiteId);
    const activeOrders = websiteOrders.filter(o => !["delivered", "cancelled"].includes(o.status));
    const totalOrders = websiteOrders.length;
    const pendingOrders = websiteOrders.filter(o => o.status === "pending").length;
    return { activeOrders: activeOrders.length, totalOrders, pendingOrders };
  };

  // Online/offline agents (global, since agents serve all websites)
  const onlineAgents = (agents || []).filter(a => a.is_active && a.status === "approved" && a.is_online);
  const offlineAgents = (agents || []).filter(a => a.is_active && a.status === "approved" && !a.is_online);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createWebsite.mutateAsync({ name: name.trim(), label_color: color });
      toast({ title: "Website added" });
      setShowAdd(false);
      setName("");
      setColor("#3B82F6");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "API key copied" });
  };

  const handleRegenerate = async (id: string) => {
    try {
      await regenerateKey.mutateAsync(id);
      toast({ title: "API key regenerated" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Connected Websites</h1>
          <p className="text-sm text-muted-foreground">Manage API keys and view live stats per website</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Live
          </Badge>
          <Button onClick={() => setShowAdd(true)} className="gap-1"><Plus className="h-4 w-4" /> Add Website</Button>
        </div>
      </div>

      {/* Global Agent Status Banner */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Delivery Agents</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-success" />
                <span className="text-sm text-foreground font-medium">{onlineAgents.length}</span>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                <span className="text-sm text-foreground font-medium">{offlineAgents.length}</span>
                <span className="text-xs text-muted-foreground">Offline</span>
              </div>
            </div>
            {onlineAgents.length > 0 && (
              <div className="flex -space-x-2 ml-auto">
                {onlineAgents.slice(0, 5).map(a => (
                  <div key={a.id} className="h-7 w-7 rounded-full bg-primary/15 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary" title={`${a.name} — Online`}>
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {onlineAgents.length > 5 && (
                  <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                    +{onlineAgents.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Per-Website Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(websites || []).map((w) => {
          const stats = getWebsiteStats(w.id);
          return (
            <Card key={w.id} className={!w.is_active ? "opacity-50" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: w.label_color }} />
                    <CardTitle className="text-sm">{w.name}</CardTitle>
                  </div>
                  <Switch checked={w.is_active} onCheckedChange={(checked) => updateWebsite.mutate({ id: w.id, is_active: checked })} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Live Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Package className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{stats.activeOrders}</p>
                    <p className="text-[10px] text-muted-foreground">Active</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <ShoppingBag className="h-3 w-3 text-yellow-500" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{stats.pendingOrders}</p>
                    <p className="text-[10px] text-muted-foreground">Pending</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{stats.totalOrders}</p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                  </div>
                </div>

                {/* API Key */}
                <div className="flex items-center gap-1">
                  <code className="text-[10px] bg-muted px-2 py-1 rounded font-mono flex-1 truncate">
                    {revealedKeys.has(w.id) ? w.api_key : `${w.api_key.slice(0, 8)}••••••••`}
                  </code>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleReveal(w.id)}>
                    {revealedKeys.has(w.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyKey(w.api_key)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRegenerate(w.id)} title="Regenerate key">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Delete this website?")) deleteWebsite.mutate(w.id); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(websites || []).length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No websites connected yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* All Agents Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> All Delivery Agents — Live Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Agent Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...onlineAgents, ...offlineAgents].map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${a.is_online ? "bg-success animate-pulse" : "bg-destructive"}`} />
                      <span className={`text-xs font-medium ${a.is_online ? "text-success" : "text-destructive"}`}>{a.is_online ? "Online" : "Offline"}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="font-mono text-[10px]">{a.agent_code || "—"}</Badge></TableCell>
                  <TableCell className="font-medium text-sm">{a.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.phone || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {a.average_rating ? `⭐ ${Number(a.average_rating).toFixed(1)} (${a.total_ratings})` : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {a.last_seen_at ? new Date(a.last_seen_at).toLocaleString() : "Never"}
                  </TableCell>
                </TableRow>
              ))}
              {onlineAgents.length + offlineAgents.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No active agents</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Website</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Website Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Cafe" />
            </div>
            <div>
              <label className="text-sm font-medium">Label Color</label>
              <div className="flex gap-2 items-center mt-1">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-8 rounded border cursor-pointer" />
                <Badge style={{ backgroundColor: color, color: "#fff" }}>{name || "Preview"}</Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!name.trim() || createWebsite.isPending}>
              {createWebsite.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHubWebsites;
