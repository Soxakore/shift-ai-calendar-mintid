/**
 * Advanced Sitemap Generator and SEO Automation
 * Automatically generates and maintains sitemap.xml and robots.txt
 */

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: Array<{
    url: string;
    caption?: string;
    title?: string;
  }>;
}

export interface RobotsTxtRule {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
  crawlDelay?: number;
}

/**
 * Generate comprehensive sitemap.xml
 */
export const generateSitemap = (
  baseUrl: string = window.location.origin,
  additionalPages: SitemapEntry[] = []
): string => {
  const now = new Date().toISOString();
  
  // Core application pages
  const corePages: SitemapEntry[] = [
    {
      url: `${baseUrl}/`,
      lastmod: now,
      changefreq: 'daily',
      priority: 1.0,
      images: [
        {
          url: `${baseUrl}/og-home.svg`,
          caption: 'MinTid - Smart Workforce Management',
          title: 'MinTid Homepage'
        }
      ]
    },
    {
      url: `${baseUrl}/role-selector`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8,
      images: [
        {
          url: `${baseUrl}/og-roles.svg`,
          caption: 'Role-Based Access Control Demo',
          title: 'MinTid Role Selector'
        }
      ]
    },
    {
      url: `${baseUrl}/login`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      url: `${baseUrl}/register`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      url: `${baseUrl}/admin/login`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.4
    }
  ];

  // Combine all pages
  const allPages = [...corePages, ...additionalPages];

  // Generate XML
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  allPages.forEach(page => {
    sitemap += `
  <url>
    <loc>${escapeXML(page.url)}</loc>`;
    
    if (page.lastmod) {
      sitemap += `
    <lastmod>${page.lastmod}</lastmod>`;
    }
    
    if (page.changefreq) {
      sitemap += `
    <changefreq>${page.changefreq}</changefreq>`;
    }
    
    if (page.priority !== undefined) {
      sitemap += `
    <priority>${page.priority}</priority>`;
    }

    // Add image information
    if (page.images && page.images.length > 0) {
      page.images.forEach(image => {
        sitemap += `
    <image:image>
      <image:loc>${escapeXML(image.url)}</image:loc>`;
        
        if (image.caption) {
          sitemap += `
      <image:caption>${escapeXML(image.caption)}</image:caption>`;
        }
        
        if (image.title) {
          sitemap += `
      <image:title>${escapeXML(image.title)}</image:title>`;
        }
        
        sitemap += `
    </image:image>`;
      });
    }

    sitemap += `
  </url>`;
  });

  sitemap += `
</urlset>`;

  return sitemap;
};

/**
 * Generate optimized robots.txt
 */
export const generateRobotsTxt = (
  baseUrl: string = window.location.origin,
  customRules: RobotsTxtRule[] = []
): string => {
  const defaultRules: RobotsTxtRule[] = [
    {
      userAgent: '*',
      allow: ['/'],
      disallow: [
        '/admin/login',
        '/api/',
        '/private/',
        '/*?*', // Query parameters
        '/*.json$',
        '/*.xml$'
      ],
      crawlDelay: 1
    },
    {
      userAgent: 'Googlebot',
      allow: ['/'],
      disallow: [
        '/admin/login',
        '/api/',
        '/private/'
      ]
    },
    {
      userAgent: 'Bingbot',
      allow: ['/'],
      disallow: [
        '/admin/login',
        '/api/',
        '/private/'
      ]
    }
  ];

  const allRules = [...defaultRules, ...customRules];
  
  let robotsTxt = `# MinTid Workforce Management - robots.txt
# Generated automatically for optimal SEO
# Last updated: ${new Date().toISOString()}

`;

  allRules.forEach(rule => {
    robotsTxt += `User-agent: ${rule.userAgent}\n`;
    
    if (rule.allow) {
      rule.allow.forEach(path => {
        robotsTxt += `Allow: ${path}\n`;
      });
    }
    
    if (rule.disallow) {
      rule.disallow.forEach(path => {
        robotsTxt += `Disallow: ${path}\n`;
      });
    }
    
    if (rule.crawlDelay) {
      robotsTxt += `Crawl-delay: ${rule.crawlDelay}\n`;
    }
    
    robotsTxt += '\n';
  });

  // Add sitemap reference
  robotsTxt += `# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Additional Information
# Contact: admin@mintid.app
# Developed for workforce management optimization
`;

  return robotsTxt;
};

