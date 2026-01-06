import { Helmet } from "react-helmet-async";

export const SEO = ({ title, description, image }) => {

  const siteTitle = "Hi refrigerator!";
  const defaultDesc = "What's in your fridge ? Let's find some recipes ! ";
  const siteUrl = "https://your-deploy-url.vercel.app";
  const defaultImage = "https://placehold.co/1200x630/e67e22/ffffff?text=Hi+Refrigerator";

  return (
    <Helmet>
      <title>{title ? `${title} | ${siteTitle}` : siteTitle}</title>
      <meta name="description" content={description || defaultDesc}  />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title || siteTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={siteUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  )
}