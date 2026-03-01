import React from "react";

interface LegalPageJsonLdProps {
  policyType: "privacy" | "terms" | "cookie" | "disclaimer";
  title?: string;
  companyName?: string;
  url: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  contactEmail?: string;
  siteUrl?: string;
}

const LegalPageJsonLd: React.FC<LegalPageJsonLdProps> = ({
  policyType,
  title,
  companyName,
  url,
  description,
  datePublished,
  dateModified,
  contactEmail,
  siteUrl,
}) => {
  const legalName = title || `${policyType.charAt(0).toUpperCase() + policyType.slice(1)} Policy`;
  const publisherName = companyName || "RentFlow360";
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalDocument",
    "name": legalName,
    "description": description || `The ${legalName} for ${publisherName}`,
    "url": url,
    "publisher": {
      "@type": "Organization",
      "name": publisherName,
      "url": siteUrl || "https://rentflow360.com",
    },
    "datePublished": datePublished || new Date().toISOString(),
    "dateModified": dateModified || datePublished || new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": publisherName,
      "email": contactEmail,
      "url": siteUrl || "https://rentflow360.com",
    },
    "keywords": `${policyType} policy, legal document, ${publisherName}`,
    "inLanguage": "en-US",
    "license": "https://creativecommons.org/licenses/by/4.0/",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default LegalPageJsonLd;