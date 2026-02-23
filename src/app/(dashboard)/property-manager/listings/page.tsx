"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Plus,
  Filter,
  Download,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  LoadingSpinner,
  LoadingStats,
  LoadingCard,
} from "@/components/ui/loading-spinner";

// Import listing components
import { ListingDecisionModal } from "@/components/Dashboard/listing/ListingDecisionModal";
import { UnitListingStatusCard } from "@/components/Dashboard/listing/UnitListingStatusCard";
import { BulkListingActions } from "@/components/Dashboard/listing/BulkListingActions";
import { ListingHistoryPanel } from "@/components/Dashboard/listing/ListingHistoryPanel";
import { ListingPerformanceDashboard } from "@/components/Dashboard/listing/ListingPerformanceDashboard";
import { MaintenanceModePanel } from "@/components/Dashboard/listing/MaintenanceModePanel";
import { LeaseIntegrationPanel } from "@/components/Dashboard/listing/LeaseIntegrationPanel";
import { PropertyDeactivationPanel } from "@/components/Dashboard/listing/PropertyDeactivationPanel";
import {
  BulkListingOperation,
  BulkResult,
  ListingStatus,
  UnitWithListingStatus,
} from "@/lib/listing-types";

interface Unit {
  id: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage?: number;
  rentAmount?: number;
  propertyId: string;
  property: {
    id: string;
    name: string;
    address: string;
  };
  listing?: {
    id: string;
    status: string | { name?: string } | null;
    title: string;
    description: string;
    price: number;
    createdAt: string;
    updatedAt: string;
  };
  leases?: Array<{
    id: string;
    leaseStatus: string;
    startDate: string;
    endDate: string;
  }>;
}

interface Property {
  id: string;
  name: string;
  address: string;
  units: Unit[];
}

type ListApiResponse<T> = T[] | { data?: T[] };

function getArrayFromResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown[] }).data)
  ) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

