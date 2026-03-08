import { useState } from "react";
import { useHubAgents, useCreateHubAgent, useUpdateHubAgent, useDeleteHubAgent } from "@/hooks/useHubData";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminHubAgents = () => {
  const { data: agents, isLoading } = useHubAgents();
  const createAgent = useCreateHubAgent();
  const updateAgent = useUpdateHubAgent();
  const deleteAgent = useDeleteHubAgent();

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createAgent.mutateAsync({ name: name.trim(), phone: phone.trim() });
      toast({ title: "Agent added" });
      setShowAdd(false);
      setName("");
      setPhone("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Delivery Agents</h1>
          <p className="text-sm text-muted-foreground">Manage agents for hub order deliveries</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-1"><Plus className="h-4 w-4" /> Add Agent</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(agents || []).length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No agents added</TableCell></TableRow>
              )}
              {(agents || []).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.phone || "—"}</TableCell>
                  <TableCell>
                    <Switch checked={a.is_active} onCheckedChange={(checked) => updateAgent.mutate({ id: a.id, is_active: checked })} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteAgent.mutate(a.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Delivery Agent</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent name" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!name.trim() || createAgent.isPending}>
              {createAgent.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHubAgents;
