"use client";
import React, { JSX, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import privacyData from "../../data/privacypolicydata.json";
import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";

type SectionContentType = {
  [key: string]: any;
};

const { config, sectionContent, navigation, policyMetadata, footer } = privacyData as {
  config: any;
  sectionContent: SectionContentType;
  navigation: any;
  policyMetadata: any;
  footer: any;
};

// Icon map
const iconMap: Record<string, React.ReactNode> = {
  FileText: <ChevronDown className="w-5 h-5" />,
  Users: <ChevronDown className="w-5 h-5" />,
  Settings: <ChevronDown className="w-5 h-5" />,
  Lock: <ChevronDown className="w-5 h-5" />,
  Shield: <ChevronDown className="w-5 h-5" />,
  Bell: <ChevronDown className="w-5 h-5" />,
};

// Replace placeholders
const replacePlaceholders = (text: string): string =>
  text
    ? text
        .replace(/{companyName}/g, config.companyName)
        .replace(/{contactEmail}/g, config.contactEmail)
        .replace(/{privacyEmail}/g, config.privacyEmail)
        .replace(/{responseTime}/g, config.responseTime)
        .replace(/{inactiveAccountThreshold}/g, config.inactiveAccountThreshold)
    : "";

// Recursive render for nested content with styling
const renderContent = (content: any, level = 0): JSX.Element => {
  if (!content) return <></>;

  const indent = `pl-${level * 4}`; // Tailwind padding for nested content

  if (typeof content === "string") {
    return <p className={`mb-2 ${indent}`}>{replacePlaceholders(content)}</p>;
  }

  if (Array.isArray(content)) {
    return (
      <ul className={`list-disc space-y-1 mb-2 ${indent}`}>
        {content.map((item, idx) => (
          <li key={idx}>{renderContent(item, level + 1)}</li>
        ))}
      </ul>
    );
  }

  if (typeof content === "object") {
    return (
      <div className={`space-y-2 mb-2 ${indent}`}>
        {Object.keys(content).map((key) => (
          <div key={key}>
            {key === "title" && (
              <h3 className={`font-semibold text-gray-900 mb-1 ${indent}`}>
                {replacePlaceholders(content[key])}
              </h3>
            )}
            {key === "intro" && <p className={`mb-2 ${indent}`}>{replacePlaceholders(content[key])}</p>}
            {key !== "title" && key !== "intro" && renderContent(content[key], level + 1)}
          </div>
        ))}
      </div>
    );
  }

  return <>{String(content)}</>;
};

const PrivacyPolicy = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Map sections from JSON
  const sections = Object.keys(sectionContent).map((key) => ({
    id: key,
    title: sectionContent[key].title || key,
    icon: iconMap[key] || <ChevronDown className="w-5 h-5" />,
    content: sectionContent[key],
  }));

  // Search filter
  const filteredSections = sections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(section.content).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#041126]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 text-white">
          <h1 className="text-4xl font-bold mb-4">{policyMetadata.title}</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">{policyMetadata.subtitle}</p>
          <div className="mt-6 bg-blue-100 border border-blue-300 rounded-lg p-4 inline-block text-blue-900">
            <strong>Last Updated:</strong> {config.lastUpdated}
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder={navigation.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {filteredSections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-blue-600">{section.icon}</div>
                  <h2 className="text-xl font-semibold text-gray-900">{replacePlaceholders(section.title)}</h2>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections[section.id] && (
                <div className="px-6 py-4 border-t border-gray-200 text-gray-700">
                  {renderContent(section.content)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-4">{replacePlaceholders(footer.thankYou)}</p>
          <p className="font-semibold">{replacePlaceholders(footer.commitment)}</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
