/**
 * SEO Validation and Monitoring System
 * Provides comprehensive SEO validation, monitoring, and reporting
 */

export interface SEOValidationResult {
  score: number;
  passed: number;
  failed: number;
  warnings: number;
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: 'meta' | 'content' | 'technical' | 'performance' | 'accessibility';
  message: string;
  element?: string;
  recommendation?: string;
}

export interface SEORecommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  impact: string;
}

export interface PageSEOMetrics {
  title: string | null;
  titleLength: number;
  description: string | null;
  descriptionLength: number;
  h1Count: number;
  h2Count: number;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  canonicalUrl: string | null;
  metaRobots: string | null;
  openGraphTags: Record<string, string>;
  twitterCardTags: Record<string, string>;
  structuredData: Record<string, unknown>[];
}

/**
 * Validates current page SEO
 */
export const validatePageSEO = (): SEOValidationResult => {
  const issues: SEOIssue[] = [];
  const recommendations: SEORecommendation[] = [];
  const metrics = extractPageMetrics();

  // Title validation
  if (!metrics.title) {
    issues.push({
      type: 'error',
      category: 'meta',
      message: 'Missing page title',
      recommendation: 'Add a descriptive title tag'
    });
  } else if (metrics.titleLength < 30) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Title too short (less than 30 characters)',
      recommendation: 'Expand title to 50-60 characters for better SEO'
    });
  } else if (metrics.titleLength > 60) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Title too long (more than 60 characters)',
      recommendation: 'Shorten title to under 60 characters'
    });
  }

  // Description validation
  if (!metrics.description) {
    issues.push({
      type: 'error',
      category: 'meta',
      message: 'Missing meta description',
      recommendation: 'Add a compelling meta description'
    });
  } else if (metrics.descriptionLength < 120) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Meta description too short (less than 120 characters)',
      recommendation: 'Expand description to 150-160 characters'
    });
  } else if (metrics.descriptionLength > 160) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Meta description too long (more than 160 characters)',
      recommendation: 'Shorten description to under 160 characters'
    });
  }

  // Heading structure validation
  if (metrics.h1Count === 0) {
    issues.push({
      type: 'error',
      category: 'content',
      message: 'Missing H1 tag',
      recommendation: 'Add exactly one H1 tag per page'
    });
  } else if (metrics.h1Count > 1) {
    issues.push({
      type: 'warning',
      category: 'content',
      message: `Multiple H1 tags found (${metrics.h1Count})`,
      recommendation: 'Use only one H1 tag per page'
    });
  }

  // Image optimization validation
  if (metrics.imagesWithoutAlt > 0) {
    issues.push({
      type: 'error',
      category: 'accessibility',
      message: `${metrics.imagesWithoutAlt} images missing alt text`,
      recommendation: 'Add descriptive alt text to all images'
    });
  }

  // Open Graph validation
  const requiredOGTags = ['og:title', 'og:description', 'og:image', 'og:url'];
  const missingOGTags = requiredOGTags.filter(tag => !metrics.openGraphTags[tag]);
  
  if (missingOGTags.length > 0) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: `Missing Open Graph tags: ${missingOGTags.join(', ')}`,
      recommendation: 'Add all required Open Graph tags for social sharing'
    });
  }

  // Twitter Card validation
  if (!metrics.twitterCardTags['twitter:card']) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Missing Twitter Card meta tags',
      recommendation: 'Add Twitter Card meta tags for better social sharing'
    });
  }

  // Canonical URL validation
  if (!metrics.canonicalUrl) {
    issues.push({
      type: 'warning',
      category: 'technical',
      message: 'Missing canonical URL',
      recommendation: 'Add canonical URL to prevent duplicate content issues'
    });
  }

  // Structured data validation
  if (metrics.structuredData.length === 0) {
    recommendations.push({
      priority: 'medium',
      category: 'Technical SEO',
      title: 'Add Structured Data',
      description: 'Implement JSON-LD structured data for better search engine understanding',
      impact: 'Can improve rich snippets and search result appearance'
    });
  }

  // Generate overall recommendations
  if (metrics.internalLinks < 3) {
    recommendations.push({
      priority: 'medium',
      category: 'Content Strategy',
      title: 'Increase Internal Linking',
      description: 'Add more internal links to improve site navigation and SEO',
      impact: 'Helps search engines understand site structure and distributes page authority'
    });
  }

  // Calculate score
  const totalChecks = 10;
  const passed = totalChecks - issues.filter(i => i.type === 'error').length;
  const failed = issues.filter(i => i.type === 'error').length;
  const warnings = issues.filter(i => i.type === 'warning').length;
  const score = Math.round((passed / totalChecks) * 100);

  return {
    score,
    passed,
    failed,
    warnings,
    issues,
    recommendations
  };
};

