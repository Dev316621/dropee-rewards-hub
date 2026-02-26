import { useState } from "react";
import { useAdminCustomers } from "@/hooks/useAdminData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const AdminCustomers = () => {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useAdminCustomers(search);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold font-display text-dashboard-card-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Customer Management
        </h1>
        <Badge variant="secondary" className="text-xs">{customers?.length ?? 0} users</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-dashboard-card border-dashboard-border text-dashboard-card-foreground"
        />
      </div>

      <Card className="bg-dashboard-card border-dashboard-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 bg-dashboard-border" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-dashboard-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Name</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Phone</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Referral Code</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(customers ?? []).map((c) => (
                    <TableRow key={c.id} className="border-dashboard-border">
                      <TableCell className="text-dashboard-card-foreground text-sm font-medium">{c.full_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{c.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px] border-dashboard-border text-muted-foreground">{c.referral_code}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{format(new Date(c.created_at), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                  {(customers ?? []).length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No customers found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomers;
