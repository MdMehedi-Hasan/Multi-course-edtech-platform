import React, { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: string;
  ogImage?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = 'EduNexus is the premier enterprise learning platform for software developers, cloud architects, and tech leaders.',
  canonicalUrl,
  ogType = 'website',
  ogImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',
}) => {
  useEffect(() => {
    const fullTitle = `${title} | EduNexus Enterprise EdTech`;
    document.title = fullTitle;

    // Helper to set or create meta tag
    const setMetaTag = (attr: string, key: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to set or create link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', ogImage);

    const currentUrl = canonicalUrl || window.location.href;
    setMetaTag('property', 'og:url', currentUrl);
    setLinkTag('canonical', currentUrl);
  }, [title, description, canonicalUrl, ogType, ogImage]);

  return null;
};
