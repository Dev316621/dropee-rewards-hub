import { useState } from "react";
import { useHubAgents, useCreateHubAgent, useUpdateHubAgent, useDeleteHubAgent, useApproveAgent, useCreateAgentWithAccount } from "@/hooks/useHubData";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2, Check, X, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminHubAgents = () => {
  const { data: agents, isLoading } = useHubAgents();
  const updateAgent = useUpdateHubAgent();
  const deleteAgent = useDeleteHubAgent();
  const approveAgent = useApproveAgent();
  const createAgentWithAccount = useCreateAgentWithAccount();

  const [showAdd, setShowAdd] = useState(false);
  const [showApprove, setShowApprove] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const pendingAgents = (agents || []).filter(a => a.status === "pending");
  const approvedAgents = (agents || []).filter(a => a.status === "approved");
  const rejectedAgents = (agents || []).filter(a => a.status === "rejected");

  const resetForm = () => {
    setName(""); setPhone(""); setEmail(""); setPassword("");
  };

  const handleCreateAgent = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({ title: "Name, email, and password are required", variant: "destructive" });
      return;
    }
    try {
      await createAgentWithAccount.mutateAsync({ name: name.trim(), phone: phone.trim(), email: email.trim(), password });
      toast({ title: "Agent created with login account" });
      setShowAdd(false);
      resetForm();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleApprove = async (agentId: string) => {
    if (!password.trim()) {
      toast({ title: "Password is required to create login", variant: "destructive" });
      return;
    }
    try {
      await approveAgent.mutateAsync({ agent_id: agentId, email: email.trim() || undefined, password, action: "approve" });
      toast({ title: "Agent approved & account created" });
      setShowApprove(null);
      resetForm();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleReject = async (agentId: string) => {
    try {
      await approveAgent.mutateAsync({ agent_id: agentId, action: "reject" });
      toast({ title: "Application rejected" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const approveTarget = (agents || []).find(a => a.id === showApprove);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-300">Pending</Badge>;
      case "approved": return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">Approved</Badge>;
      case "rejected": return <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-300">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Delivery Agents</h1>
          <p className="text-sm text-muted-foreground">Manage agents & review applications from partner websites</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-1"><UserPlus className="h-4 w-4" /> Add Agent</Button>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList>
          <TabsTrigger value="applications" className="gap-1">
            Applications {pendingAgents.length > 0 && <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">{pendingAgents.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="active">Active Agents ({approvedAgents.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedAgents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAgents.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No pending applications</TableCell></TableRow>
                  )}
                  {pendingAgents.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell>{a.phone || "—"}</TableCell>
                      <TableCell className="text-sm">{a.email || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button size="sm" variant="default" className="gap-1 h-7 text-xs" onClick={() => { setShowApprove(a.id); setEmail(a.email || ""); }}>
                          <Check className="h-3 w-3" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="gap-1 h-7 text-xs" onClick={() => handleReject(a.id)} disabled={approveAgent.isPending}>
                          <X className="h-3 w-3" /> Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedAgents.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No active agents</TableCell></TableRow>
                  )}
                  {approvedAgents.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell>{a.phone || "—"}</TableCell>
                      <TableCell className="text-sm">{a.email || "—"}</TableCell>
                      <TableCell>{statusBadge(a.status)}</TableCell>
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
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedAgents.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No rejected applications</TableCell></TableRow>
                  )}
                  {rejectedAgents.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell>{a.phone || "—"}</TableCell>
                      <TableCell className="text-sm">{a.email || "—"}</TableCell>
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
        </TabsContent>
      </Tabs>

      {/* Approve Dialog - Set password */}
      <Dialog open={!!showApprove} onOpenChange={(o) => { if (!o) { setShowApprove(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Approve Agent — Set Login Credentials</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-sm text-muted-foreground">{approveTarget?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Agent email" />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set login password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowApprove(null); resetForm(); }}>Cancel</Button>
            <Button onClick={() => handleApprove(showApprove!)} disabled={!password.trim() || approveAgent.isPending}>
              {approveAgent.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Approve & Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Agent Dialog */}
      <Dialog open={showAdd} onOpenChange={(o) => { if (!o) resetForm(); setShowAdd(o); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Delivery Agent</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent name" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Agent email" />
            </div>
            <div>
              <label className="text-sm font-medium">Password *</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Login password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleCreateAgent} disabled={!name.trim() || !email.trim() || !password.trim() || createAgentWithAccount.isPending}>
              {createAgentWithAccount.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Create Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHubAgents;
