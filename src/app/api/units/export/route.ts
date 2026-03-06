import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/Getcurrentuser';
import { prisma } from '@/lib/db';

interface UnitExportFilters {
    propertyId?: string;
    organizationId?: string;
    listingStatus?: string[];
    includeListingMetrics?: boolean;
    includeApplicationData?: boolean;
    includeLeaseData?: boolean;
    startDate?: Date;
    endDate?: Date;
}

interface UnitExportOptions {
    format: 'CSV' | 'JSON' | 'PDF';
    groupByProperty?: boolean;
    customFields?: string[];
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { filters, options }: { filters?: UnitExportFilters; options?: UnitExportOptions } = body;

        // Validate export format
        const validFormats = ['CSV', 'JSON', 'PDF'];
        if (options?.format && !validFormats.includes(options.format)) {
            return NextResponse.json(
                { error: 'Invalid export format. Supported formats: CSV, JSON, PDF' },
                { status: 400 }
            );
        }

        // Build where clause for units
        const whereClause: any = {};
        
        if (filters?.propertyId) {
            whereClause.propertyId = filters.propertyId;
        }
        
        if (filters?.organizationId) {
            whereClause.property = {
                organizationId: filters.organizationId
            };
        }

        if (filters?.startDate || filters?.endDate) {
            whereClause.createdAt = {};
            if (filters.startDate) whereClause.createdAt.gte = filters.startDate;
            if (filters.endDate) whereClause.createdAt.lte = filters.endDate;
        }

        // Filter by listing status if specified
        if (filters?.listingStatus && filters.listingStatus.length > 0) {
            whereClause.listing = {
                status: {
                    name: { in: filters.listingStatus }
                }
            };
        }

        // Get units with comprehensive data
        const units = await prisma.unit.findMany({
            where: whereClause,
            include: {
                property: {
                    include: {
                        organization: true
                    }
                },
                listing: {
                    include: {
                        status: true,
                        auditEntries: {
                            orderBy: { timestamp: 'desc' },
                            take: 5 // Get recent audit entries
                        }
                    }
                },
                tenantApplications: {
                    include: {
                        user: true
                    }
                },
                leases: {
                    include: {
                        tenant: true
                    }
                }
            },
            orderBy: [
                { property: { name: 'asc' } },
                { unitNumber: 'asc' }
            ]
        });

