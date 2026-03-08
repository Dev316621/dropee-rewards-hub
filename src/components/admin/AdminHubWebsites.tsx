import { useState } from "react";
import { useHubWebsites, useCreateHubWebsite, useUpdateHubWebsite, useRegenerateApiKey, useDeleteHubWebsite } from "@/hooks/useHubData";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Copy, RefreshCw, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminHubWebsites = () => {
  const { data: websites, isLoading } = useHubWebsites();
  const createWebsite = useCreateHubWebsite();
  const updateWebsite = useUpdateHubWebsite();
  const regenerateKey = useRegenerateApiKey();
  const deleteWebsite = useDeleteHubWebsite();

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

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
          <p className="text-sm text-muted-foreground">Manage API keys for external websites</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-1"><Plus className="h-4 w-4" /> Add Website</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Website</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(websites || []).length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No websites connected</TableCell></TableRow>
              )}
              {(websites || []).map((w) => (
                <TableRow key={w.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: w.label_color }} />
                      <span className="font-medium">{w.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {revealedKeys.has(w.id) ? w.api_key : `${w.api_key.slice(0, 8)}••••••••`}
                      </code>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleReveal(w.id)}>
                        {revealedKeys.has(w.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyKey(w.api_key)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch checked={w.is_active} onCheckedChange={(checked) => updateWebsite.mutate({ id: w.id, is_active: checked })} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRegenerate(w.id)} title="Regenerate key">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteWebsite.mutate(w.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
