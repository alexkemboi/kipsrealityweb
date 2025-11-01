"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, FileText, Users, Lock, Shield, Bell, Settings, Search } from "lucide-react";
import dynamic from "next/dynamic";
import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";

const Markdown = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

export interface Section {
  id: number;
  title: string;
  intro?: string;
  content?: string;
}

export interface Policy {
  id: number;
  title: string;
  companyName: string;
  contactEmail: string;
  privacyEmail: string;
  website?: string;
  mailingAddress?: string;
  responseTime?: string;
  inactiveAccountThreshold?: string;
  createdAt: string;
  updatedAt: string;
  sections: Section[];
}

const iconMap: Record<string, React.ReactNode> = {
  default: <FileText className="w-5 h-5 text-blue-600" />,
  Users: <Users className="w-5 h-5 text-blue-600" />,
  Settings: <Settings className="w-5 h-5 text-blue-600" />,
  Lock: <Lock className="w-5 h-5 text-blue-600" />,
  Shield: <Shield className="w-5 h-5 text-blue-600" />,
  Bell: <Bell className="w-5 h-5 text-blue-600" />,
};

const PolicyListPage = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    const res = await fetch("/api/policies");
    const data = await res.json();

    // Ensure sections is always an array
    setPolicies(
      data.map((p: Policy) => ({
        ...p,
        sections: p.sections || [], //  default empty array if undefined
        updatedAt: new Date(p.updatedAt).toISOString(),
      }))
    );
  };

  const toggleSection = (policyId: number, sectionId: number) => {
    const key = `${policyId}-${sectionId}`;
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const replacePlaceholders = (text: string, policy: Policy) =>
    text
      ?.replace(/{companyName}/g, policy.companyName)
      .replace(/{contactEmail}/g, policy.contactEmail)
      .replace(/{privacyEmail}/g, policy.privacyEmail)
      .replace(/{responseTime}/g, policy.responseTime || "")
      .replace(/{inactiveAccountThreshold}/g, policy.inactiveAccountThreshold || "") || "";

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.sections.some((s) =>
        (s.title + (s.intro || "") + (s.content || "")).toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-[#041126]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Privacy Policies</h1>
          <p className="text-blue-200 text-lg">Transparent. Clear. Comprehensive.</p>
        </div>

        {/* Search Bar */}
        <div className="mb-10 relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search policies, sections, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-blue-600/30 bg-white/95 backdrop-blur rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 shadow-lg"
          />
        </div>

        {/* Policies */}
        <div className="space-y-8">
          {filteredPolicies.map((policy) => (
            <div key={policy.id} className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
              {/* Policy Header */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6 border-b-2 border-blue-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{policy.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold">Contact:</span> {policy.contactEmail}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="flex items-center gap-1">
                    <span className="font-semibold">Privacy:</span> {policy.privacyEmail}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">
                    Updated: {new Date(policy.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Quick Nav */}
              {policy.sections.length > 0 && (
                <div className="px-8 py-4 bg-gray-50 border-b flex flex-wrap gap-2">
                  {policy.sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#policy-${policy.id}-section-${section.id}`}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              )}

              {/* Sections */}
              {policy.sections.map((section) => {
                const key = `${policy.id}-${section.id}`;
                const isExpanded = expandedSections[key];

                return (
                  <div key={section.id} id={`policy-${policy.id}-section-${section.id}`} className="border-b last:border-b-0">
                    <button
                      onClick={() => toggleSection(policy.id, section.id)}
                      className="w-full px-8 py-5 flex justify-between items-center text-left hover:bg-blue-50/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                          {iconMap[section.title] || iconMap.default}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {replacePlaceholders(section.title, policy)}
                          </h3>
                          {section.intro && (
                            <p className="text-sm text-gray-600 mt-1">{replacePlaceholders(section.intro, policy)}</p>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                        )}
                      </div>
                    </button>

                    {isExpanded && section.content && (
                      <div data-color-mode="light" className="px-8 py-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
                        <div className="bg-white rounded-xl p-6 shadow-inner border border-gray-200">
                          <Markdown source={replacePlaceholders(section.content, policy)} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {filteredPolicies.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No policies found matching your search.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PolicyListPage;
