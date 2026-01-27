"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQ {
    question: string;
    answer: string;
}

const faqs: FAQ[] = [
    {
        question: "What is rental property management software?",
        answer: "Rental property management software is a digital platform designed to help landlords and property managers streamline their operations. It centralizes tasks like rent collection, tenant communication, maintenance tracking, lease management, and financial reporting in one easy-to-use system."
    },
    {
        question: "Why do you need property management software?",
        answer: "Property management software saves time and reduces errors by automating repetitive tasks like rent collection, late fee calculations, and maintenance requests. It provides better organization, improves tenant satisfaction, ensures regulatory compliance, and gives you real-time insights into your property portfolio's financial performance."
    },
    {
        question: "Who can use rental property management software?",
        answer: "RentFlow360 is designed for individual landlords managing a few units, professional property managers handling multiple properties, and real estate companies overseeing large portfolios. Whether you're just starting out or managing hundreds of units, our scalable platform adapts to your needs."
    },
    {
        question: "What features should you look for in rental property management software?",
        answer: "Essential features include online rent collection, tenant screening, lease management, maintenance request tracking, financial reporting, tenant portals, automated reminders, and mobile access. RentFlow360 offers all these features plus advanced analytics, document storage, and seamless integrations with accounting software."
    },
    {
        question: "What problems does property management software solve?",
        answer: "It eliminates manual paperwork, prevents missed rent payments, streamlines maintenance coordination, reduces tenant disputes through clear communication, ensures lease compliance, simplifies tax preparation with organized financial records, and provides visibility across your entire property portfolio from anywhere."
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="px-6 py-12 bg-slate-50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#003b73] mb-3">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-neutral-600 max-w-2xl mx-auto">
                        Got questions? We've got answers. If you don't see what you're looking for, feel free to contact us.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl border border-neutral-200 overflow-hidden transition-all duration-200 hover:shadow-md"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-50"
                            >
                                <span className="font-semibold text-neutral-900 pr-4">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-[#003b73] shrink-0 transition-transform duration-200 ${openIndex === index ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-200 ${openIndex === index ? "max-h-96" : "max-h-0"
                                    }`}
                            >
                                <div className="px-5 pb-5 pt-0 text-neutral-600 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