/**
 * Extracts SEO metrics from current page
 */
export const extractPageMetrics = (): PageSEOMetrics => {
  const title = document.querySelector('title')?.textContent || null;
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || null;
  
  const h1Elements = document.querySelectorAll('h1');
  const h2Elements = document.querySelectorAll('h2');
  const images = document.querySelectorAll('img');
  const links = document.querySelectorAll('a');
  
  const imagesWithoutAlt = Array.from(images).filter(img => !img.alt || img.alt.trim() === '').length;
  
  const internalLinks = Array.from(links).filter(link => {
    const href = link.getAttribute('href');
    return href && (href.startsWith('/') || href.includes(window.location.hostname));
  }).length;
  
  const externalLinks = Array.from(links).filter(link => {
    const href = link.getAttribute('href');
    return href && href.startsWith('http') && !href.includes(window.location.hostname);
  }).length;

  const canonicalUrl = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null;
  const metaRobots = document.querySelector('meta[name="robots"]')?.getAttribute('content') || null;

  // Extract Open Graph tags
  const openGraphTags: Record<string, string> = {};
  document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
    const property = tag.getAttribute('property');
    const content = tag.getAttribute('content');
    if (property && content) {
      openGraphTags[property] = content;
    }
  });

  // Extract Twitter Card tags
  const twitterCardTags: Record<string, string> = {};
  document.querySelectorAll('meta[name^="twitter:"]').forEach(tag => {
    const name = tag.getAttribute('name');
    const content = tag.getAttribute('content');
    if (name && content) {
      twitterCardTags[name] = content;
    }
  });

  // Extract structured data
  const structuredData: Record<string, unknown>[] = [];
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      const data = JSON.parse(script.textContent || '');
      structuredData.push(data);
    } catch (e) {
      // Invalid JSON-LD
    }
  });

  return {
    title,
    titleLength: title?.length || 0,
    description,
    descriptionLength: description?.length || 0,
    h1Count: h1Elements.length,
    h2Count: h2Elements.length,
    imageCount: images.length,
    imagesWithoutAlt,
    internalLinks,
    externalLinks,
    canonicalUrl,
    metaRobots,
    openGraphTags,
    twitterCardTags,
    structuredData
  };
};

/**
 * Real-time SEO monitoring
 */
export class SEOMonitor {
  private observers: MutationObserver[] = [];
  private validationResults: SEOValidationResult | null = null;

  start() {
    // Monitor title changes
    const titleObserver = new MutationObserver(() => {
      this.validateAndReport();
    });

    titleObserver.observe(document.querySelector('title') || document.head, {
      childList: true,
      characterData: true
    });

    // Monitor meta tag changes
    const metaObserver = new MutationObserver(() => {
      this.validateAndReport();
    });

    metaObserver.observe(document.head, {
      childList: true,
      attributes: true,
      attributeFilter: ['content']
    });

    this.observers.push(titleObserver, metaObserver);

    // Initial validation
    this.validateAndReport();
  }