export default function ListingsManagementPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithListingStatus | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    property: "all",
    search: "",
  });

  const getRawStatusValue = (
    status?: string | { name?: string } | null
  ): string | undefined => {
    if (!status) return undefined;
    if (typeof status === "string") return status.toUpperCase();
    if (typeof status === "object" && status.name) return status.name.toUpperCase();
    return undefined;
  };

  const normalizeStatus = (
    status?: string | { name?: string } | null,
    hasListing?: boolean
  ): ListingStatus => {
    const normalized = getRawStatusValue(status);

    if (!normalized) {
      return hasListing ? ListingStatus.ACTIVE : ListingStatus.PRIVATE;
    }

    return Object.values(ListingStatus).includes(normalized as ListingStatus)
      ? (normalized as ListingStatus)
      : ListingStatus.PRIVATE;
  };

  const toListingUnits = (items: Unit[]): UnitWithListingStatus[] => {
    return items.map((unit) => ({
      id: unit.id,
      unitNumber: unit.unitNumber,
      propertyId: unit.propertyId,
      rentAmount: unit.rentAmount,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      squareFootage: unit.squareFootage,
      listing: unit.listing
        ? {
            id: unit.listing.id,
            status: normalizeStatus(unit.listing.status, true),
            createdAt: new Date(unit.listing.createdAt),
            updatedAt: new Date(unit.listing.updatedAt),
            title: unit.listing.title,
            description: unit.listing.description,
            price: unit.listing.price,
          }
        : undefined,
    }));
  };

  const fetchUnitsAndProperties = useCallback(async () => {
    try {
      setLoading(true);

      const [unitsResponse, propertiesResponse] = await Promise.all([
        fetch("/api/units?include=listing,property,lease"),
        fetch("/api/properties"),
      ]);

      if (!unitsResponse.ok) throw new Error("Failed to fetch units");
      if (!propertiesResponse.ok) throw new Error("Failed to fetch properties");

      const unitsPayload: ListApiResponse<Unit> = await unitsResponse.json();
      const propertiesPayload: ListApiResponse<Property> = await propertiesResponse.json();

      setUnits(getArrayFromResponse<Unit>(unitsPayload));
      setProperties(getArrayFromResponse<Property>(propertiesPayload));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load listings data");
      setUnits([]);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnitsAndProperties();
  }, [fetchUnitsAndProperties]);

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const resolvedStatus = normalizeStatus(unit.listing?.status, !!unit.listing);

      if (filters.status !== "all" && filters.status !== resolvedStatus) {
        return false;
      }

      if (filters.property !== "all" && unit.propertyId !== filters.property) {
        return false;
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          unit.unitNumber?.toLowerCase().includes(searchLower) ||
          unit.property?.name?.toLowerCase().includes(searchLower) ||
          unit.property?.address?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [units, filters]);

  const listingUnits = useMemo(
    () => toListingUnits(filteredUnits),
    [filteredUnits]
  );

  const stats = useMemo(() => {
    const result = {
      total: units.length,
      private: 0,
      active: 0,
      suspended: 0,
      pending: 0,
    };

    units.forEach((unit) => {
      const status = normalizeStatus(unit.listing?.status, !!unit.listing);
      switch (status) {
        case ListingStatus.PRIVATE:
          result.private++;
          break;
        case ListingStatus.ACTIVE:
          result.active++;
          break;
        case ListingStatus.SUSPENDED:
          result.suspended++;
          break;
        case ListingStatus.PENDING:
          result.pending++;
          break;
        default:
          break;
      }
    });

    return result;
  }, [units]);

  // Handle listing decision
  const handleListingDecision = async (unitId: string, decision: "list" | "private") => {
    try {
      setStatusUpdateLoading(unitId);

      if (!unitId) {
        toast.error("Unit ID is missing. Please try again.");
        return;
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          action: decision === "list" ? "CREATE" : "REMOVE",
          listingData: {},
        }),
      });

      if (!response.ok) throw new Error("Failed to update listing");

      toast.success(`Unit ${decision === "list" ? "listed" : "made private"} successfully`);
      await fetchUnitsAndProperties();
      setShowDecisionModal(false);
      setSelectedUnit(null);
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("Failed to update listing");
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  // Handle status change
  const handleStatusChange = async (unitId: string, newStatus: string) => {
    try {
      setStatusUpdateLoading(unitId);

      const unit = units.find((u) => u.id === unitId);
      if (!unit) {
        toast.error("Unit not found.");
        return;
      }

      if (!unit.listing && newStatus === ListingStatus.ACTIVE) {
        const createResponse = await fetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unitId,
            action: "CREATE",
            listingData: {
              title: unit.unitNumber ? `Unit ${unit.unitNumber}` : "Unit Listing",
              description: `${unit.bedrooms || "N/A"} bedroom, ${
                unit.bathrooms || "N/A"
              } bathroom unit`,
              price: unit.rentAmount || 0,
            },
          }),
        });

        if (!createResponse.ok) throw new Error("Failed to create listing");
        toast.success("Listing created successfully");
        await fetchUnitsAndProperties();
        return;
      }

      if (!unit.listing?.id) {
        toast.error("Listing not found for this unit.");
        return;
      }

      const response = await fetch(`/api/listings/${unit.listing.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success("Listing status updated successfully");
      await fetchUnitsAndProperties();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  // Handle bulk actions from BulkListingActions component
  const handleBulkAction = async (
    operations: BulkListingOperation[]
  ): Promise<BulkResult> => {
    const results: BulkResult = {
      successful: [],
      failed: [],
      summary: {
        total: operations.length,
        succeeded: 0,
        failed: 0,
      },
    };

    for (const operation of operations) {
      try {
        const response = await fetch("/api/listings/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: operation.action,
            unitIds: [operation.unitId],
            listingData: operation.listingData,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Failed to perform bulk action");
        }

        const payload = await response.json();

        if (payload?.successful?.includes(operation.unitId)) {
          results.successful.push(operation.unitId);
        } else if (payload?.failed?.length) {
          const failure = payload.failed.find(
            (item: { unitId: string }) => item.unitId === operation.unitId
          );

          results.failed.push({
            unitId: operation.unitId,
            error: failure?.error || "Failed to process unit",
          });
        } else {
          results.successful.push(operation.unitId);
        }
      } catch (error) {
        results.failed.push({
          unitId: operation.unitId,
          error: error instanceof Error ? error.message : "Failed to perform bulk action",
        });
      }
    }

    results.summary.succeeded = results.successful.length;
    results.summary.failed = results.failed.length;

    if (results.summary.succeeded > 0) {
      toast.success(
        `Bulk action completed: ${results.summary.succeeded}/${results.summary.total} successful`
      );
    }
    if (results.summary.failed > 0) {
      toast.warning(`${results.summary.failed} operations failed`);
    }

    await fetchUnitsAndProperties();
    return results;
  };

  // Refresh data with loading indicator
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchUnitsAndProperties();
      toast.success("Data refreshed successfully");
    } catch {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const activeProperty =
    filters.property !== "all"
      ? properties.find((property) => property.id === filters.property)
      : properties[0];

  const activePropertyUnits = activeProperty?.units || [];
  const activeListingsCount = activePropertyUnits.filter(
    (unit) => normalizeStatus(unit.listing?.status, !!unit.listing) === ListingStatus.ACTIVE
  ).length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        <LoadingStats count={4} />

        <div className="space-y-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace Listings</h1>
          <p className="text-gray-600">
            Manage your property listings and marketplace visibility
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            {refreshing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              window.open("/api/listings/export", "_blank");
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button
            onClick={() => {
              const availableUnits = units.filter(
                (u) => !u.listing && (!u.leases || u.leases.length === 0)
              );

              if (availableUnits.length > 0) {
                setSelectedUnit(toListingUnits([availableUnits[0]])[0]);
                setShowDecisionModal(true);
              } else {
                toast.info("No units available for listing");
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Units</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Private Units</p>
                <p className="text-2xl font-bold text-gray-600">{stats.private}</p>
              </div>
              <EyeOff className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-orange-600">{stats.suspended}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="lease">Lease Integration</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>

                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="PRIVATE">Private</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="PENDING">Pending</option>
                </select>

                <select
                  value={filters.property}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, property: e.target.value }))
                  }
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Properties</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Search units..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="border rounded px-3 py-1 text-sm flex-1 min-w-[200px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          <BulkListingActions
            units={listingUnits}
            onBulkAction={handleBulkAction}
            showUnitList={false}
          />

          {/* Units Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listingUnits.map((unit) => (
              <UnitListingStatusCard
                key={unit.id}
                unit={unit}
                onStatusChange={handleStatusChange}
                onEdit={() => {
                  setSelectedUnit(unit);
                  // Open edit modal or navigate to edit page
                }}
                loading={statusUpdateLoading === unit.id}
              />
            ))}
          </div>

          {listingUnits.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No units found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or add some units to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance">
          <ListingPerformanceDashboard />
        </TabsContent>

        <TabsContent value="history">
          <ListingHistoryPanel />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceModePanel />
        </TabsContent>

        <TabsContent value="lease">
          <LeaseIntegrationPanel />
        </TabsContent>

        <TabsContent value="properties">
          {activeProperty ? (
            <PropertyDeactivationPanel
              propertyId={activeProperty.id}
              propertyName={activeProperty.name}
              unitsCount={activePropertyUnits.length}
              activeListingsCount={activeListingsCount}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-gray-600">
                No properties available to manage.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Listing Decision Modal */}
      {showDecisionModal && selectedUnit && (
        <ListingDecisionModal
          isOpen={showDecisionModal}
          unit={selectedUnit}
          onDecision={(unitId, decision) => handleListingDecision(unitId, decision)}
          onClose={() => {
            setShowDecisionModal(false);
            setSelectedUnit(null);
          }}
        />
      )}
    </div>
  );
}
