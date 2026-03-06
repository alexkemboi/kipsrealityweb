// Listing Performance Reporting Service
// Provides analytics and metrics for marketplace listings

import { prisma } from "./db";
import { ListingStatus } from "./listing-types";

export interface ListingPerformanceReport {
    listingId: string;
    unitId: string;
    unitNumber: string;
    propertyName: string;
    daysListed: number;
    applicationCount: number;
    viewCount: number;
    conversionRate: number;
    averageTimeToApplication: number;
    currentStatus: ListingStatus;
    totalRevenue: number;
    createdAt: Date;
    lastStatusChange: Date;
}

export interface PropertyPerformanceReport {
    propertyId: string;
    propertyName: string;
    totalUnits: number;
    listedUnits: number;
    privateUnits: number;
    averageDaysToLease: number;
    totalApplications: number;
    conversionRate: number;
    totalRevenue: number;
    occupancyRate: number;
}

export interface ListingAnalytics {
    totalListings: number;
    activeListings: number;
    averageDaysListed: number;
    totalApplications: number;
    overallConversionRate: number;
    monthlyTrends: MonthlyTrend[];
    statusDistribution: StatusDistribution[];
    topPerformingProperties: PropertyPerformanceReport[];
}

export interface MonthlyTrend {
    month: string;
    year: number;
    newListings: number;
    applications: number;
    conversions: number;
    averageDaysListed: number;
}

export interface StatusDistribution {
    status: ListingStatus;
    count: number;
    percentage: number;
}

export interface ReportFilters {
    propertyId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: ListingStatus[];
    minDaysListed?: number;
    maxDaysListed?: number;
}

export interface ExportOptions {
    format: 'CSV' | 'JSON' | 'PDF';
    includeCharts?: boolean;
    includeDetails?: boolean;
    customFields?: string[];
    groupBy?: 'property' | 'status' | 'month';
    dateRange?: {
        start: Date;
        end: Date;
    };
}

/**
 * Service for generating listing performance reports and analytics
 */
export class ListingReportingService {
    
