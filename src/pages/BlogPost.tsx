import { useParams, Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

const posts: Record<string, { title: string; category: string; date: string; content: string }> = {
  "double-points-week-ukhrul": {
    title: "Double Points Week is Here!",
    category: "Promotions",
    date: "2026-02-20",
    content: `Great news for all DROPEE customers in Ukhrul! This week, every delivery earns you 4 loyalty points instead of the usual 2.\n\nThat means you can reach the 20-point threshold for a free delivery in just 5 deliveries instead of 10.\n\nCombine this with your Daily and Weekly Mega Spins on the DROPEE wheel to stack even more points and unlock free deliveries faster.\n\nThis promotion runs through the end of the week. Don't miss out — make every delivery count!`,
  },
  "rain-season-delivery-update": {
    title: "Rain Season Delivery Schedule Update",
    category: "Rain Season",
    date: "2026-02-18",
    content: `As monsoon season approaches Ukhrul, we're adjusting our delivery schedules to ensure safety and reliability.\n\nUpdated slots:\n- Morning: 8:00 AM – 10:30 AM\n- Afternoon: 12:30 PM – 3:00 PM\n- Evening: 4:00 PM – 5:30 PM\n\nDuring heavy rainfall, deliveries may be temporarily paused for safety. We'll notify you via the app if your delivery is affected.\n\nStay safe, Ukhrul! 🌧️`,
  },
  "new-partner-mountain-cafe": {
    title: "Welcome Mountain Café to DROPEE Partners",
    category: "Partner News",
    date: "2026-02-15",
    content: `We're thrilled to welcome Mountain Café as our newest partner!\n\nMountain Café serves authentic Tangkhul cuisine alongside freshly brewed mountain coffee. Now you can get their delicious food delivered straight to your door through DROPEE.\n\nSpecial launch offer: Free delivery on all Mountain Café orders above ₹300! This offer is exclusive to DROPEE customers.\n\nOrder now and experience the taste of Ukhrul's finest.`,
  },
  "ukhrul-festival-bonus": {
    title: "Ukhrul Festival — Triple Points Event!",
    category: "Events",
    date: "2026-02-10",
    content: `Celebrate with DROPEE during the Ukhrul Festival!\n\nFor the entire festival weekend, every delivery earns you 6 loyalty points instead of 2. That's triple the rewards!\n\nPlus, the Weekly Mega Spin will have boosted prizes during the festival — including chances to win up to 20 bonus points and exclusive partner discount codes.\n\nLet's celebrate together, Ukhrul! 🎉`,
  },
  "delivery-zone-expansion": {
    title: "DROPEE Expands Coverage in Ukhrul",
    category: "Delivery Updates",
    date: "2026-02-05",
    content: `DROPEE is growing!\n\nWe've expanded our delivery coverage to include more areas around Ukhrul town. The new zones include extended residential areas and nearby villages within a 12km radius.\n\nIf you weren't able to use DROPEE before, check again — your area might now be covered!\n\nAs always, standard rates apply for packages up to 7kg. For larger packages, per-kg charges apply above the 7kg threshold.`,
  },
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? posts[slug] : null;

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "datePublished": post.date,
        "author": { "@type": "Organization", "name": "DROPEE" },
        "publisher": { "@type": "Organization", "name": "DROPEE" },
      })}} />

      <section className="hero-section py-24 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-1 text-primary-foreground/60 hover:text-primary-foreground text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1 text-xs text-primary-foreground/60">
              <Calendar className="w-3 h-3" /> {post.date}
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

      <AnimatedSection className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-lg max-w-none">
            {post.content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </>
  );
};

export default BlogPost;