  stop() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  private validateAndReport() {
    this.validationResults = validatePageSEO();
    
    // Log results in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 SEO Validation Results');
      console.log(`Score: ${this.validationResults.score}/100`);
      console.log(`Passed: ${this.validationResults.passed}, Failed: ${this.validationResults.failed}, Warnings: ${this.validationResults.warnings}`);
      
      if (this.validationResults.issues.length > 0) {
        console.group('Issues:');
        this.validationResults.issues.forEach(issue => {
          const emoji = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
          console.log(`${emoji} ${issue.message}`);
        });
        console.groupEnd();
      }

      if (this.validationResults.recommendations.length > 0) {
        console.group('Recommendations:');
        this.validationResults.recommendations.forEach(rec => {
          console.log(`💡 ${rec.title}: ${rec.description}`);
        });
        console.groupEnd();
      }
      
      console.groupEnd();
    }
  }

  getResults(): SEOValidationResult | null {
    return this.validationResults;
  }
}

/**
 * Performance-aware SEO utilities
 */
export const seoUtils = {
  /**
   * Lazy load SEO enhancements
   */
  lazyLoadSEOEnhancements: () => {
    // Lazy load non-critical SEO features
    try {
      import('./analytics').then(({ trackEvent }) => {
        trackEvent('SEO', 'Enhancement Loaded', 'Lazy Load');
      }).catch(() => {
        // Analytics module not available, continue silently
        console.log('SEO enhancements loaded (analytics not available)');
      });
    } catch (error) {
      console.log('SEO enhancements loaded (analytics not available)');
    }
  },

  /**
   * Preload critical SEO resources
   */
  preloadCriticalSEO: () => {
    const head = document.head;
    
    // Preload Open Graph image
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    if (ogImage) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = ogImage;
      link.as = 'image';
      head.appendChild(link);
    }

    // Preload structured data validation
    if (typeof window !== 'undefined') {
      // Schedule validation after page load
      window.addEventListener('load', () => {
        setTimeout(() => validatePageSEO(), 1000);
      });
    }
  },

  /**
   * Generate SEO report
   */
  generateSEOReport: (): string => {
    const results = validatePageSEO();
    const metrics = extractPageMetrics();
    
    let report = `# SEO Analysis Report\n\n`;
    report += `**Overall Score:** ${results.score}/100\n\n`;
    report += `**Summary:** ${results.passed} passed, ${results.failed} failed, ${results.warnings} warnings\n\n`;
    
    if (results.issues.length > 0) {
      report += `## Issues\n\n`;
      results.issues.forEach(issue => {
        const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
        report += `${icon} **${issue.category.toUpperCase()}:** ${issue.message}\n`;
        if (issue.recommendation) {
          report += `   💡 *${issue.recommendation}*\n`;
        }
        report += `\n`;
      });
    }
    
    if (results.recommendations.length > 0) {
      report += `## Recommendations\n\n`;
      results.recommendations.forEach(rec => {
        report += `### ${rec.title} (${rec.priority} priority)\n`;
        report += `${rec.description}\n\n`;
        report += `**Impact:** ${rec.impact}\n\n`;
      });
    }
    
    report += `## Page Metrics\n\n`;
    report += `- **Title:** ${metrics.title || 'Not set'} (${metrics.titleLength} chars)\n`;
    report += `- **Description:** ${metrics.description || 'Not set'} (${metrics.descriptionLength} chars)\n`;
    report += `- **Headings:** ${metrics.h1Count} H1, ${metrics.h2Count} H2\n`;
    report += `- **Images:** ${metrics.imageCount} total, ${metrics.imagesWithoutAlt} missing alt text\n`;
    report += `- **Links:** ${metrics.internalLinks} internal, ${metrics.externalLinks} external\n`;
    report += `- **Open Graph Tags:** ${Object.keys(metrics.openGraphTags).length}\n`;
    report += `- **Structured Data:** ${metrics.structuredData.length} schemas\n`;
    
    return report;
  }
};

// Global SEO monitor instance
export const globalSEOMonitor = new SEOMonitor();
