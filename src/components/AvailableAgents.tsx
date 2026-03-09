import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MessageCircle, Star, User, Bike } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Agent {
  id: string;
  name: string;
  phone: string;
  agent_code: string | null;
  average_rating: number;
  total_ratings: number;
  delivery_fee: number;
  is_online: boolean;
  last_seen_at: string | null;
}

interface AvailableAgentsProps {
  title?: string;
  showDeliveryFee?: boolean;
}

export const AvailableAgents = ({ 
  title = "Available Agents",
  showDeliveryFee = true 
}: AvailableAgentsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);

  const { data: agents, isLoading } = useQuery({
    queryKey: ["available-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hub_delivery_agents")
        .select("id, name, phone, agent_code, average_rating, total_ratings, delivery_fee, is_online, last_seen_at")
        .eq("is_active", true)
        .eq("status", "approved")
        .order("is_online", { ascending: false })
        .order("average_rating", { ascending: false });
      
      if (error) throw error;
      return data as Agent[];
    },
  });

  // Realtime subscription for agent status changes
  useEffect(() => {
    const channel = supabase
      .channel('agents-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'hub_delivery_agents',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["available-agents"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: userRatings } = useQuery({
    queryKey: ["user-agent-ratings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("agent_ratings")
        .select("agent_id, rating")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const submitRating = useMutation({
    mutationFn: async ({ agentId, rating, comment }: { agentId: string; rating: number; comment: string }) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("agent_ratings")
        .upsert({
          agent_id: agentId,
          user_id: user.id,
          rating,
          comment,
        }, { onConflict: "agent_id,user_id" });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rating submitted!");
      setRatingDialogOpen(false);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["available-agents"] });
      queryClient.invalidateQueries({ queryKey: ["user-agent-ratings"] });
    },
    onError: () => {
      toast.error("Failed to submit rating");
    },
  });

  const handleWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent(`Hi ${name}, I need delivery assistance.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const getUserRating = (agentId: string) => {
    return userRatings?.find(r => r.agent_id === agentId)?.rating;
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (r: number) => void) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-muted-foreground/30"
            } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
            onClick={() => interactive && onSelect?.(star)}
          />
        ))}
      </div>
    );
  };

  const onlineAgents = agents?.filter(a => a.is_online) || [];
  const offlineAgents = agents?.filter(a => !a.is_online) || [];

  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!agents?.length) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-6 text-center">
          <Bike className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No agents available at the moment</p>
        </CardContent>
      </Card>
    );
  }

  const renderAgent = (agent: Agent, index: number) => {
    const userRating = getUserRating(agent.id);

    return (
      <motion.div
        key={agent.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl transition-all duration-300 ${
          agent.is_online
            ? "bg-success/5 border border-success/10 hover:border-success/20"
            : "bg-muted/50 hover:bg-muted opacity-70"
        }`}
      >
        {/* Avatar with status indicator */}
        <div className="relative shrink-0">
          <Avatar className="h-12 w-12">
            <AvatarFallback className={`font-semibold text-sm ${
              agent.is_online ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
            }`}>
              {agent.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Online/Offline dot */}
          <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center ${
            agent.is_online ? "bg-success" : "bg-muted-foreground/40"
          }`}>
            {agent.is_online && (
              <span className="w-2 h-2 rounded-full bg-success animate-ping absolute" />
            )}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm truncate">{agent.name}</span>
            {agent.agent_code && (
              <Badge variant="outline" className="text-[10px] rounded-full px-2 shrink-0">
                {agent.agent_code}
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`text-[10px] rounded-full px-2 shrink-0 ${
                agent.is_online
                  ? "border-success/30 text-success bg-success/5"
                  : "border-muted-foreground/20 text-muted-foreground"
              }`}
            >
              {agent.is_online ? "Online" : "Offline"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            {renderStars(Math.round(agent.average_rating || 0))}
            <span className="text-xs text-muted-foreground">
              ({agent.total_ratings || 0})
            </span>
          </div>
          
          {showDeliveryFee && agent.delivery_fee > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Fee: ₹{agent.delivery_fee}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 p-0 rounded-xl"
            onClick={() => handleCall(agent.phone)}
          >
            <Phone className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            className="h-9 w-9 p-0 rounded-xl bg-green-600 hover:bg-green-700"
            onClick={() => handleWhatsApp(agent.phone, agent.name)}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          
          {user && (
            <Dialog open={ratingDialogOpen && selectedAgent?.id === agent.id} onOpenChange={(open) => {
              setRatingDialogOpen(open);
              if (open) {
                setSelectedAgent(agent);
                setRating(userRating || 5);
              }
            }}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant={userRating ? "secondary" : "ghost"}
                  className="h-9 w-9 p-0 rounded-xl"
                >
                  <Star className={`h-4 w-4 ${userRating ? "fill-yellow-400 text-yellow-400" : ""}`} />
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Rate {agent.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex justify-center">
                    {renderStars(rating, true, setRating)}
                  </div>
                  <Textarea
                    placeholder="Leave a comment (optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="rounded-xl"
                  />
                  <Button
                    className="w-full rounded-xl"
                    onClick={() => submitRating.mutate({ agentId: agent.id, rating, comment })}
                    disabled={submitRating.isPending}
                  >
                    {submitRating.isPending ? "Submitting..." : userRating ? "Update Rating" : "Submit Rating"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <div className="icon-box w-9 h-9">
              <User className="h-4.5 w-4.5 text-primary" />
            </div>
            {title}
          </h3>
          <Badge variant="outline" className="rounded-full text-xs px-2.5">
            <span className="w-2 h-2 rounded-full bg-success mr-1.5 inline-block" />
            {onlineAgents.length} online
          </Badge>
        </div>
        
        <div className="space-y-2">
          {/* Online agents first */}
          {onlineAgents.map((agent, i) => renderAgent(agent, i))}
          
          {/* Divider if both groups exist */}
          {onlineAgents.length > 0 && offlineAgents.length > 0 && (
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Offline</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          )}
          
          {/* Offline agents */}
          {offlineAgents.map((agent, i) => renderAgent(agent, onlineAgents.length + i))}
        </div>
      </CardContent>
    </Card>
  );
};
