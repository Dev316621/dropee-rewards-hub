import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  path?: string;
  type?: string;
}

const SEOHead = ({ title, description, path = "/", type = "website" }: SEOHeadProps) => {
  const url = `https://dropee.discoverukhrul.site${path}`;
  const fullTitle = path === "/" ? title : `${title} | DROPEE`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content="https://dropee.discoverukhrul.site/og-image.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://dropee.discoverukhrul.site/og-image.png" />
    </Helmet>
  );
};

export default SEOHead;
