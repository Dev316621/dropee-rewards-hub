import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft, Calendar, Tag, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug!)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-24">
        <div className="container mx-auto px-4 max-w-3xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-primary hover:underline">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={post.title} description={post.excerpt || post.title} path={`/blog/${post.slug}`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "datePublished": post.published_at || post.created_at,
        "image": post.image_url || undefined,
        "author": { "@type": "Organization", "name": "DROPEE" },
        "publisher": { "@type": "Organization", "name": "DROPEE" },
      })}} />

      <section className="hero-section py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-1 text-primary-foreground/60 hover:text-primary-foreground text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-primary-foreground/60">
              <Calendar className="w-3 h-3" /> {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
            </span>
            <span className="flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              <Tag className="w-3 h-3" /> {post.category}
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
            {post.title}
          </h1>
        </div>
      </section>

      <AnimatedSection className="py-12 sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {post.image_url && (
            <img src={post.image_url} alt={post.title} className="w-full h-48 sm:h-72 object-cover rounded-xl mb-8" />
          )}

          {post.video_url && (
            <div className="aspect-video mb-8 rounded-xl overflow-hidden">
              <iframe src={post.video_url} className="w-full h-full" allowFullScreen title={post.title} />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {(post.content || "").split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Booking CTA if enabled */}
          {(post as any).booking_enabled && (
            <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
              <Ticket className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold mb-2">
                {(post as any).booking_label || "Book Now"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Interested? Book a delivery for this event or offer.</p>
              <Link to="/book">
                <Button className="gap-2">
                  <Ticket className="w-4 h-4" /> Book a Service
                </Button>
              </Link>
            </div>
          )}
        </div>
      </AnimatedSection>
    </>
  );
};

export default BlogPost;
