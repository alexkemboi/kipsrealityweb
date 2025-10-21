"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Lock, FileText, Users, Bell, Settings } from 'lucide-react';
import privacyData from '../data/privacypolicydata.json';
import Navbar from '@/components/LandingPage/Navbar';
import Footer from '@/components/LandingPage/Footer';

const {
  config,
  policyMetadata,
  complianceFrameworks,
  dataCollectionCategories,
  platformModules,
  legalBases,
  serviceProviders,
  securityMeasures,
  retentionPeriods,
  privacyRights,
  cookieTypes,
  sectionContent,
  footer,
  compliance,
  buttons,
  navigation
} = privacyData;

// Helper function to replace placeholders
const replacePlaceholders = (text: string): string => {
  return text
    .replace(/{companyName}/g, config.companyName)
    .replace(/{contactEmail}/g, config.contactEmail)
    .replace(/{privacyEmail}/g, config.privacyEmail)
    .replace(/{responseTime}/g, config.responseTime)
    .replace(/{inactiveAccountThreshold}/g, config.inactiveAccountThreshold);
};

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  'FileText': <FileText className="w-5 h-5" />,
  'Users': <Users className="w-5 h-5" />,
  'Settings': <Settings className="w-5 h-5" />,
  'Lock': <Lock className="w-5 h-5" />,
  'Shield': <Shield className="w-5 h-5" />,
  'Bell': <Bell className="w-5 h-5" />
};

