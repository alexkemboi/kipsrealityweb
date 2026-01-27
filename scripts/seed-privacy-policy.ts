import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

interface PolicySection {
    title: string;
    intro?: string;
    content: string;
    order: number;
}

async function main() {
    console.log('🔄 Starting Privacy Policy Seeding...\n');

    try {
        // Load the privacy policy data from JSON
        const dataPath = path.join(process.cwd(), 'src', 'app', 'data', 'privacypolicydata.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const policyData = JSON.parse(rawData);

        const { config, policyMetadata, sectionContent } = policyData;

        // Check if policy already exists
        const existingPolicy = await prisma.policy.findFirst({
            where: { companyName: config.companyName }
        });

        if (existingPolicy) {
            console.log('⚠️  Privacy Policy already exists. Deleting old policy and sections...');
            await prisma.section.deleteMany({
                where: { policyId: existingPolicy.id }
            });
            await prisma.policy.delete({
                where: { id: existingPolicy.id }
            });
        }

        // Create the main policy record
        console.log(`📝 Creating Privacy Policy for ${config.companyName}...`);
        const policy = await prisma.policy.create({
            data: {
                title: policyMetadata.title,
                companyName: config.companyName,
                contactEmail: config.contactEmail,
                privacyEmail: config.privacyEmail,
                website: config.website,
                mailingAddress: `${policyData.config.mailingAddress.name}, ${policyData.config.mailingAddress.location}`,
                responseTime: config.responseTime,
                inactiveAccountThreshold: config.inactiveAccountThreshold,
                updatedAt: new Date(),
            },
        });

        console.log(`✅ Policy created with ID: ${policy.id}\n`);

        // Define sections to create with realistic content from JSON
        const sections: PolicySection[] = [
            {
                title: 'Introduction',
                intro: policyMetadata.subtitle,
                content: buildIntroductionContent(config, policyMetadata),
                order: 1,
            },
            {
                title: 'Information We Collect',
                intro: 'We collect various types of information to provide and improve our Services.',
                content: buildDataCollectionContent(policyData.dataCollectionCategories),
                order: 2,
            },
            {
                title: 'How We Use Your Information',
                intro: 'We use the information collected to deliver, maintain, and improve our property management platform.',
                content: buildPlatformModulesContent(policyData.platformModules),
                order: 3,
            },
            {
                title: 'Legal Basis for Processing',
                intro: sectionContent.legal.intro,
                content: buildLegalBasisContent(policyData.legalBases),
                order: 4,
            },
            {
                title: 'Information Sharing and Disclosure',
                intro: sectionContent.sharing.intro,
                content: buildSharingContent(sectionContent.sharing, policyData.serviceProviders),
                order: 5,
            },
            {
                title: 'Data Security',
                intro: sectionContent.security.intro,
                content: buildSecurityContent(policyData.securityMeasures, sectionContent.security),
                order: 6,
            },
            {
                title: 'Data Retention',
                intro: sectionContent.retention.intro,
                content: buildRetentionContent(policyData.retentionPeriods, sectionContent.retention),
                order: 7,
            },
            {
                title: 'Your Privacy Rights',
                intro: sectionContent.rights.intro,
                content: buildPrivacyRightsContent(policyData.privacyRights, sectionContent.rights, config),
                order: 8,
            },
            {
                title: 'Cookies and Tracking Technologies',
                intro: sectionContent.cookies.intro.replace('{companyName}', config.companyName),
                content: buildCookiesContent(policyData.cookieTypes, sectionContent.cookies),
                order: 9,
            },
            {
                title: 'Third-Party Links',
                intro: sectionContent.thirdParty.intro,
                content: buildThirdPartyContent(sectionContent.thirdParty),
                order: 10,
            },
            {
                title: "Children's Privacy",
                intro: sectionContent.children.intro.replace('{companyName}', config.companyName),
                content: buildChildrenContent(sectionContent.children, config),
                order: 11,
            },
            {
                title: 'Changes to This Policy',
                intro: sectionContent.changes.intro,
                content: buildChangesContent(sectionContent.changes),
                order: 12,
            },
            {
                title: 'Contact Us',
                intro: sectionContent.contact.intro,
                content: buildContactContent(config, policyData.config.mailingAddress),
                order: 13,
            },
        ];

        // Create all sections
        console.log('📋 Creating policy sections...');
        for (const section of sections) {
            await prisma.section.create({
                data: {
                    key: section.title.toLowerCase().replace(/['\s]+/g, '-'),
                    title: section.title,
                    intro: section.intro,
                    content: section.content,
                    order: section.order,
                    policyId: policy.id,
                    updatedAt: new Date(),
                },
            });
            console.log(`  ✓ ${section.title}`);
        }

        console.log(`\n✅ Successfully seeded ${sections.length} sections for Privacy Policy!`);
        console.log(`📊 Total records created: 1 Policy + ${sections.length} Sections\n`);
    } catch (error) {
        console.error('❌ Error seeding privacy policy:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Helper functions to build markdown content from JSON data
function buildIntroductionContent(config: any, metadata: any): string {
    return `
## Welcome to ${config.companyName}

${metadata.subtitle}

**Last Updated:** ${config.lastUpdated}

### Scope of This Policy

This Privacy Policy applies to all users of ${config.companyName}, including:
- Property managers and landlords
- Tenants and rental applicants  
- Vendors and service providers
- Administrative users

### Consent Notice

${metadata.consentNotice}

### Geographic Coverage

This policy primarily applies to users located in the United States, with initial operations focused on Washington State (including Seattle, Bellevue, Tacoma, and Spokane).
`;
}

function buildDataCollectionContent(categories: any[]): string {
    let content = '## Data Collection Categories\n\nWe collect the following types of information:\n\n';

    categories.forEach((cat, idx) => {
        content += `### ${idx + 1}. ${cat.title}\n\n`;
        if (cat.intro) content += `${cat.intro}\n\n`;
        cat.items.forEach((item: string) => {
            content += `- ${item}\n`;
        });
        if (cat.note) {
            content += `\n> **Note:** ${cat.note}\n`;
        }
        if (cat.additionalInfo) {
            content += `\n**${cat.additionalInfo}**\n`;
        }
        content += '\n';
    });

    return content;
}

function buildPlatformModulesContent(modules: any[]): string {
    let content = '## Platform Modules\n\nYour data is used across the following platform modules:\n\n';

    modules.forEach((module, idx) => {
        content += `### ${idx + 1}. ${module.name}\n\n`;
        content += `**Data Used:** ${module.dataUsed}\n\n`;
        content += '**Use Cases:**\n';
        module.useCases.forEach((useCase: string) => {
            content += `- ${useCase}\n`;
        });
        content += '\n';
    });

    return content;
}

function buildLegalBasisContent(bases: any[]): string {
    let content = '## Legal Grounds for Processing\n\n';

    bases.forEach((basis) => {
        content += `### ${basis.title}\n\n${basis.description}\n\n`;
    });

    return content;
}

function buildSharingContent(sharing: any, providers: any[]): string {
    let content = `## Our Commitment\n\n> **${sharing.noSellNotice}**\n\n`;
    content += `${sharing.intro}\n\n`;

    sharing.subsections.forEach((sub: any) => {
        content += `### ${sub.title}\n\n${sub.content}\n\n`;
    });

    content += '## Service Providers\n\nWe work with the following trusted partners:\n\n';
    providers.forEach((provider) => {
        content += `- **${provider.category}:** ${provider.providers}\n`;
    });

    return content;
}

function buildSecurityContent(measures: any, sectionContent: any): string {
    let content = `## Security Measures\n\n${sectionContent.intro}\n\n`;

    content += `### ${sectionContent.technicalTitle}\n\n`;
    measures.technical.forEach((measure: any) => {
        content += `- **${measure.name}:** ${measure.description}\n`;
    });

    content += `\n### ${sectionContent.operationalTitle}\n\n`;
    measures.operational.forEach((item: string) => {
        content += `- ${item}\n`;
    });

    content += `\n### ${sectionContent.paymentTitle}\n\n`;
    measures.payment.forEach((item: string) => {
        content += `- ${item}\n`;
    });

    content += `\n### Important Limitation\n\n${sectionContent.limitation}\n`;

    return content;
}

function buildRetentionContent(periods: any[], sectionContent: any): string {
    let content = `## Retention Policy\n\n${sectionContent.intro}\n\n`;

    content += `### ${sectionContent.activeAccounts.title}\n\n${sectionContent.activeAccounts.content}\n\n`;

    content += `### ${sectionContent.legalCompliance.title}\n\n`;
    content += '| Data Category | Retention Period | Reason |\n';
    content += '|--------------|------------------|--------|\n';
    periods.forEach((period) => {
        content += `| ${period.category} | ${period.period} | ${period.reason} |\n`;
    });

    content += `\n### ${sectionContent.inactiveAccounts.title}\n\n${sectionContent.inactiveAccounts.content}\n`;

    return content;
}

function buildPrivacyRightsContent(rights: any[], sectionContent: any, config: any): string {
    let content = `## Your Rights\n\n${sectionContent.intro}\n\n`;

    rights.forEach((right) => {
        content += `### ${right.title}\n\n`;
        right.rights.forEach((r: string) => {
            content += `- ${r}\n`;
        });
        content += '\n';
    });

    content += `## ${sectionContent.exerciseRights.title}\n\n`;
    sectionContent.exerciseRights.steps.forEach((step: any) => {
        const val = step.content.replace('{privacyEmail}', config.privacyEmail);
        content += `**${step.label}:** ${val}\n\n`;
    });

    const responseTime = sectionContent.exerciseRights.responseTime.replace('{responseTime}', config.responseTime);
    content += `${responseTime}\n`;

    return content;
}

function buildCookiesContent(types: any[], sectionContent: any): string {
    let content = `## Cookie Types\n\n${sectionContent.typesTitle}\n\n`;

    types.forEach((type) => {
        content += `### ${type.name}\n\n${type.description}\n\n`;
    });

    content += `## ${sectionContent.choicesTitle}\n\n${sectionContent.choicesContent}\n`;

    return content;
}

function buildThirdPartyContent(thirdParty: any): string {
    return `
${thirdParty.intro}

### ${thirdParty.warning.title}

${thirdParty.warning.content}
`;
}

function buildChildrenContent(children: any, config: any): string {
    return `
${children.intro}

${children.discovery}

${children.contact.replace('{contactEmail}', config.contactEmail)}
`;
}

function buildChangesContent(changes: any): string {
    let content = `${changes.intro}\n\n`;
    content += `## ${changes.notification.title}\n\n`;
    content += `### ${changes.notification.material.title}\n\n${changes.notification.material.content}\n\n`;
    content += `### ${changes.notification.nonMaterial.title}\n\n${changes.notification.nonMaterial.content}\n\n`;
    content += `**Continued Use:** ${changes.continuedUse}\n`;

    return content;
}

function buildContactContent(config: any, mailingAddress: any): string {
    return `
## Contact Information

For questions, concerns, or requests regarding this Privacy Policy or your personal data:

- **Privacy Email:** ${config.privacyEmail}
- **General Contact:** ${config.contactEmail}
- **Website:** ${config.website}

### Mailing Address

${mailingAddress.name}  
${mailingAddress.location}

We will respond to all verified requests within ${config.responseTime}, or as required by applicable law.
`;
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
