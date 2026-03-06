import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/Getcurrentuser';
import { prisma } from '@/lib/db';
import { listingReportingService } from '@/lib/listing-reporting-service';

interface PropertyExportFilters {
    organizationId?: string;
    includeListingStatus?: boolean;
    includeMetrics?: boolean;
    includeUnits?: boolean;
    startDate?: Date;
    endDate?: Date;
}

interface PropertyExportOptions {
    format: 'CSV' | 'JSON' | 'PDF';
    includeCharts?: boolean;
    customFields?: string[];
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { filters, options }: { filters?: PropertyExportFilters; options?: PropertyExportOptions } = body;

        // Validate export format
        const validFormats = ['CSV', 'JSON', 'PDF'];
        if (options?.format && !validFormats.includes(options.format)) {
            return NextResponse.json(
                { error: 'Invalid export format. Supported formats: CSV, JSON, PDF' },
                { status: 400 }
            );
        }

        // Get properties with listing information
        const properties = await prisma.property.findMany({
            where: {
                ...(filters?.organizationId && { organizationId: filters.organizationId }),
                ...(filters?.startDate && filters?.endDate && {
                    createdAt: {
                        gte: filters.startDate,
                        lte: filters.endDate
                    }
                })
            },
            include: {
                units: {
                    include: {
                        listing: {
                            include: {
                                status: true,
                                auditEntries: true
                            }
                        },
                        tenantApplications: true,
                        leases: true
                    }
                },
                organization: true
            }
        });

        // Enhance properties with listing metrics if requested
        const enhancedProperties = await Promise.all(
            properties.map(async (property) => {
                const baseProperty = {
                    id: property.id,
                    name: property.name,
                    address: property.address,
                    city: property.city,
                    state: property.country || '',
                    zipCode: property.zipCode,
                    totalUnits: property.units.length,
                    createdAt: property.createdAt,
                    organizationName: property.organization?.name
                };

                if (filters?.includeListingStatus) {
                    const listedUnits = property.units.filter(unit => 
                        unit.listing && unit.listing.status?.name === 'ACTIVE'
                    ).length;
                    const privateUnits = property.units.filter(unit => 
                        !unit.listing || unit.listing.status?.name === 'PRIVATE'
                    ).length;
                    const suspendedUnits = property.units.filter(unit => 
                        unit.listing && unit.listing.status?.name === 'SUSPENDED'
                    ).length;

                    Object.assign(baseProperty, {
                        listedUnits,
                        privateUnits,
                        suspendedUnits,
                        listingStatusDistribution: {
                            active: listedUnits,
                            private: privateUnits,
                            suspended: suspendedUnits
                        }
                    });
                }

                if (filters?.includeMetrics) {
                    const performanceReport = await listingReportingService.getPropertyPerformance(property.id);
                    if (performanceReport) {
                        Object.assign(baseProperty, {
                            averageDaysToLease: performanceReport.averageDaysToLease,
                            totalApplications: performanceReport.totalApplications,
                            conversionRate: performanceReport.conversionRate,
                            totalRevenue: performanceReport.totalRevenue,
                            occupancyRate: performanceReport.occupancyRate
                        });
                    }
                }

                if (filters?.includeUnits) {
                    const unitsData = property.units.map(unit => ({
                        unitNumber: unit.unitNumber,
                        rent: unit.rentAmount,
                        bedrooms: unit.bedrooms,
                        bathrooms: unit.bathrooms,
                        listingStatus: unit.listing?.status?.name || 'PRIVATE',
                        applicationCount: unit.tenantApplications.length,
                        hasActiveLease: unit.leases.some(lease => lease.leaseStatus === 'ACTIVE'),
                        listingCreatedAt: unit.listing?.createdAt,
                        daysListed: unit.listing ? 
                            Math.ceil((new Date().getTime() - unit.listing.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0
                    }));
                    Object.assign(baseProperty, { units: unitsData });
                }

                return baseProperty;
            })
        );

        // Generate export based on format
        const exportData = await generatePropertyExport(enhancedProperties, options);

        // Set appropriate headers
        const format = options?.format || 'JSON';
        let contentType = 'application/json';
        let filename = `property-report-${new Date().toISOString().split('T')[0]}`;

        switch (format) {
            case 'CSV':
                contentType = 'text/csv';
                filename += '.csv';
                break;
            case 'PDF':
                contentType = 'application/pdf';
                filename += '.pdf';
                break;
            case 'JSON':
            default:
                contentType = 'application/json';
                filename += '.json';
                break;
        }

        const response = new NextResponse(
            typeof exportData === 'string' ? exportData : new Uint8Array(exportData)
        );
        response.headers.set('Content-Type', contentType);
        response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);

        return response;

    } catch (error) {
        console.error('Error exporting property data:', error);
        return NextResponse.json(
            { error: 'Failed to export property data' },
            { status: 500 }
        );
    }
}