const PrivacyPolicy = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Generate sections dynamically
  const sections = [
    {
      id: 'scope',
      title: '1. Scope and Applicability',
      icon: iconMap['FileText'],
      content: (
        <div className="space-y-4">
          <p>{replacePlaceholders(sectionContent.scope.intro)}</p>
          <ul className="list-disc pl-6 space-y-2">
            {sectionContent.scope.userTypes.map((type, i) => (
              <li key={i}>{type}</li>
            ))}
          </ul>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">{sectionContent.scope.geographicCoverage.title}</h4>
            <p>{sectionContent.scope.geographicCoverage.content}</p>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">{sectionContent.scope.regulatoryCompliance.title}</h4>
            <p>{replacePlaceholders(sectionContent.scope.regulatoryCompliance.intro)}</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              {sectionContent.scope.regulatoryCompliance.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'collection',
      title: '2. Information We Collect',
      icon: iconMap['Users'],
      content: (
        <div className="space-y-6">
          {dataCollectionCategories.map((category, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-3">2.{index + 1} {category.title}</h4>
              {category.intro && <p className="mb-2">{category.intro}</p>}
              <ul className="list-disc pl-6 space-y-1">
                {category.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              {category.note && (
                <div className={`bg-${config.colors[category.noteType as keyof typeof config.colors]}-50 border-l-4 border-${config.colors[category.noteType as keyof typeof config.colors]}-500 p-4 mt-3`}>
                  <p className="text-sm"><strong>Important:</strong> {category.note}</p>
                </div>
              )}
              {category.additionalInfo && (
                <p className="mt-3 text-sm"><strong>{category.additionalInfo.split(':')[0]}:</strong> {category.additionalInfo.split(':')[1]}</p>
              )}
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'usage',
      title: '3. How We Use Your Information',
      icon: iconMap['Settings'],
      content: (
        <div className="space-y-6">
          {platformModules.map((module, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-2">3.{index + 1} {module.name}</h4>
              <p className="text-sm mb-2"><strong>Data Used:</strong> {module.dataUsed}</p>
              <p className="text-sm mb-2"><strong>How We Use It:</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                {module.useCases.map((useCase, i) => (
                  <li key={i}>{useCase}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'legal',
      title: '4. Legal Basis for Processing',
      icon: iconMap['FileText'],
      content: (
        <div className="space-y-4">
          <p>{sectionContent.legal.intro}</p>
          <div className="space-y-3">
            {legalBases.map((basis, index) => (
              <div key={index}>
                <h4 className="font-semibold">{basis.title}</h4>
                <p className="text-sm">{basis.description}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'sharing',
      title: '5. Data Sharing and Disclosure',
      icon: iconMap['Users'],
      content: (
        <div className="space-y-4">
          <div className={`bg-${config.colors.accent}-50 border-l-4 border-${config.colors.accent}-500 p-4`}>
            <p className="font-semibold">{sectionContent.sharing.noSellNotice}</p>
          </div>
          
          <p>{sectionContent.sharing.intro}</p>

          {sectionContent.sharing.subsections.map((subsection, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-2">5.{index + 1} {subsection.title}</h4>
              <p className="text-sm mb-2">{subsection.content}</p>
              {index === 0 && (
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  {serviceProviders.map((provider, i) => (
                    <li key={i}><strong>{provider.category}:</strong> {provider.providers}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'security',
      title: '6. Data Security Measures',
      icon: iconMap['Lock'],
      content: (
        <div className="space-y-4">
          <p>{sectionContent.security.intro}</p>
          
          <div>
            <h4 className="font-semibold mb-2">{sectionContent.security.technicalTitle}</h4>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              {securityMeasures.technical.map((measure, index) => (
                <li key={index}><strong>{measure.name}:</strong> {measure.description}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{sectionContent.security.operationalTitle}</h4>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              {securityMeasures.operational.map((measure, index) => (
                <li key={index}>{measure}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{sectionContent.security.paymentTitle}</h4>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              {securityMeasures.payment.map((measure, index) => (
                <li key={index}>{measure}</li>
              ))}
            </ul>
          </div>

          <div className={`bg-${config.colors.warning}-50 border-l-4 border-${config.colors.warning}-500 p-4 mt-4`}>
            <p className="text-sm"><strong>Important Limitation:</strong> {sectionContent.security.limitation}</p>
          </div>
        </div>
      )
    },
    {
      id: 'retention',
      title: '7. Data Retention',
      icon: iconMap['FileText'],
      content: (
        <div className="space-y-4">
          <p>{sectionContent.retention.intro}</p>
          
          <div>
            <h4 className="font-semibold mb-2">{sectionContent.retention.activeAccounts.title}</h4>
            <p className="text-sm">{sectionContent.retention.activeAccounts.content}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{sectionContent.retention.legalCompliance.title}</h4>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              {retentionPeriods.map((period, index) => (
                <li key={index}><strong>{period.category}:</strong> {period.period} ({period.reason})</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{sectionContent.retention.inactiveAccounts.title}</h4>
            <p className="text-sm">{replacePlaceholders(sectionContent.retention.inactiveAccounts.content)}</p>
          </div>
        </div>
      )
    },
    {
      id: 'rights',
      title: '8. Your Privacy Rights',
      icon: iconMap['Shield'],
      content: (
        <div className="space-y-4">
          <p>{sectionContent.rights.intro}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {privacyRights.map((right, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded">
                <h4 className="font-semibold mb-2">{right.title}</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  {right.rights.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">{sectionContent.rights.exerciseRights.title}</h4>
            <ol className="list-decimal pl-6 space-y-2 text-sm">
              {sectionContent.rights.exerciseRights.steps.map((step, index) => (
                <li key={index}>
                  <strong>{step.label}:</strong> {replacePlaceholders(step.content)}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm">
              <strong>Response Time:</strong> {replacePlaceholders(sectionContent.rights.exerciseRights.responseTime)}
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'cookies',
      title: '9. Cookies and Tracking Technologies',
      icon: iconMap['Settings'],
      content: (
        <div className="space-y-4">
          <p>{replacePlaceholders(sectionContent.cookies.intro)}</p>
          
          <div>
            <h4 className="font-semibold mb-2">{sectionContent.cookies.typesTitle}</h4>
            <div className="space-y-3">
              {cookieTypes.map((cookie, index) => (
                <div key={index}>
                  <p className="font-medium text-sm">{cookie.name}</p>
                  <p className="text-sm">{cookie.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{sectionContent.cookies.choicesTitle}</h4>
            <p className="text-sm">{sectionContent.cookies.choicesContent}</p>
          </div>
        </div>
      )
    },
    {
      id: 'thirdparty',
      title: '10. Third-Party Services and Links',
      icon: iconMap['FileText'],
      content: (
        <div className="space-y-4">
          <p>{sectionContent.thirdParty.intro}</p>
          <div className={`bg-${config.colors.warning}-50 border-l-4 border-${config.colors.warning}-500 p-4`}>
            <p className="font-semibold text-sm">{sectionContent.thirdParty.warning.title}</p>
            <p className="text-sm mt-1">{sectionContent.thirdParty.warning.content}</p>
          </div>
        </div>
      )
    },
    {
      id: 'children',
      title: "11. Children's Privacy",
      icon: iconMap['Shield'],
      content: (
        <div className="space-y-4">
          <p>{replacePlaceholders(sectionContent.children.intro)}</p>
          <p>{sectionContent.children.discovery}</p>
          <p>{replacePlaceholders(sectionContent.children.contact)}</p>
        </div>
      )
    },
    {
      id: 'changes',
      title: '12. Changes to This Policy',
      icon: iconMap['Bell'],
      content: (
        <div className="space-y-4">
          <p>{sectionContent.changes.intro}</p>
          
          <div>
            <h4 className="font-semibold mb-2">{sectionContent.changes.notification.title}</h4>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-sm">{sectionContent.changes.notification.material.title}</p>
                <p className="text-sm">{sectionContent.changes.notification.material.content}</p>
              </div>
              <div>
                <p className="font-medium text-sm">{sectionContent.changes.notification.nonMaterial.title}</p>
                <p className="text-sm">{sectionContent.changes.notification.nonMaterial.content}</p>
              </div>
            </div>
          </div>

          <div className={`bg-${config.colors.primary}-50 border-l-4 border-${config.colors.primary}-500 p-4`}>
            <p className="text-sm"><strong>Your Continued Use:</strong> {sectionContent.changes.continuedUse}</p>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      title: '13. Contact Information',
      icon: iconMap['Bell'],
      content: (
        <div className="space-y-4">
          <p>{sectionContent.contact.intro}</p>
          <div className="bg-gray-50 p-4 rounded space-y-2">
            <p><strong>Email:</strong> {config.contactEmail}</p>
            <p><strong>Website:</strong> {config.website}</p>
            <p><strong>Mailing Address:</strong><br />{config.mailingAddress.name}<br />{config.mailingAddress.location}</p>
          </div>
        </div>
      )
    },
    {
      id: 'state',
      title: '14. State-Specific Rights',
      icon: iconMap['FileText'],
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">{sectionContent.state.washington.title}</h4>
            <p className="text-sm">{sectionContent.state.washington.content}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{sectionContent.state.california.title}</h4>
            <p className="text-sm">{sectionContent.state.california.content}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{sectionContent.state.other.title}</h4>
            <p className="text-sm">{sectionContent.state.other.content}</p>
          </div>
        </div>
      )
    }
  ];

  // Create searchable text index for each section
  const getSearchableText = (sectionId: string): string => {
    const searchableContent: Record<string, string> = {
      'scope': `${sectionContent.scope.intro} ${sectionContent.scope.userTypes.join(' ')} ${sectionContent.scope.geographicCoverage.content} ${sectionContent.scope.regulatoryCompliance.items.join(' ')}`,
      'collection': dataCollectionCategories.map(cat => `${cat.title} ${cat.items.join(' ')} ${cat.note || ''} ${cat.additionalInfo || ''}`).join(' '),
      'usage': platformModules.map(mod => `${mod.name} ${mod.dataUsed} ${mod.useCases.join(' ')}`).join(' '),
      'legal': `${sectionContent.legal.intro} ${legalBases.map(b => `${b.title} ${b.description}`).join(' ')}`,
      'sharing': `${sectionContent.sharing.noSellNotice} ${sectionContent.sharing.intro} ${sectionContent.sharing.subsections.map(s => `${s.title} ${s.content}`).join(' ')} ${serviceProviders.map(p => `${p.category} ${p.providers}`).join(' ')}`,
      'security': `${sectionContent.security.intro} ${securityMeasures.technical.map(m => `${m.name} ${m.description}`).join(' ')} ${securityMeasures.operational.join(' ')} ${securityMeasures.payment.join(' ')} ${sectionContent.security.limitation}`,
      'retention': `${sectionContent.retention.intro} ${sectionContent.retention.activeAccounts.content} ${retentionPeriods.map(p => `${p.category} ${p.period} ${p.reason}`).join(' ')} ${sectionContent.retention.inactiveAccounts.content}`,
      'rights': `${sectionContent.rights.intro} ${privacyRights.map(r => `${r.title} ${r.rights.join(' ')}`).join(' ')} ${sectionContent.rights.exerciseRights.steps.map(s => `${s.label} ${s.content}`).join(' ')}`,
      'cookies': `${sectionContent.cookies.intro} ${cookieTypes.map(c => `${c.name} ${c.description}`).join(' ')} ${sectionContent.cookies.choicesContent}`,
      'thirdparty': `${sectionContent.thirdParty.intro} ${sectionContent.thirdParty.warning.content}`,
      'children': `${sectionContent.children.intro} ${sectionContent.children.discovery} ${sectionContent.children.contact}`,
      'changes': `${sectionContent.changes.intro} ${sectionContent.changes.notification.material.content} ${sectionContent.changes.notification.nonMaterial.content} ${sectionContent.changes.continuedUse}`,
      'contact': `${sectionContent.contact.intro} ${config.contactEmail} ${config.website}`,
      'state': `${sectionContent.state.washington.content} ${sectionContent.state.california.content} ${sectionContent.state.other.content}`
    };
    
    return replacePlaceholders(searchableContent[sectionId] || '');
  };

  const filteredSections = sections.filter(section => {
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = section.title.toLowerCase().includes(searchLower);
    const contentMatch = getSearchableText(section.id).toLowerCase().includes(searchLower);
    return titleMatch || contentMatch;
  });

  return (
    <div className="min-h-screen bg-[#041126]">
        <Navbar/>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{policyMetadata.title}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {policyMetadata.subtitle}
          </p>
          <div className="mt-6 bg-blue-100 border border-blue-300 rounded-lg p-4 inline-block">
            <p className="text-sm text-blue-900">
              <strong>Last Updated:</strong> {config.lastUpdated}
            </p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-600 text-white rounded-lg p-6 mb-8">
          <p className="text-center">
            <strong>{policyMetadata.consentNotice}</strong>
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder={navigation.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">{navigation.quickNavTitle}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  toggleSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-left px-4 py-2 rounded hover:bg-blue-50 transition-colors text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                {section.icon}
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {filteredSections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-blue-600">{section.icon}</div>
                  <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {expandedSections[section.id] && (
                <div className="px-6 py-4 border-t border-gray-200 text-gray-700">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Compliance Statement */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-black">
          <h3 className="text-2xl font-bold mb-4">{compliance.title}</h3>
          <p className="mb-4">{replacePlaceholders(compliance.intro)}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {complianceFrameworks.map((framework, index) => (
              <div key={index} className="bg-white bg-opacity-10 rounded p-4">
                <p className="font-semibold mb-1">{framework.name}</p>
                <p className="text-sm">{framework.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm">{compliance.outro}</p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-4">{replacePlaceholders(footer.thankYou)}</p>
          <p className="font-semibold">{replacePlaceholders(footer.commitment)}</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => window.location.href = `mailto:${config.privacyEmail}`}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            {buttons.contactPrivacy}
          </button>
          <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
            {buttons.downloadPdf}
          </button>
          <button 
            onClick={() => window.location.href = `mailto:${config.privacyEmail}?subject=Privacy Request`}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            {buttons.exerciseRights}
          </button>
        </div>
      </div>
    <Footer/>
    </div>
  );
};

export default PrivacyPolicy;