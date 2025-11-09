//components/dashboard/propertymanagerdash/tenant/tenantInviteForm.tsx
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
  const [loading, setLoading] = useState(false);

  // Fetch invites
  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await fetch("/api/auth/invites/tenant");
        const data = await res.json();
        setInvites(data.invites || []);
        setFilteredInvites(data.invites || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInvites();
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

  const handleInvite = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/invites/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invite");

      setInvites(prev => [data.tenant, ...prev]);
      setIsOpen(false);

      // Clear inputs
      setEmail("");
      setFirstName("");
      setLastName("");
      setPhone("");
    } catch (err: any) {
      console.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async (token: string, email: string) => {
    const baseUrl = window.location.origin;
    // Use token instead of id
    const inviteLink = `${baseUrl}/invite/accept?email=${encodeURIComponent(email)}&token=${token}`;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0a1628] to-[#0f172a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tenant Invites</h1>
            <p className="text-gray-400 text-sm">Manage and track your tenant invitations</p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
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
              onChange={e => setFilterStatus(e.target.value as any)}
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
                  <tr 
                    key={inv.id} 
                    className="border-t border-[#15386a]/50 hover:bg-[#15386a]/20 transition-colors"
                  >
                    <td className="p-4 text-gray-200">{inv.email}</td>
                    <td className="p-4 text-gray-200">
                      {inv.firstName || inv.lastName 
                        ? `${inv.firstName ?? ""} ${inv.lastName ?? ""}`.trim() 
                        : "-"}
                    </td>
                    <td className="p-4 text-gray-200">{inv.phone ?? "-"}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        inv.accepted 
                          ? "bg-[#30D5C8]/20 text-[#30D5C8]" 
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {inv.accepted ? "Accepted" : "Pending"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(inv.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
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

      {/* Modal for Invite Form */}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-[#0a1628] border-[#15386a] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-white mb-2">
              Invite New Tenant
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Send an invitation to a new tenant
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email Address *</label>
              <input
                type="email"
                placeholder="tenant@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#15386a]/30 border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">First Name *</label>
              <input
                type="text"
                placeholder="John"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full bg-[#15386a]/30 border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full bg-[#15386a]/30 border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Phone Number</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-[#15386a]/30 border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8] focus:border-transparent"
              />
            </div>
          </div>
          
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="bg-[#15386a]/50 text-gray-300 hover:bg-[#15386a] border-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleInvite}
              disabled={loading || !email || !firstName}
              className="bg-[#30D5C8] text-[#0f172a] hover:bg-[#28bfb4] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? "Sending..." : "Send Invite"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}