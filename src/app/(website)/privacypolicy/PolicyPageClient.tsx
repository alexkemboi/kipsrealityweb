"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, FileText, Search } from "lucide-react";
import dynamic from "next/dynamic";

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

interface PolicyPageClientProps {
    policy: Policy | null;
}

export default function PolicyPageClient({ policy }: PolicyPageClientProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [searchTerm, setSearchTerm] = useState("");

    if (!policy) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
                <div className="text-center py-16">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No privacy policy found.</p>
                </div>
            </div>
        );
    }

    const toggleSection = (sectionId: number) => {
        const key = `${sectionId}`;
        setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const replacePlaceholders = (text: string) =>
        text
            ?.replace(/{companyName}/g, policy.companyName)
            .replace(/{contactEmail}/g, policy.contactEmail)
            .replace(/{privacyEmail}/g, policy.privacyEmail)
            .replace(/{responseTime}/g, policy.responseTime || "")
            .replace(/{inactiveAccountThreshold}/g, policy.inactiveAccountThreshold || "") || "";

    const filteredSections = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        // Map sections with their original index before filtering
        const sectionsWithIndex = policy.sections.map((s, idx) => ({ ...s, originalIndex: idx }));
        if (!term) return sectionsWithIndex;
        // Filter by title only for more intuitive search results
        return sectionsWithIndex.filter((s) => s.title.toLowerCase().includes(term));
    }, [searchTerm, policy.sections]);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Hero Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#003b73] text-xs font-semibold tracking-wide uppercase">
                                Legal
                            </span>
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold tracking-wide uppercase">
                                Privacy
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                            {policy.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-blue-50 text-[#003b73]">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span>Last updated: <span className="font-semibold text-gray-900">
                                    {new Date(policy.updatedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span></span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <span>Contact: </span>
                                <a href={`mailto:${policy.contactEmail}`} className="text-[#003b73] hover:text-[#002952] font-medium transition-colors">
                                    {policy.contactEmail}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                {/* Search & TOC Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-12">
                    <div className="p-8">
                        {/* Search Bar */}
                        <div className="mb-10 relative max-w-2xl">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search sections by title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003b73]/20 focus:border-[#003b73] text-gray-900 transition-all placeholder:text-gray-400 font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const input = document.querySelector('input[placeholder="Search sections by title..."]') as HTMLInputElement;
                                        input?.focus();
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-lg text-gray-400 group-focus-within:text-[#003b73] hover:bg-white hover:shadow-sm transition-all duration-200 cursor-pointer"
                                    aria-label="Search"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Table of Contents */}
                        {policy.sections.length > 0 && (
                            <div>
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <span className="w-8 h-[1px] bg-gray-200"></span>
                                    Table of Contents
                                    <span className="flex-1 h-[1px] bg-gray-200"></span>
                                </h2>
                                <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {policy.sections.map((section, index) => (
                                        <a
                                            key={section.id}
                                            href={`#section-${section.id}`}
                                            className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                        >
                                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-[#003b73] text-xs font-bold mt-0.5 group-hover:bg-[#003b73] group-hover:text-white transition-colors">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors leading-tight">
                                                {section.title}
                                            </span>
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sections List */}
                <div className="space-y-6">
                    {filteredSections.map((section, index) => {
                        const key = `${section.id}`;
                        const isExpanded = expandedSections[key];

                        return (
                            <div
                                key={section.id}
                                id={`section-${section.id}`}
                                className="group bg-white rounded-xl border border-gray-200 hover:border-blue-100 hover:shadow-md transition-all duration-300 scroll-mt-32 overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full px-6 py-5 flex justify-between items-start text-left bg-white"
                                >
                                    <div className="flex-1 flex gap-5">
                                        <span className="hidden sm:flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-[#003b73] text-lg font-bold group-hover:bg-[#003b73] group-hover:text-white transition-all duration-300">
                                            {section.originalIndex + 1}
                                        </span>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#003b73] transition-colors">
                                                <span className="sm:hidden mr-2 text-[#003b73]">{section.originalIndex + 1}.</span>
                                                {replacePlaceholders(section.title)}
                                            </h3>
                                            {section.intro && (
                                                <p className="text-gray-500 text-sm leading-relaxed max-w-3xl">
                                                    {replacePlaceholders(section.intro)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`flex-shrink-0 ml-4 p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-blue-50 rotate-180' : 'bg-gray-50 group-hover:bg-blue-50'}`}>
                                        <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-[#003b73]' : 'text-gray-400 group-hover:text-[#003b73]'}`} />
                                    </div>
                                </button>

                                <div
                                    className={`transition-all duration-300 ease-in-out px-6 ${isExpanded ? 'max-h-[5000px] opacity-100 pb-8' : 'max-h-0 opacity-0 overflow-hidden'
                                        }`}
                                >
                                    <div className="pl-0 sm:pl-[60px] pt-4 border-t border-gray-100">
                                        <div data-color-mode="light" className="prose prose-blue prose-lg max-w-none text-gray-600">
                                            <Markdown source={replacePlaceholders(section.content || "")} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredSections.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 border-dashed">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                            <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No results found</h3>
                        <p className="text-gray-500">
                            We couldn't find any sections matching "{searchTerm}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
