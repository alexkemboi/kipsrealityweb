"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Invite {
  id: string;
  token: string; 
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  accepted: boolean;
  createdAt: string;
}

interface Lease {
  id: string;
  tenantId?: string | null;
  applicationId?: string | null;
  propertyId: string;
  unitId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  leaseStatus: string;
  tenant?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  } | null;
  application?: {
    id: string;
    fullName?: string;
    email?: string;
    phone?: string;
  } | null;
  property?: {
    id: string;
    address: string;
    city?: string;
  } | null;
  unit?: {
    id: string;
    unitNumber: string;
    unitName?: string;
  } | null;
}

export default function InvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [filteredInvites, setFilteredInvites] = useState<Invite[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACCEPTED" | "PENDING">("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch invites and leases
  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      setError(null);
      
      try {
        // Fetch invites
        const invitesRes = await fetch("/api/auth/invites/tenant");
        if (!invitesRes.ok) throw new Error("Failed to fetch invites");
        const invitesData = await invitesRes.json();
        setInvites(invitesData.invites || []);
        setFilteredInvites(invitesData.invites || []);

        // Fetch leases
        const leasesRes = await fetch("/api/lease");
        if (!leasesRes.ok) {
          const errorData = await leasesRes.json();
          throw new Error(errorData.error || "Failed to fetch leases");
        }
        const leasesData = await leasesRes.json();
        console.log("Leases API Response:", leasesData);
        
        // API returns array directly, not wrapped in {leases: [...]}
        const leasesArray = Array.isArray(leasesData) ? leasesData : (leasesData.leases || []);
        console.log("Leases Array:", leasesArray);
        console.log("Leases Length:", leasesArray.length);
        
        setLeases(leasesArray);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter invites by search and status
  useEffect(() => {
    let filtered = invites;

    if (filterStatus !== "ALL") {
      filtered = filtered.filter(inv =>
        filterStatus === "ACCEPTED" ? inv.accepted : !inv.accepted
      );
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        inv =>
          inv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (inv.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
          (inv.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      );
    }

    setFilteredInvites(filtered);
  }, [searchTerm, filterStatus, invites]);

  // Prefill form when lease is selected - use application data since we're inviting the applicant
  useEffect(() => {
    console.log("Selected Lease ID changed:", selectedLeaseId);
    
    if (selectedLeaseId) {
      const lease = leases.find(l => l.id === selectedLeaseId);
      console.log("Found lease:", lease);
      console.log("Lease application:", lease?.application);
      
      if (lease?.application) {
        // Split fullName into firstName and lastName
        const fullName = lease.application.fullName || "";
        const nameParts = fullName.trim().split(/\s+/); // Split on whitespace
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        
        console.log("Prefilling with:", {
          email: lease.application.email,
          firstName,
          lastName,
          phone: lease.application.phone
        });
        
        setEmail(lease.application.email || "");
        setFirstName(firstName);
        setLastName(lastName);
        setPhone(lease.application.phone || "");
      } else {
        console.log("No application data found on lease");
        // Clear if no application data
        setEmail("");
        setFirstName("");
        setLastName("");
        setPhone("");
      }
    } else {
      console.log("No lease selected, clearing form");
      // Clear if no lease selected
      setEmail("");
      setFirstName("");
      setLastName("");
      setPhone("");
    }
  }, [selectedLeaseId, leases]);

  const validateForm = () => {
    if (!selectedLeaseId) {
      setError("Please select a lease");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!firstName.trim()) {
      setError("First name is required");
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleInvite = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/invites/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), 
          firstName: firstName.trim(), 
          lastName: lastName.trim(), 
          phone: phone.trim(), 
          leaseId: selectedLeaseId 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to send invite");
      }

      // Add new invite to the list
      setInvites(prev => [data.tenant, ...prev]);
      
      // Show success message
      setSuccessMessage("Invite sent successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Close dialog and reset form
      setIsOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedLeaseId(null);
    setEmail("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setError(null);
  };

  const copyInviteLink = async (token: string, email: string) => {
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/invite/accept?email=${encodeURIComponent(email)}&token=${token}`;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error("Failed to copy link");
      setError("Failed to copy link to clipboard");
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0a1628] to-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#30D5C8] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading invites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0a1628] to-[#0f172a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tenant Invites</h1>
            <p className="text-gray-400 text-sm">Manage and track your tenant invitations</p>
          </div>
          <button
            onClick={() => {
              setIsOpen(true);
              setError(null);
            }}
            className="bg-[#30D5C8] text-[#0f172a] px-6 py-3 rounded-lg font-semibold hover:bg-[#28bfb4] transition-all duration-200 shadow-lg hover:shadow-[#30D5C8]/20 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Invite
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Total Invites</p>
            <p className="text-3xl font-bold text-white">{invites.length}</p>
          </div>
          <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{invites.filter(i => !i.accepted).length}</p>
          </div>
          <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Accepted</p>
            <p className="text-3xl font-bold text-[#30D5C8]">{invites.filter(i => i.accepted).length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full bg-[#0a1628] border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8] focus:border-transparent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="bg-[#0a1628] border border-[#15386a] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8] focus:border-transparent min-w-[160px]"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as "ALL" | "ACCEPTED" | "PENDING")}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#15386a]/30 backdrop-blur-sm border border-[#15386a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#15386a]/50">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-semibold text-sm">Email</th>
                  <th className="text-left p-4 text-gray-300 font-semibold text-sm">Name</th>
                  <th className="text-left p-4 text-gray-300 font-semibold text-sm">Phone</th>
                  <th className="text-left p-4 text-gray-300 font-semibold text-sm">Status</th>
                  <th className="text-left p-4 text-gray-300 font-semibold text-sm">Created At</th>
                  <th className="text-left p-4 text-gray-300 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvites.map((inv) => (
                  <tr key={inv.id} className="border-t border-[#15386a]/50 hover:bg-[#15386a]/20 transition-colors">
                    <td className="p-4 text-gray-200">{inv.email}</td>
                    <td className="p-4 text-gray-200">{inv.firstName || inv.lastName ? `${inv.firstName ?? ""} ${inv.lastName ?? ""}`.trim() : "-"}</td>
                    <td className="p-4 text-gray-200">{inv.phone ?? "-"}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${inv.accepted ? "bg-[#30D5C8]/20 text-[#30D5C8]" : "bg-yellow-500/20 text-yellow-400"}`}>
                        {inv.accepted ? "Accepted" : "Pending"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{new Date(inv.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</td>
                    <td className="p-4">
                      {!inv.accepted && (
                        <button
                          onClick={() => copyInviteLink(inv.token, inv.email)}
                          className="flex items-center gap-2 bg-[#15386a] hover:bg-[#15386a]/80 text-[#30D5C8] px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                          title="Copy invite link"
                        >
                          {copiedToken === inv.token ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy Link
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredInvites.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-12">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-400 text-lg">No invites found</p>
                        <p className="text-gray-500 text-sm">Try adjusting your filters or create a new invite</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <AlertDialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <AlertDialogContent className="bg-[#0a1628] border-[#15386a] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-white mb-2">Invite New Tenant</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">Send an invitation to a new tenant</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Select Lease *</label>
              <select
                value={selectedLeaseId || ""}
                onChange={(e) => setSelectedLeaseId(e.target.value || null)}
                className="w-full bg-[#15386a]/30 border border-[#15386a] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8]"
                disabled={loading}
              >
                <option value="">-- Select a lease ({leases.length} available) --</option>
                {leases.map(lease => {
                  const unitNum = lease.unit?.unitNumber || "N/A";
                  const unitName = lease.unit?.unitName || "";
                  const city = lease.property?.city || "";
                  const address = lease.property?.address || "No Address";
                  
                  // Combine city and address properly
                  const fullAddress = city && address !== city 
                    ? `${address}${city ? `, ${city}` : ''}` 
                    : address;
                  
                  const displayName = unitName ? `${unitNum} (${unitName})` : unitNum;
                  
                  return (
                    <option key={lease.id} value={lease.id}>
                      Unit {displayName} - {fullAddress}
                    </option>
                  );
                })}
              </select>
              {leases.length === 0 && (
                <p className="text-yellow-400 text-xs mt-2">No leases available. Please create a lease first.</p>
              )}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email Address *</label>
              <input 
                type="email" 
                placeholder="tenant@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-[#15386a]/30 border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8]"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">First Name *</label>
              <input 
                type="text" 
                placeholder="John" 
                value={firstName} 
                onChange={e => setFirstName(e.target.value)} 
                className="w-full bg-[#15386a]/30 border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8]"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
              <input 
                type="text" 
                placeholder="Doe" 
                value={lastName} 
                onChange={e => setLastName(e.target.value)} 
                className="w-full bg-[#15386a]/30 border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8]"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Phone Number</label>
              <input 
                type="text" 
                placeholder="+1 (555) 000-0000" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                className="w-full bg-[#15386a]/30 border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8]"
                disabled={loading}
              />
            </div>
          </div>

          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel 
              className="bg-[#15386a]/50 text-gray-300 hover:bg-[#15386a] border-none"
              disabled={loading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleInvite} 
              disabled={loading} 
              className="bg-[#30D5C8] text-[#0f172a] hover:bg-[#28bfb4]"
            >
              {loading ? "Sending..." : "Send Invite"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}