async function generatePropertyExport(
    properties: any[], 
    options?: PropertyExportOptions
): Promise<string | Buffer> {
    const format = options?.format || 'JSON';

    switch (format) {
        case 'JSON':
            return JSON.stringify({
                exportedAt: new Date().toISOString(),
                totalProperties: properties.length,
                properties,
                metadata: {
                    includesListingStatus: properties.length > 0 && 'listedUnits' in properties[0],
                    includesMetrics: properties.length > 0 && 'conversionRate' in properties[0],
                    includesUnits: properties.length > 0 && 'units' in properties[0]
                }
            }, null, 2);

        case 'CSV':
            return generatePropertyCSV(properties, options);

        case 'PDF':
            return generatePropertyPDF(properties, options);

        default:
            throw new Error(`Unsupported export format: ${format}`);
    }
}

function generatePropertyCSV(properties: any[], options?: PropertyExportOptions): string {
    if (properties.length === 0) {
        return 'No properties found';
    }

    // Determine columns based on available data and custom fields
    const baseColumns = [
        'Property ID',
        'Property Name', 
        'Address',
        'City',
        'State',
        'Zip Code',
        'Total Units',
        'Organization',
        'Created Date'
    ];

    const listingColumns = [
        'Listed Units',
        'Private Units', 
        'Suspended Units'
    ];

    const metricsColumns = [
        'Avg Days to Lease',
        'Total Applications',
        'Conversion Rate (%)',
        'Total Revenue',
        'Occupancy Rate (%)'
    ];

    const columns = [...baseColumns];
    
    // Add listing status columns if data is available
    if (properties.length > 0 && 'listedUnits' in properties[0]) {
        columns.push(...listingColumns);
    }
    
    // Add metrics columns if data is available
    if (properties.length > 0 && 'conversionRate' in properties[0]) {
        columns.push(...metricsColumns);
    }

    // Add custom fields if specified
    if (options?.customFields) {
        columns.push(...options.customFields);
    }

    const rows = properties.map(property => {
        const row = [
            property.id,
            property.name || '',
            property.address || '',
            property.city || '',
            property.state || '',
            property.zipCode || '',
            property.totalUnits.toString(),
            property.organizationName || '',
            property.createdAt ? new Date(property.createdAt).toLocaleDateString() : ''
        ];

        // Add listing status data if available
        if ('listedUnits' in property) {
            row.push(
                property.listedUnits?.toString() || '0',
                property.privateUnits?.toString() || '0',
                property.suspendedUnits?.toString() || '0'
            );
        }

        // Add metrics data if available
        if ('conversionRate' in property) {
            row.push(
                property.averageDaysToLease?.toFixed(1) || '0',
                property.totalApplications?.toString() || '0',
                property.conversionRate?.toFixed(2) || '0',
                property.totalRevenue?.toFixed(2) || '0',
                property.occupancyRate?.toFixed(2) || '0'
            );
        }

        // Add custom field values if specified
        if (options?.customFields) {
            options.customFields.forEach(field => {
                row.push(property[field]?.toString() || '');
            });
        }

        return row;
    });

    return [columns, ...rows].map(row => 
        row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
}

function generatePropertyPDF(properties: any[], options?: PropertyExportOptions): Buffer {
    // This would require a PDF generation library like puppeteer or jsPDF
    // For now, return a text-based report
    const content = `
Property Export Report
Generated: ${new Date().toISOString()}
Total Properties: ${properties.length}

${properties.map(property => `
Property: ${property.name}
Address: ${property.address}, ${property.city}, ${property.state} ${property.zipCode}
Total Units: ${property.totalUnits}
${property.listedUnits !== undefined ? `Listed Units: ${property.listedUnits}` : ''}
${property.privateUnits !== undefined ? `Private Units: ${property.privateUnits}` : ''}
${property.conversionRate !== undefined ? `Conversion Rate: ${property.conversionRate.toFixed(2)}%` : ''}
${property.occupancyRate !== undefined ? `Occupancy Rate: ${property.occupancyRate.toFixed(2)}%` : ''}
---
`).join('')}
    `;
    
    return Buffer.from(content, 'utf-8');
}
