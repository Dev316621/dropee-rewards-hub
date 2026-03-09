import { format } from "date-fns";
import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { useDeliveries } from "@/hooks/useDeliveries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AvailableAgents } from "@/components/AvailableAgents";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  in_transit: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

const statuses = ["all", "pending", "in_transit", "completed", "cancelled"];

const DeliveryHistory = () => {
  const { deliveries, totalCount, isLoading, page, setPage, pageSize, statusFilter, setStatusFilter } =
    useDeliveries();

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      {/* Available Agents Section */}
      <AvailableAgents title="Contact a Delivery Agent" />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-dashboard-card-foreground">
          Delivery History
        </h2>
        <span className="text-xs text-muted-foreground">{totalCount} total</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {statuses.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => { setStatusFilter(s); setPage(0); }}
            className={statusFilter !== s ? "border-dashboard-border text-muted-foreground" : ""}
          >
            {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </Button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full bg-dashboard-border rounded-xl" />
            ))
          : deliveries.length === 0
          ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No deliveries found</p>
            </div>
          )
          : deliveries.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-dashboard-card border border-dashboard-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={statusColors[d.status] || ""}>
                        {d.status.replace("_", " ")}
                      </Badge>
                      {d.is_free && (
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                          FREE
                        </Badge>
                      )}
                      {(d.points_earned ?? 0) > 0 && (
                        <span className="text-xs text-secondary">+{d.points_earned} pts</span>
                      )}
                    </div>
                    <p className="text-sm text-dashboard-card-foreground truncate">
                      📍 {d.pickup} → {d.dropoff}
                    </p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{format(new Date(d.created_at), "MMM d, yyyy")}</span>
                      {d.weight ? <span>{d.weight} kg</span> : null}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-dashboard-card-foreground">
                      {d.is_free ? "FREE" : `AED ${Number(d.fee).toFixed(0)}`}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="border-dashboard-border text-muted-foreground"
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="border-dashboard-border text-muted-foreground"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default DeliveryHistory;
