import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  path?: string;
  type?: string;
  image?: string;
}

const SITE_URL = "https://dropee.discoverukhrul.site";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

const SEOHead = ({ title, description, path = "/", type = "website", image }: SEOHeadProps) => {
  const url = `${SITE_URL}${path}`;
  const fullTitle = path === "/" ? title : `${title} | DROPEE`;
  const ogImage = image || DEFAULT_IMAGE;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": type === "article" ? "Article" : "WebPage",
    name: fullTitle,
    description,
    url,
    image: ogImage,
    publisher: {
      "@type": "Organization",
      name: "DROPEE",
      url: SITE_URL,
      logo: `${SITE_URL}/pwa-512x512.png`,
    },
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="DROPEE" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default SEOHead;
