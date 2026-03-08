import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Tag, ArrowRight, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const categories = ["All", "general", "delivery_updates", "promo", "events", "rain_season", "partner_promotions"];
const categoryLabels: Record<string, string> = {
  All: "All", general: "General", delivery_updates: "Delivery Updates", promo: "Promotions",
  events: "Events", rain_season: "Rain Season", partner_promotions: "Partner News",
};

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["public-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = activeCategory === "All"
    ? (posts ?? [])
    : (posts ?? []).filter(p => p.category === activeCategory);

  const pinned = filtered.filter(p => p.is_pinned);
  const rest = filtered.filter(p => !p.is_pinned);

  return (
    <>
      <SEOHead title="Blog & Notices" description="Stay updated with DROPEE news, promotions, delivery updates, and events in Ukhrul, Manipur." path="/blog" />
      <section className="hero-section py-16 sm:py-24 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-3 sm:mb-4">
            Blog & <span className="text-gradient-primary">Notices</span>
          </h1>
          <p className="text-sm sm:text-lg text-primary-foreground/70 max-w-xl">
            Stay updated with DROPEE news and promotions in Ukhrul.
          </p>
        </div>
      </section>

      {/* Categories */}
      <div className="py-4 sm:py-6 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap border transition-colors touch-manipulation ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-background hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatedSection className="py-10 sm:py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : (
            <>
              {/* Pinned Posts */}
              {pinned.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-elevated p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 ring-2 ring-primary/20"
                >
                  {post.image_url && (
                    <img src={post.image_url} alt={post.title} className="w-full h-40 sm:h-56 object-cover rounded-lg mb-4" />
                  )}
                  <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                    <span className="bg-primary/10 text-primary text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">📌 Pinned</span>
                    <span className="bg-accent text-accent-foreground text-[10px] sm:text-xs px-2 py-0.5 rounded-full">
                      {categoryLabels[post.category ?? "general"] || post.category}
                    </span>
                    {(post as any).booking_enabled && (
                      <span className="bg-emerald-500/10 text-emerald-600 text-[10px] sm:text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Ticket className="w-3 h-3" /> {(post as any).booking_label || "Book Now"}
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-lg sm:text-2xl font-bold mb-1.5 sm:mb-2">{post.title}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" /> {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
                    </span>
                    <div className="flex items-center gap-2">
                      {(post as any).booking_enabled && (
                        <Link to="/book">
                          <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                            <Ticket className="w-3 h-3" /> {(post as any).booking_label || "Book Now"}
                          </Button>
                        </Link>
                      )}
                      <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-primary">
                        Read More <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Post Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {rest.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="card-elevated overflow-hidden group"
                  >
                    {post.image_url && (
                      <img src={post.image_url} alt={post.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        <Tag className="w-3 h-3 text-primary" />
                        <span className="text-[10px] sm:text-xs font-medium text-primary">
                          {categoryLabels[post.category ?? "general"] || post.category}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-sm sm:text-base mb-1.5 sm:mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" /> {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
                        </span>
                        <div className="flex items-center gap-2">
                          {(post as any).booking_enabled && (
                            <Link to="/book">
                              <Button size="sm" variant="ghost" className="text-[10px] h-6 px-2 gap-1 text-emerald-600">
                                <Ticket className="w-3 h-3" /> Book
                              </Button>
                            </Link>
                          )}
                          <Link to={`/blog/${post.slug}`} className="text-xs sm:text-sm font-medium text-primary">
                            Read →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No posts found in this category.</p>
                </div>
              )}
            </>
          )}
        </div>
      </AnimatedSection>
    </>
  );
};

export default Blog;