        // Enhance units with calculated metrics
        const enhancedUnits = units.map(unit => {
            const baseUnit = {
                id: unit.id,
                unitNumber: unit.unitNumber,
                rent: unit.rentAmount,
                bedrooms: unit.bedrooms,
                bathrooms: unit.bathrooms,
                squareFootage: unit.squareFootage,
                propertyId: unit.propertyId,
                propertyName: unit.property?.name,
                propertyAddress: unit.property?.address,
                organizationName: unit.property?.organization?.name,
                createdAt: unit.createdAt
            };

            // Add listing information
            const listingInfo = {
                listingStatus: unit.listing?.status?.name || 'PRIVATE',
                listingTitle: unit.listing?.title,
                listingPrice: unit.listing?.price,
                listingCreatedAt: unit.listing?.createdAt,
                availabilityDate: unit.listing?.availabilityDate,
                expirationDate: unit.listing?.expirationDate
            };

            // Calculate listing metrics if requested
            if (filters?.includeListingMetrics && unit.listing) {
                const now = new Date();
                const daysListed = unit.listing.createdAt ? 
                    Math.ceil((now.getTime() - unit.listing.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                
                const statusChanges = unit.listing.auditEntries?.length || 0;
                const lastStatusChange = unit.listing.auditEntries?.[0]?.timestamp;

                Object.assign(listingInfo, {
                    daysListed,
                    statusChanges,
                    lastStatusChange
                });
            }

            // Add application data if requested
            let applicationInfo = {};
            if (filters?.includeApplicationData) {
                const applications = unit.tenantApplications || [];
                const approvedApplications = applications.filter(app => app.status === 'APPROVED');
                const pendingApplications = applications.filter(app => app.status === 'PENDING');
                const rejectedApplications = applications.filter(app => app.status === 'REJECTED');

                applicationInfo = {
                    totalApplications: applications.length,
                    approvedApplications: approvedApplications.length,
                    pendingApplications: pendingApplications.length,
                    rejectedApplications: rejectedApplications.length,
                    conversionRate: applications.length > 0 ? 
                        (approvedApplications.length / applications.length) * 100 : 0,
                    recentApplications: applications
                        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                        .slice(0, 3)
                        .map(app => ({
                            applicantName: `${app.user?.firstName || ''} ${app.user?.lastName || ''}`.trim(),
                            email: app.user?.email || '',
                            status: app.status,
                            appliedAt: app.createdAt
                        }))
                };
            }

            // Add lease data if requested
            let leaseInfo = {};
            if (filters?.includeLeaseData) {
                const leases = unit.leases || [];
                const activeLease = leases.find(lease => lease.leaseStatus === 'ACTIVE');
                const expiredLeases = leases.filter(lease => lease.leaseStatus === 'EXPIRED');

                leaseInfo = {
                    hasActiveLease: !!activeLease,
                    activeLeaseTenant: activeLease ? 
                        `${activeLease.tenant?.firstName} ${activeLease.tenant?.lastName}` : null,
                    activeLeaseStart: activeLease?.startDate,
                    activeLeaseEnd: activeLease?.endDate,
                    activeLeaseRent: activeLease?.rentAmount,
                    totalLeases: leases.length,
                    expiredLeases: expiredLeases.length,
                    averageLeaseLength: leases.length > 0 ? 
                        leases.reduce((sum, lease) => {
                            if (lease.startDate && lease.endDate) {
                                const days = (lease.endDate.getTime() - lease.startDate.getTime()) / (1000 * 60 * 60 * 24);
                                return sum + days;
                            }
                            return sum;
                        }, 0) / leases.length : 0
                };
            }

            return {
                ...baseUnit,
                ...listingInfo,
                ...applicationInfo,
                ...leaseInfo
            };
        });

        // Generate export based on format
        const exportData = await generateUnitExport(enhancedUnits, options);

        // Set appropriate headers
        const format = options?.format || 'JSON';
        let contentType = 'application/json';
        let filename = `unit-report-${new Date().toISOString().split('T')[0]}`;

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
        console.error('Error exporting unit data:', error);
        return NextResponse.json(
            { error: 'Failed to export unit data' },
            { status: 500 }
        );
    }
}

async function generateUnitExport(
    units: any[], 
    options?: UnitExportOptions
): Promise<string | Buffer> {
    const format = options?.format || 'JSON';

    switch (format) {
        case 'JSON':
            const exportData = {
                exportedAt: new Date().toISOString(),
                totalUnits: units.length,
                units: options?.groupByProperty ? groupUnitsByProperty(units) : units,
                summary: generateUnitSummary(units)
            };
            return JSON.stringify(exportData, null, 2);

        case 'CSV':
            return generateUnitCSV(units, options);

        case 'PDF':
            return generateUnitPDF(units, options);

        default:
            throw new Error(`Unsupported export format: ${format}`);
    }
}

function groupUnitsByProperty(units: any[]): Record<string, any> {
    const grouped: Record<string, any> = {};
    
    units.forEach(unit => {
        const propertyKey = unit.propertyName || 'Unknown Property';
        if (!grouped[propertyKey]) {
            grouped[propertyKey] = {
                propertyId: unit.propertyId,
                propertyName: unit.propertyName,
                propertyAddress: unit.propertyAddress,
                units: []
            };
        }
        grouped[propertyKey].units.push(unit);
    });

    return grouped;
}

function generateUnitSummary(units: any[]): any {
    const totalUnits = units.length;
    const listedUnits = units.filter(unit => unit.listingStatus === 'ACTIVE').length;
    const privateUnits = units.filter(unit => unit.listingStatus === 'PRIVATE').length;
    const suspendedUnits = units.filter(unit => unit.listingStatus === 'SUSPENDED').length;
    
    const unitsWithApplications = units.filter(unit => unit.totalApplications > 0);
    const totalApplications = units.reduce((sum, unit) => sum + (unit.totalApplications || 0), 0);
    
    const unitsWithLeases = units.filter(unit => unit.hasActiveLease);
    const occupancyRate = totalUnits > 0 ? (unitsWithLeases.length / totalUnits) * 100 : 0;

    return {
        totalUnits,
        listedUnits,
        privateUnits,
        suspendedUnits,
        totalApplications,
        unitsWithApplications: unitsWithApplications.length,
        unitsWithActiveLeases: unitsWithLeases.length,
        occupancyRate: parseFloat(occupancyRate.toFixed(2)),
        averageRent: totalUnits > 0 ? 
            units.reduce((sum, unit) => sum + (unit.rent || 0), 0) / totalUnits : 0
    };
}

function generateUnitCSV(units: any[], options?: UnitExportOptions): string {
    if (units.length === 0) {
        return 'No units found';
    }

    // Determine columns based on available data
    const baseColumns = [
        'Unit ID',
        'Unit Number',
        'Property Name',
        'Property Address',
        'Rent',
        'Bedrooms',
        'Bathrooms',
        'Square Footage',
        'Listing Status',
        'Listing Price',
        'Days Listed',
        'Total Applications',
        'Conversion Rate (%)',
        'Has Active Lease',
        'Organization'
    ];

    const columns = [...baseColumns];
    
    // Add custom fields if specified
    if (options?.customFields) {
        columns.push(...options.customFields);
    }

    const rows = units.map(unit => {
        const row = [
            unit.id,
            unit.unitNumber || '',
            unit.propertyName || '',
            unit.propertyAddress || '',
            unit.rent?.toString() || '0',
            unit.bedrooms?.toString() || '0',
            unit.bathrooms?.toString() || '0',
            unit.squareFootage?.toString() || '',
            unit.listingStatus || 'PRIVATE',
            unit.listingPrice?.toString() || '',
            unit.daysListed?.toString() || '0',
            unit.totalApplications?.toString() || '0',
            unit.conversionRate?.toFixed(2) || '0',
            unit.hasActiveLease ? 'Yes' : 'No',
            unit.organizationName || ''
        ];

        // Add custom field values if specified
        if (options?.customFields) {
            options.customFields.forEach(field => {
                row.push(unit[field]?.toString() || '');
            });
        }

        return row;
    });

    return [columns, ...rows].map(row => 
        row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
}

function generateUnitPDF(units: any[], options?: UnitExportOptions): Buffer {
    const summary = generateUnitSummary(units);
    
    const content = `
Unit Export Report
Generated: ${new Date().toISOString()}

Summary:
- Total Units: ${summary.totalUnits}
- Listed Units: ${summary.listedUnits}
- Private Units: ${summary.privateUnits}
- Suspended Units: ${summary.suspendedUnits}
- Occupancy Rate: ${summary.occupancyRate}%
- Average Rent: $${summary.averageRent.toFixed(2)}

Unit Details:
${units.map(unit => `
Unit: ${unit.unitNumber} (${unit.propertyName})
Rent: $${unit.rent} | Bedrooms: ${unit.bedrooms} | Bathrooms: ${unit.bathrooms}
Listing Status: ${unit.listingStatus}
${unit.daysListed ? `Days Listed: ${unit.daysListed}` : ''}
${unit.totalApplications ? `Applications: ${unit.totalApplications}` : ''}
${unit.hasActiveLease ? 'Has Active Lease' : 'No Active Lease'}
---
`).join('')}
    `;
    
    return Buffer.from(content, 'utf-8');
}
