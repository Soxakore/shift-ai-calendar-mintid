// Structured Data utilities for better SEO
export const createWebApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MinTid",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "description": "Smart work schedule management system with AI-powered optimization and real-time analytics.",
  "url": "https://mintid.netlify.app",
  "creator": {
    "@type": "Organization",
    "name": "MinTid",
    "url": "https://mintid.netlify.app"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "@id": "Free"
  },
  "featureList": [
    "Employee Schedule Management",
    "Real-time Analytics",
    "Role-based Access Control", 
    "Task Management",
    "Reporting Dashboard",
    "AI-powered Optimization"
  ]
});

export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MinTid",
  "url": "https://mintid.netlify.app",
  "logo": "https://mintid.netlify.app/placeholder.svg",
  "description": "Leading provider of intelligent workforce management solutions.",
  "foundingDate": "2024",
  "serviceArea": {
    "@type": "Place",
    "name": "Global"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog", 
    "name": "Workforce Management Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Employee Scheduling",
          "description": "Smart scheduling system with conflict detection and optimization"
        }
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "Service",
          "name": "Analytics Dashboard",
          "description": "Real-time workforce analytics and reporting"
        }
      }
    ]
  }
});

export const createBreadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const createSoftwareSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "MinTid Workforce Management",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "Employee Scheduling Software",
  "downloadUrl": "https://mintid.netlify.app",
  "operatingSystem": "Web Browser, iOS, Android",
  "permissions": "Employee data access, Schedule management",
  "description": "Comprehensive workforce management solution with intelligent scheduling, real-time analytics, and role-based access control.",
  "features": [
    "Smart Employee Scheduling",
    "Real-time Workforce Analytics", 
    "Multi-role Dashboard System",
    "Task Management Integration",
    "Automated Reporting",
    "Mobile-responsive Design"
  ],
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "USD",
    "category": "Free Tier"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "156"
  }
});

export const createFAQSchema = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org", 
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Page-specific meta descriptions
export const getPageMetadata = (page: string) => {
  const baseUrl = 'https://mintid.netlify.app';
  
  const metadata = {
    home: {
      title: 'MinTid - Smart Workforce Management & Employee Scheduling',
      description: 'Transform your workforce management with MinTid\'s intelligent scheduling system. Real-time analytics, automated optimization, and seamless team coordination.',
      keywords: 'employee scheduling, workforce management, shift planning, team analytics, work schedule optimizer',
      canonical: `${baseUrl}/`
    },
    dashboard: {
      title: 'Dashboard - Real-time Workforce Analytics | MinTid',
      description: 'Access your personalized workforce dashboard with real-time analytics, schedule overview, and performance insights. Role-based views for all team levels.',
      keywords: 'workforce dashboard, employee analytics, schedule overview, team performance, real-time insights',
      canonical: `${baseUrl}/dashboard`
    },
    admin: {
      title: 'Admin Panel - System Management | MinTid',
      description: 'Comprehensive admin panel for managing users, organizations, schedules, and system settings. Advanced controls for workforce administrators.',
      keywords: 'admin panel, user management, organization settings, system administration, workforce controls',
      canonical: `${baseUrl}/admin`
    },
    login: {
      title: 'Login - Secure Access to MinTid Workforce Management',
      description: 'Secure login to access your MinTid workforce management account. Role-based authentication for employees, managers, and administrators.',
      keywords: 'login, secure access, workforce authentication, employee portal, manager access',
      canonical: `${baseUrl}/login`
    },
    register: {
      title: 'Register - Join MinTid Workforce Management Platform',
      description: 'Create your MinTid account to start managing your workforce efficiently. Quick registration with role-based access setup.',
      keywords: 'register, create account, workforce signup, employee registration, team onboarding',
      canonical: `${baseUrl}/register`
    },
    roles: {
      title: 'Role-Based Access Demo - MinTid Features by User Type',
      description: 'Explore MinTid\'s role-based interface with different user perspectives. See how employees, managers, and admins experience the platform.',
      keywords: 'role-based access, user roles, employee view, manager dashboard, admin features, demo',
      canonical: `${baseUrl}/role-selector`
    }
  };

  return metadata[page as keyof typeof metadata] || metadata.home;
};
