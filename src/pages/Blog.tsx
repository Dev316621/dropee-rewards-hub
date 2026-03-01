import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Tag, ArrowRight } from "lucide-react";

const categories = ["All", "Delivery Updates", "Promotions", "Events", "Rain Season", "Partner News"];

const posts = [
  { slug: "double-points-week-ukhrul", title: "Double Points Week is Here!", excerpt: "Earn 4 loyalty points per delivery all week.", category: "Promotions", date: "2026-02-20", pinned: true },
  { slug: "rain-season-delivery-update", title: "Rain Season Delivery Schedule Update", excerpt: "Adjusted delivery times during monsoon season.", category: "Rain Season", date: "2026-02-18", pinned: false },
  { slug: "new-partner-mountain-cafe", title: "Welcome Mountain Café to DROPEE Partners", excerpt: "Now delivering authentic Tangkhul cuisine!", category: "Partner News", date: "2026-02-15", pinned: false },
  { slug: "ukhrul-festival-bonus", title: "Ukhrul Festival — Triple Points Event!", excerpt: "Earn 6 points per delivery during the festival weekend.", category: "Events", date: "2026-02-10", pinned: false },
  { slug: "delivery-zone-expansion", title: "DROPEE Expands Coverage in Ukhrul", excerpt: "We've expanded our delivery zone to cover more areas.", category: "Delivery Updates", date: "2026-02-05", pinned: false },
];

const Blog = () => {
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

      {/* Categories — horizontal scroll on mobile */}
      <div className="py-4 sm:py-6 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap border border-border bg-background hover:bg-primary/10 hover:text-primary transition-colors touch-manipulation"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatedSection className="py-10 sm:py-16">
        <div className="container mx-auto px-4">
          {/* Pinned Post */}
          {posts.filter(p => p.pinned).map((post) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 ring-2 ring-primary/20"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                <span className="bg-primary/10 text-primary text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">📌 Pinned</span>
                <span className="bg-accent text-accent-foreground text-[10px] sm:text-xs px-2 py-0.5 rounded-full">{post.category}</span>
              </div>
              <h2 className="font-display text-lg sm:text-2xl font-bold mb-1.5 sm:mb-2">{post.title}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" /> {post.date}
                </span>
                <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-primary">
                  Read More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}

          {/* Post Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {posts.filter(p => !p.pinned).map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated p-4 sm:p-5"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <Tag className="w-3 h-3 text-primary" />
                  <span className="text-[10px] sm:text-xs font-medium text-primary">{post.category}</span>
                </div>
                <h3 className="font-display font-bold text-sm sm:text-base mb-1.5 sm:mb-2">{post.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" /> {post.date}
                  </span>
                  <Link to={`/blog/${post.slug}`} className="text-xs sm:text-sm font-medium text-primary">
                    Read →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </>
  );
};

export default Blog;
