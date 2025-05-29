import React from 'react';
import { Helmet } from 'react-helmet-async';
import { OG_IMAGES } from '@/lib/ogImage';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
  pageName?: keyof typeof OG_IMAGES;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'MinTid - Smart Work Schedule Management',
  description = 'Streamline your workforce management with MinTid\'s intelligent scheduling system. Real-time analytics, role-based access, and AI-powered optimization.',
  keywords = 'work schedule, employee management, shift planning, workforce analytics, team scheduling, time tracking',
  canonicalUrl,
  ogImage,
  ogType = 'website',
  structuredData,
  pageName = 'home'
}) => {
  const fullTitle = title.includes('MinTid') ? title : `${title} | MinTid`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const canonical = canonicalUrl || currentUrl;
  
  // Use generated OG image if no custom image provided
  const finalOgImage = ogImage || OG_IMAGES[pageName] || OG_IMAGES.home;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="MinTid" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/svg+xml" />
      <meta property="og:site_name" content="MinTid" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalOgImage} />
      <meta name="twitter:image:alt" content={`${title} - MinTid Workforce Management`} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