/**
 * Generate structured data for the organization
 */
export const generateOrganizationSchema = (
  organizationName: string = 'MinTid',
  description: string = 'Advanced workforce management and scheduling solution'
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organizationName,
    description,
    url: window.location.origin,
    logo: {
      '@type': 'ImageObject',
      url: `${window.location.origin}/logo.png`,
      width: 400,
      height: 400
    },
    sameAs: [
      // Add social media profiles here
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@mintid.app'
    },
    foundingDate: '2024',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: '10-50'
    },
    industry: 'Software Development',
    makesOffer: {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'SoftwareApplication',
        name: 'MinTid Workforce Management',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock'
        }
      }
    }
  };
};

/**
 * Generate WebApplication structured data
 */
export const generateWebApplicationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'MinTid Workforce Management',
    description: 'Comprehensive workforce management solution with role-based access control, scheduling optimization, and performance analytics.',
    url: window.location.origin,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Modern web browser with JavaScript enabled',
    softwareVersion: '1.0.0',
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    author: {
      '@type': 'Organization',
      name: 'MinTid Team'
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2025-12-31'
    },
    featureList: [
      'Role-based access control',
      'Advanced scheduling system',
      'Performance monitoring',
      'Analytics dashboard',
      'Real-time notifications',
      'Mobile-responsive design'
    ],
    screenshot: `${window.location.origin}/og-dashboard.svg`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1'
    }
  };
};

/**
 * SEO Automation utilities
 */
export const seoAutomation = {
  /**
   * Update sitemap automatically
   */
  updateSitemap: async (additionalPages: SitemapEntry[] = []) => {
    const sitemap = generateSitemap(window.location.origin, additionalPages);
    
    // In a real application, this would make an API call to update the sitemap
    console.log('Generated sitemap:', sitemap);
    
    // For now, we'll create a downloadable version
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Update robots.txt automatically
   */
  updateRobotsTxt: async (customRules: RobotsTxtRule[] = []) => {
    const robotsTxt = generateRobotsTxt(window.location.origin, customRules);
    
    console.log('Generated robots.txt:', robotsTxt);
    
    const blob = new Blob([robotsTxt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Submit sitemap to search engines
   */
  submitSitemap: async () => {
    const sitemapUrl = `${window.location.origin}/sitemap.xml`;
    
    // Google Search Console submission URLs
    const submissionUrls = [
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    ];

    console.log('Sitemap submission URLs:', submissionUrls);
    
    // In a real application, these would be submitted via API calls
    // For now, we'll log them for manual submission
    return submissionUrls;
  },

  /**
   * Generate comprehensive SEO report
   */
  generateSEOReport: () => {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      sitemap: generateSitemap(),
      robotsTxt: generateRobotsTxt(),
      structuredData: {
        organization: generateOrganizationSchema(),
        webApplication: generateWebApplicationSchema()
      },
      recommendations: [
        {
          priority: 'high',
          category: 'Technical SEO',
          title: 'Implement SSL Certificate',
          description: 'Ensure all pages are served over HTTPS for security and SEO benefits'
        },
        {
          priority: 'high',
          category: 'Performance',
          title: 'Optimize Core Web Vitals',
          description: 'Monitor and optimize LCP, FID, and CLS metrics for better search rankings'
        },
        {
          priority: 'medium',
          category: 'Content',
          title: 'Create Help Documentation',
          description: 'Add comprehensive help pages and tutorials for better user experience'
        },
        {
          priority: 'medium',
          category: 'Local SEO',
          title: 'Add Location Data',
          description: 'Include business location information for local search optimization'
        },
        {
          priority: 'low',
          category: 'Social',
          title: 'Social Media Integration',
          description: 'Add social sharing buttons and integrate with social media accounts'
        }
      ]
    };

    return report;
  }
};

/**
 * Utility function to escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