    /**
     * Gets performance metrics for a specific listing
     */
    async getListingPerformance(listingId: string): Promise<ListingPerformanceReport | null> {
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                unit: {
                    include: {
                        property: true,
                        tenantApplications: true
                    }
                },
                status: true
            }
        });

        if (!listing) return null;

        const applications = listing.unit?.tenantApplications || [];
        const auditEntries: Array<{ timestamp: Date }> = [];
        
        // Calculate days listed
        const createdAt = listing.createdAt;
        const now = new Date();
        const daysListed = Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate application metrics
        const applicationCount = applications.length;
        const conversionRate = applicationCount > 0 ? (applications.filter((app: any) => app.status === 'APPROVED').length / applicationCount) * 100 : 0;
        
        // Calculate average time to first application
        let averageTimeToApplication = 0;
        if (applications.length > 0) {
            const firstApplication = [...applications].sort((a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime())[0];
            const timeToFirstApp = (firstApplication.createdAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
            averageTimeToApplication = timeToFirstApp;
        }
        
        // Get last status change
        const lastStatusChange = auditEntries.length > 0 
            ? auditEntries[auditEntries.length - 1].timestamp 
            : createdAt;
        
        // Calculate revenue (from approved applications)
        const totalRevenue = applications
            .filter((app: any) => app.status === 'APPROVED')
            .reduce((sum: number, app: any) => sum + (listing.price || 0), 0);

        return {
            listingId: listing.id,
            unitId: listing.unitId || '',
            unitNumber: listing.unit?.unitNumber || '',
            propertyName: listing.unit?.property?.name || '',
            daysListed,
            applicationCount,
            viewCount: 0, // Would need to implement view tracking
            conversionRate,
            averageTimeToApplication,
            currentStatus: this.mapPrismaStatusToEnum(listing.status?.name),
            totalRevenue,
            createdAt,
            lastStatusChange
        };
    }

    /**
     * Gets performance metrics for all listings in a property
     */
    async getPropertyPerformance(propertyId: string): Promise<PropertyPerformanceReport | null> {
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                units: {
                    include: {
                        listing: {
                            include: {
                                status: true
                            }
                        },
                        tenantApplications: true,
                        leases: true
                    }
                }
            }
        });

        if (!property) return null;

        const propertyUnits = property.units;

        const totalUnits = propertyUnits.length;
        const listedUnits = propertyUnits.filter(unit => unit.listing && 
            this.mapPrismaStatusToEnum(unit.listing.status?.name) === ListingStatus.ACTIVE).length;
        const privateUnits = totalUnits - listedUnits;

        // Calculate total applications across all units
        const totalApplications = propertyUnits.reduce((sum, unit) => sum + unit.tenantApplications.length, 0);
        
        // Calculate conversion rate
        const approvedApplications = propertyUnits.reduce((sum, unit) => 
            sum + unit.tenantApplications.filter((app) => app.status === 'APPROVED').length, 0);
        const conversionRate = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;

        // Calculate average days to lease
        const leasedUnits = propertyUnits.filter(unit => unit.leases.length > 0);
        let averageDaysToLease = 0;
        if (leasedUnits.length > 0) {
            const totalDays = leasedUnits.reduce((sum, unit) => {
                const listing = unit.listing;
                const lease = unit.leases[0]; // Get first lease
                if (listing && lease) {
                    const daysToLease = (lease.createdAt.getTime() - listing.createdAt.getTime()) / (1000 * 60 * 60 * 24);
                    return sum + daysToLease;
                }
                return sum;
            }, 0);
            averageDaysToLease = totalDays / leasedUnits.length;
        }

        // Calculate total revenue
        const totalRevenue = propertyUnits.reduce((sum, unit) => {
            const approvedApps = unit.tenantApplications.filter((app) => app.status === 'APPROVED');
            return sum + approvedApps.reduce((appSum, _app) => appSum + (unit.listing?.price || 0), 0);
        }, 0);

        // Calculate occupancy rate
        const occupiedUnits = propertyUnits.filter(unit => 
            unit.leases.some((lease) => lease.leaseStatus === 'ACTIVE')).length;
        const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

        return {
            propertyId: property.id,
            propertyName: property.name || '',
            totalUnits,
            listedUnits,
            privateUnits,
            averageDaysToLease,
            totalApplications,
            conversionRate,
            totalRevenue,
            occupancyRate
        };
    }

    /**
     * Gets comprehensive analytics across all listings
     */
    async getListingAnalytics(filters?: ReportFilters): Promise<ListingAnalytics> {
        const whereClause: any = {};
        
        if (filters?.propertyId) {
            whereClause.unit = { propertyId: filters.propertyId };
        }
        
        if (filters?.startDate || filters?.endDate) {
            whereClause.createdAt = {};
            if (filters.startDate) whereClause.createdAt.gte = filters.startDate;
            if (filters.endDate) whereClause.createdAt.lte = filters.endDate;
        }

        const listings = await prisma.listing.findMany({
            where: whereClause,
            include: {
                unit: {
                    include: {
                        property: true,
                        tenantApplications: true,
                        leases: true
                    }
                },
                status: true
            }
        });

        const totalListings = listings.length;
        const activeListings = listings.filter(listing => 
            this.mapPrismaStatusToEnum(listing.status?.name) === ListingStatus.ACTIVE).length;

        // Calculate average days listed
        const now = new Date();
        const totalDaysListed = listings.reduce((sum, listing) => {
            const days = (now.getTime() - listing.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
        }, 0);
        const averageDaysListed = totalListings > 0 ? totalDaysListed / totalListings : 0;

        // Calculate total applications and conversion rate
        const totalApplications = listings.reduce((sum, listing) => 
            sum + (listing.unit?.tenantApplications?.length || 0), 0);
        
        const totalConversions = listings.reduce((sum, listing) => 
            sum + (listing.unit?.tenantApplications?.filter((app) => app.status === 'APPROVED').length || 0), 0);
        
        const overallConversionRate = totalApplications > 0 ? (totalConversions / totalApplications) * 100 : 0;

        // Generate monthly trends
        const monthlyTrends = await this.generateMonthlyTrends(filters);

        // Generate status distribution
        const statusDistribution = this.generateStatusDistribution(listings);

        // Get top performing properties
        const topPerformingProperties = await this.getTopPerformingProperties(5, filters);

        return {
            totalListings,
            activeListings,
            averageDaysListed,
            totalApplications,
            overallConversionRate,
            monthlyTrends,
            statusDistribution,
            topPerformingProperties
        };
    }

    /**
     * Generates monthly trend data
     */
    private async generateMonthlyTrends(filters?: ReportFilters): Promise<MonthlyTrend[]> {
        const endDate = filters?.endDate || new Date();
        const startDate = filters?.startDate || new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1);

        const trends: MonthlyTrend[] = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
            const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

            const monthlyListings = await prisma.listing.findMany({
                where: {
                    createdAt: {
                        gte: monthStart,
                        lte: monthEnd
                    },
                    ...(filters?.propertyId && { unit: { propertyId: filters.propertyId } })
                },
                include: {
                    unit: {
                        include: {
                            tenantApplications: {
                                where: {
                                    createdAt: {
                                        gte: monthStart,
                                        lte: monthEnd
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const newListings = monthlyListings.length;
            const applications = monthlyListings.reduce((sum, listing) => 
                sum + (listing.unit?.tenantApplications?.length || 0), 0);
            const conversions = monthlyListings.reduce((sum, listing) => 
                sum + (listing.unit?.tenantApplications?.filter(app => app.status === 'APPROVED').length || 0), 0);

            // Calculate average days listed for this month
            const now = new Date();
            const totalDays = monthlyListings.reduce((sum, listing) => {
                const days = (now.getTime() - listing.createdAt.getTime()) / (1000 * 60 * 60 * 24);
                return sum + days;
            }, 0);
            const averageDaysListed = newListings > 0 ? totalDays / newListings : 0;

            trends.push({
                month: current.toLocaleString('default', { month: 'long' }),
                year: current.getFullYear(),
                newListings,
                applications,
                conversions,
                averageDaysListed
            });

            current.setMonth(current.getMonth() + 1);
        }

        return trends;
    }

    /**
     * Generates status distribution data
     */
    private generateStatusDistribution(listings: any[]): StatusDistribution[] {
        const statusCounts: Record<string, number> = {};
        const total = listings.length;

        listings.forEach(listing => {
            const status = this.mapPrismaStatusToEnum(listing.status?.name) || ListingStatus.PRIVATE;
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        return Object.entries(statusCounts).map(([status, count]) => ({
            status: status as ListingStatus,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0
        }));
    }

    /**
     * Gets top performing properties by conversion rate
     */
    private async getTopPerformingProperties(limit: number, filters?: ReportFilters): Promise<PropertyPerformanceReport[]> {
        const properties = await prisma.property.findMany({
            include: {
                units: {
                    include: {
                        listing: {
                            include: {
                                status: true
                            }
                        },
                        tenantApplications: true,
                        leases: true
                    }
                }
            }
        });

        const performanceReports: PropertyPerformanceReport[] = [];

        for (const property of properties) {
            const report = await this.getPropertyPerformance(property.id);
            if (report) {
                performanceReports.push(report);
            }
        }

        // Sort by conversion rate and return top performers
        return performanceReports
            .sort((a, b) => b.conversionRate - a.conversionRate)
            .slice(0, limit);
    }

    /**
     * Exports listing data in specified format with enhanced customization
     */
    async exportListingData(filters?: ReportFilters, options?: ExportOptions): Promise<string | Buffer> {
        const analytics = await this.getListingAnalytics(filters);
        
        // Get detailed listing data if needed
        let detailedListings: any[] = [];
        if (options?.includeDetails) {
            detailedListings = await this.getDetailedListingData(filters);
        }
        
        switch (options?.format || 'JSON') {
            case 'JSON':
                return this.generateEnhancedJSONExport(analytics, detailedListings, options);
            
            case 'CSV':
                return this.generateEnhancedCSVExport(analytics, detailedListings, options);
            
            case 'PDF':
                return this.generateEnhancedPDFExport(analytics, detailedListings, options);
            
            default:
                throw new Error(`Unsupported export format: ${options?.format}`);
        }
    }

    /**
     * Gets detailed listing data for exports
     */
    private async getDetailedListingData(filters?: ReportFilters): Promise<any[]> {
        const whereClause: any = {};
        
        if (filters?.propertyId) {
            whereClause.unit = { propertyId: filters.propertyId };
        }
        
        if (filters?.startDate || filters?.endDate) {
            whereClause.createdAt = {};
            if (filters.startDate) whereClause.createdAt.gte = filters.startDate;
            if (filters.endDate) whereClause.createdAt.lte = filters.endDate;
        }

        const listings = await prisma.listing.findMany({
            where: whereClause,
            include: {
                unit: {
                    include: {
                        property: true,
                        tenantApplications: true,
                        leases: true
                    }
                },
                status: true
            }
        });

        return listings.map(listing => {
            const applications = listing.unit?.tenantApplications || [];
            const leases = listing.unit?.leases || [];

            // Calculate metrics
            const now = new Date();
            const daysListed = Math.ceil((now.getTime() - listing.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            const applicationCount = applications.length;
            const approvedApplications = applications.filter((app: any) => app.status === 'APPROVED').length;
            const conversionRate = applicationCount > 0 ? (approvedApplications / applicationCount) * 100 : 0;
            const hasActiveLease = leases.some((lease: any) => lease.leaseStatus === 'ACTIVE');

            return {
                listingId: listing.id,
                unitId: listing.unitId,
                unitNumber: listing.unit?.unitNumber,
                propertyName: listing.unit?.property?.name,
                propertyAddress: listing.unit?.property?.address,
                title: listing.title,
                description: listing.description,
                price: listing.price,
                status: listing.status?.name,
                createdAt: listing.createdAt,
                daysListed,
                applicationCount,
                approvedApplications,
                conversionRate,
                hasActiveLease,
                statusChanges: 0,
                lastStatusChange: listing.createdAt,
                totalRevenue: approvedApplications * (listing.price || 0)
            };
        });
    }

    /**
     * Generates enhanced JSON export with grouping and custom fields
     */
    private generateEnhancedJSONExport(
        analytics: ListingAnalytics, 
        detailedListings: any[], 
        options?: ExportOptions
    ): string {
        const exportData: any = {
            exportedAt: new Date().toISOString(),
            filters: options?.dateRange,
            summary: analytics,
            metadata: {
                totalRecords: detailedListings.length,
                includesDetails: options?.includeDetails || false,
                groupedBy: options?.groupBy || 'none'
            }
        };

        if (options?.includeDetails) {
            if (options?.groupBy) {
                exportData.groupedData = this.groupListingData(detailedListings, options.groupBy);
            } else {
                exportData.listings = detailedListings;
            }
        }

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Generates enhanced CSV export with custom fields
     */
    private generateEnhancedCSVExport(
        analytics: ListingAnalytics, 
        detailedListings: any[], 
        options?: ExportOptions
    ): string {
        if (!options?.includeDetails || detailedListings.length === 0) {
            // Return summary CSV
            return this.generateCSVExport(analytics);
        }

        // Generate detailed CSV
        const baseColumns = [
            'Listing ID',
            'Unit Number',
            'Property Name',
            'Property Address',
            'Title',
            'Price',
            'Status',
            'Created Date',
            'Days Listed',
            'Applications',
            'Approved Apps',
            'Conversion Rate (%)',
            'Has Active Lease',
            'Total Revenue'
        ];

        const columns = [...baseColumns];
        
        // Add custom fields if specified
        if (options?.customFields) {
            columns.push(...options.customFields);
        }

        const rows = detailedListings.map(listing => {
            const row = [
                listing.listingId,
                listing.unitNumber || '',
                listing.propertyName || '',
                listing.propertyAddress || '',
                listing.title || '',
                listing.price?.toString() || '0',
                listing.status || '',
                listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : '',
                listing.daysListed?.toString() || '0',
                listing.applicationCount?.toString() || '0',
                listing.approvedApplications?.toString() || '0',
                listing.conversionRate?.toFixed(2) || '0',
                listing.hasActiveLease ? 'Yes' : 'No',
                listing.totalRevenue?.toFixed(2) || '0'
            ];

            // Add custom field values if specified
            if (options?.customFields) {
                options.customFields.forEach(field => {
                    row.push(listing[field]?.toString() || '');
                });
            }

            return row;
        });

        return [columns, ...rows].map(row => 
            row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    /**
     * Generates enhanced PDF export with charts and detailed analysis
     */
    private generateEnhancedPDFExport(
        analytics: ListingAnalytics, 
        detailedListings: any[], 
        options?: ExportOptions
    ): Buffer {
        let content = `
Comprehensive Listing Performance Report
Generated: ${new Date().toISOString()}
${options?.dateRange ? `Period: ${options.dateRange.start.toLocaleDateString()} - ${options.dateRange.end.toLocaleDateString()}` : ''}

EXECUTIVE SUMMARY
================
Total Listings: ${analytics.totalListings}
Active Listings: ${analytics.activeListings}
Average Days Listed: ${analytics.averageDaysListed.toFixed(1)}
Total Applications: ${analytics.totalApplications}
Overall Conversion Rate: ${analytics.overallConversionRate.toFixed(2)}%

STATUS DISTRIBUTION
==================
${analytics.statusDistribution.map(status => 
    `${status.status}: ${status.count} (${status.percentage.toFixed(1)}%)`
).join('\n')}

TOP PERFORMING PROPERTIES
========================
${analytics.topPerformingProperties.slice(0, 5).map((property, index) => `
${index + 1}. ${property.propertyName}
   - Total Units: ${property.totalUnits}
   - Listed Units: ${property.listedUnits}
   - Conversion Rate: ${property.conversionRate.toFixed(2)}%
   - Total Revenue: $${property.totalRevenue.toFixed(2)}
   - Occupancy Rate: ${property.occupancyRate.toFixed(2)}%
`).join('')}

MONTHLY TRENDS
=============
${analytics.monthlyTrends.map(trend => 
    `${trend.month} ${trend.year}: ${trend.newListings} new listings, ${trend.applications} applications, ${trend.conversions} conversions`
).join('\n')}
        `;

        if (options?.includeDetails && detailedListings.length > 0) {
            content += `

DETAILED LISTING ANALYSIS
========================
${detailedListings.slice(0, 20).map(listing => `
Listing: ${listing.title} (${listing.unitNumber})
Property: ${listing.propertyName}
Price: $${listing.price}
Status: ${listing.status}
Days Listed: ${listing.daysListed}
Applications: ${listing.applicationCount} (${listing.conversionRate.toFixed(1)}% conversion)
Revenue: $${listing.totalRevenue.toFixed(2)}
---
`).join('')}
            `;
        }

        return Buffer.from(content, 'utf-8');
    }

    /**
     * Groups listing data by specified criteria
     */
    private groupListingData(listings: any[], groupBy: string): Record<string, any[]> {
        const grouped: Record<string, any[]> = {};

        listings.forEach(listing => {
            let key: string;
            
            switch (groupBy) {
                case 'property':
                    key = listing.propertyName || 'Unknown Property';
                    break;
                case 'status':
                    key = listing.status || 'Unknown Status';
                    break;
                case 'month':
                    const date = new Date(listing.createdAt);
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    break;
                default:
                    key = 'All';
            }

            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(listing);
        });

        return grouped;
    }

    /**
     * Generates CSV export of listing data
     */
    private generateCSVExport(analytics: ListingAnalytics): string {
        const headers = [
            'Property Name',
            'Total Units',
            'Listed Units',
            'Private Units',
            'Total Applications',
            'Conversion Rate (%)',
            'Average Days to Lease',
            'Total Revenue',
            'Occupancy Rate (%)'
        ];

        const rows = analytics.topPerformingProperties.map(property => [
            property.propertyName,
            property.totalUnits.toString(),
            property.listedUnits.toString(),
            property.privateUnits.toString(),
            property.totalApplications.toString(),
            property.conversionRate.toFixed(2),
            property.averageDaysToLease.toFixed(1),
            property.totalRevenue.toFixed(2),
            property.occupancyRate.toFixed(2)
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    /**
     * Generates PDF export of listing data
     */
    private generatePDFExport(analytics: ListingAnalytics, options?: ExportOptions): Buffer {
        // This would require a PDF generation library like puppeteer or jsPDF
        // For now, return a placeholder
        const content = `
Listing Performance Report
Generated: ${new Date().toISOString()}

Summary:
- Total Listings: ${analytics.totalListings}
- Active Listings: ${analytics.activeListings}
- Average Days Listed: ${analytics.averageDaysListed.toFixed(1)}
- Total Applications: ${analytics.totalApplications}
- Overall Conversion Rate: ${analytics.overallConversionRate.toFixed(2)}%

Top Performing Properties:
${analytics.topPerformingProperties.map(p => 
    `- ${p.propertyName}: ${p.conversionRate.toFixed(2)}% conversion rate`
).join('\n')}
        `;
        
        return Buffer.from(content, 'utf-8');
    }

    /**
     * Maps Prisma status name to ListingStatus enum
     */
    private mapPrismaStatusToEnum(statusName?: string): ListingStatus {
        switch (statusName?.toUpperCase()) {
            case 'ACTIVE': return ListingStatus.ACTIVE;
            case 'PRIVATE': return ListingStatus.PRIVATE;
            case 'SUSPENDED': return ListingStatus.SUSPENDED;
            case 'PENDING': return ListingStatus.PENDING;
            case 'EXPIRED': return ListingStatus.EXPIRED;
            case 'MAINTENANCE': return ListingStatus.MAINTENANCE;
            case 'COMING_SOON': return ListingStatus.COMING_SOON;
            default: return ListingStatus.PRIVATE;
        }
    }
}

export const listingReportingService = new ListingReportingService();