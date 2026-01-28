"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, AlertCircle, Gauge, FileText, PieChart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// Tab type
type TabId = "overview" | "readings" | "bills" | "allocations";

interface Utility {
  id: string;
  name: string;
  type: "FIXED" | "METERED";
  unitPrice?: number;
  fixedAmount?: number;
  propertyId?: string;
  propertyName?: string;
}

export default function UtilityDetailsPage() {
  // Keep [id] in route, use utilityId in code
  const { id } = useParams();
  const utilityId = id as string;
  const router = useRouter();

  const [utility, setUtility] = useState<Utility | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUtility();
  }, [utilityId]);

  // Handle hash-based navigation
  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as TabId;
    if (hash && ["overview", "readings", "bills", "allocations"].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const loadUtility = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`/api/utilities/${utilityId}`);
      const data = await res.json();

      let utilityData = null;
      if (data?.success && data?.data) {
        utilityData = data.data;
      } else if (data?.id) {
        utilityData = data;
      }

      if (utilityData) {
        setUtility(utilityData);
      } else {
        setError("Utility not found");
      }
    } catch (err) {
      console.error("Load utility error:", err);
      setError("Failed to load utility");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    // Update URL hash without full navigation
    window.history.replaceState(null, "", `#${tab}`);
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#30D5C8]" />
        <span className="ml-3 text-[#15386a]">Loading utility...</span>
      </div>
    );
  }

  if (error || !utility) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto border border-slate-200 shadow-xl rounded-2xl bg-white">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-[#15386a]/70">{error || "Utility not found"}</p>
            <Link href="/property-manager/content/utilities">
              <Button
                variant="outline"
                className="text-[#30D5C8] border-[#30D5C8]/30 hover:bg-[#30D5C8]/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Utilities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Info className="w-4 h-4" /> },
    { id: "readings", label: "Readings", icon: <Gauge className="w-4 h-4" /> },
    { id: "bills", label: "Bills", icon: <FileText className="w-4 h-4" /> },
    { id: "allocations", label: "Allocations", icon: <PieChart className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Link href="/property-manager/content/utilities">
            <Button
              variant="ghost"
              className="text-[#15386a] hover:text-[#0b1f3a] hover:bg-[#30D5C8]/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Utilities
            </Button>
          </Link>
        </div>

        {/* Utility Header */}
        <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#0b1f3a] to-[#15386a] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{utility.name}</CardTitle>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${utility.type === "FIXED"
                    ? "bg-white/20 text-white"
                    : "bg-[#30D5C8] text-[#0b1f3a]"
                    }`}
                >
                  {utility.type === "FIXED" ? "Fixed" : "Metered"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-[#15386a]/5 to-[#15386a]/10 p-4 rounded-xl border border-[#15386a]/20">
                <p className="text-sm text-[#15386a]/70 mb-1 font-medium">Billing Type</p>
                <p className="text-lg font-bold text-[#0b1f3a]">
                  {utility.type === "FIXED" ? "Fixed Amount" : "Metered"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#30D5C8]/5 to-[#30D5C8]/10 p-4 rounded-xl border border-[#30D5C8]/20">
                <p className="text-sm text-[#15386a]/70 mb-1 font-medium">
                  {utility.type === "FIXED" ? "Fixed Amount" : "Unit Price"}
                </p>
                <p className="text-lg font-bold text-[#0b1f3a]">
                  {utility.type === "FIXED"
                    ? formatCurrency(utility.fixedAmount)
                    : formatCurrency(utility.unitPrice)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200">
                <p className="text-sm text-[#15386a]/70 mb-1 font-medium">Property</p>
                <p className="text-lg font-bold text-[#0b1f3a]">
                  {utility.propertyName ?? "Not assigned"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200">
                <p className="text-sm text-[#15386a]/70 mb-1 font-medium">Utility ID</p>
                <p className="text-sm font-mono text-[#0b1f3a] truncate">
                  {utilityId}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-1" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.id
                  ? "bg-white text-[#0b1f3a] border-t border-l border-r border-slate-200 -mb-px"
                  : "text-[#15386a]/70 hover:text-[#0b1f3a] hover:bg-slate-50"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            {activeTab === "overview" && (
              <OverviewTab utility={utility} />
            )}
            {activeTab === "readings" && (
              <ReadingsTab utilityId={utilityId} utilityType={utility.type} />
            )}
            {activeTab === "bills" && (
              <BillsTab utilityId={utilityId} />
            )}
            {activeTab === "allocations" && (
              <AllocationsTab utilityId={utilityId} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
// TAB COMPONENTS
// =============================================================================

function OverviewTab({ utility }: { utility: Utility }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#0b1f3a]">Utility Overview</h3>
      <p className="text-[#15386a]/70">
        This is the overview tab for <strong>{utility.name}</strong>.
        Use the tabs above to view readings, bills, and allocations.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-br from-[#15386a]/5 to-transparent rounded-xl border border-[#15386a]/10">
          <h4 className="font-semibold text-[#0b1f3a] mb-2">Quick Actions</h4>
          <ul className="space-y-2 text-[#15386a]/70">
            <li>• View and add meter readings in the <strong>Readings</strong> tab</li>
            <li>• Manage provider bills in the <strong>Bills</strong> tab</li>
            <li>• View cost allocations in the <strong>Allocations</strong> tab</li>
          </ul>
        </div>
        <div className="p-6 bg-gradient-to-br from-[#30D5C8]/5 to-transparent rounded-xl border border-[#30D5C8]/10">
          <h4 className="font-semibold text-[#0b1f3a] mb-2">Utility Details</h4>
          <dl className="space-y-2 text-[#15386a]/70">
            <div className="flex justify-between">
              <dt>Type:</dt>
              <dd className="font-medium text-[#0b1f3a]">{utility.type}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Billing:</dt>
              <dd className="font-medium text-[#0b1f3a]">
                {utility.type === "FIXED" ? "Fixed Monthly" : "Usage-based"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function ReadingsTab({ utilityId, utilityType }: { utilityId: string; utilityType: "FIXED" | "METERED" }) {
  if (utilityType === "FIXED") {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
          <Gauge className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-[#15386a]/70">
          Meter readings are not available for fixed-rate utilities.
        </p>
      </div>
    );
  }

  // TODO: Implement ReadingsTab content
  // This will be replaced with the full readings module
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#0b1f3a]">Meter Readings</h3>
        <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-white">
          Add Reading
        </Button>
      </div>
      <div className="text-center py-12 text-[#15386a]/70">
        <p>Readings module placeholder - will be implemented in Phase 3</p>
        <p className="text-sm mt-2">Utility ID: {utilityId}</p>
      </div>
    </div>
  );
}

function BillsTab({ utilityId }: { utilityId: string }) {
  // TODO: Implement BillsTab content
  // This will be replaced with the full bills module
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#0b1f3a]">Provider Bills</h3>
        <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-white">
          Create Bill
        </Button>
      </div>
      <div className="text-center py-12 text-[#15386a]/70">
        <p>Bills module placeholder - will be implemented in Phase 4</p>
        <p className="text-sm mt-2">Utility ID: {utilityId}</p>
      </div>
    </div>
  );
}

function AllocationsTab({ utilityId }: { utilityId: string }) {
  // TODO: Implement AllocationsTab content
  // This will be replaced with the full allocations module
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#0b1f3a]">Bill Allocations</h3>
      <p className="text-[#15386a]/70">
        View how utility costs are allocated across units.
        Allocations are calculated by the backend and displayed here for transparency.
      </p>
      <div className="text-center py-12 text-[#15386a]/70">
        <p>Allocations module placeholder - will be implemented in Phase 5</p>
        <p className="text-sm mt-2">Utility ID: {utilityId}</p>
      </div>
    </div>
  );
}