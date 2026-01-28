"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, CheckCircle2, Clock, Trash2, Send, X } from "lucide-react";

interface Invite {
  id: string;
  token: string;
  email: string;
  accepted: boolean;
  createdAt: string;
  expiresAt: string;
}

export default function VendorInviteForm() {
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [filteredInvites, setFilteredInvites] = useState<Invite[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACCEPTED" | "PENDING">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [serviceType, setServiceType] = useState("");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvites = async () => {
      setInitialLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/auth/invites/vendor");
        if (!res.ok) throw new Error("Failed to fetch vendor invites");
        const data = await res.json();
        setInvites(data.invites || []);
        setFilteredInvites(data.invites || []);
      } catch (err) {
        console.error("Error fetching vendor invites:", err);
        setError(err instanceof Error ? err.message : "Failed to load invites");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInvites();
  }, []);

  useEffect(() => {
    let filtered = invites;

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((inv) =>
        filterStatus === "ACCEPTED" ? inv.accepted : !inv.accepted
      );
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((inv) =>
        inv.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInvites(filtered);
  }, [searchTerm, filterStatus, invites]);

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!companyName.trim()) {
      setError("Company name is required");
      return false;
    }
    if (!serviceType.trim()) {
      setError("Service type is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/invites/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase(),
          firstName,
          lastName,
          phone,
          companyName,
          serviceType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send invite");
      }

      toast.success("Vendor invite sent successfully!");
      setSuccessMessage("Invite sent successfully!");

      setEmail("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setCompanyName("");
      setServiceType("");
      setIsModalOpen(false);

      const invitesRes = await fetch("/api/auth/invites/vendor");
      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setInvites(invitesData.invites || []);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (inviteLink: string, token: string) => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedToken(token);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/auth/invites/vendor/${inviteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete invite");

      toast.success("Invite deleted successfully");
      setInvites(invites.filter((inv) => inv.id !== inviteId));
      setShowDeleteConfirm(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete invite");
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error("Environment variable NEXT_PUBLIC_BASE_URL is not set.");
  }
  const generateInviteLink = (token: string, inviteEmail: string) => {
    return `${baseUrl}/inviteor?email=${encodeURIComponent(inviteEmail)}&token=${token}`;
  };

  return (
    <div className="space-y-6 bg-white">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 mb-4 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Vendor Management</h2>
          <p className="text-black text-sm mt-1">Invite and manage service vendors</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-colors"
        >
          <Send size={18} />
          Send Vendor Invite
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Send Vendor Invite</h3>
                <p className="text-gray-600 text-sm mt-1">Fill in the vendor details and send them an invitation to sign up.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendor@example.com"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ABC Services Inc"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                  required
                >
                  <option value="">Select a service type</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Landscaping">Landscaping</option>
                  <option value="Painting">Painting</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-gray-600 text-sm mb-1">Total Invites</p>
          <p className="text-3xl font-bold text-gray-900">{invites.length}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-gray-600 text-sm mb-1">Pending Invites</p>
          <p className="text-3xl font-bold text-yellow-600">
            {invites.filter((i) => !i.accepted).length}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by email..."
            className="flex-1 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent min-w-40"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "ALL" | "ACCEPTED" | "PENDING")}
          >
            <option value="ALL">All Invites</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
          </select>
        </div>
      </div>

      {initialLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading invites...</div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3 text-gray-700 font-semibold text-sm">Email</th>
                  <th className="text-left p-3 text-gray-700 font-semibold text-sm">Status</th>
                  <th className="text-left p-3 text-gray-700 font-semibold text-sm">Created</th>
                  <th className="text-left p-3 text-gray-700 font-semibold text-sm">Expires</th>
                  <th className="text-left p-3 text-gray-700 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvites.length > 0 ? (
                  filteredInvites.map((invite) => {
                    const inviteLink = generateInviteLink(invite.token, invite.email);
                    const isExpired = new Date(invite.expiresAt) < new Date();
                    const isAccepted = invite.accepted;

                    return (
                      <tr
                        key={invite.id}
                        className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 text-gray-900">{invite.email}</td>
                        <td className="p-3">
                          {isAccepted ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                              <CheckCircle2 size={14} />
                              Accepted
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              <Clock size={14} />
                              Expired
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                              <Clock size={14} />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-gray-900 text-sm">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-gray-900 text-sm">
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <button 
                            onClick={() => router.push(`/property-manager/vendors/${invite.id}`)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium transition-colors"
                          >
                            View Details
                          </button>
                          <div className="flex items-center gap-2 flex-wrap mt-2">
                            {!isAccepted && !isExpired && (
                              <button
                                onClick={() => copyToClipboard(inviteLink, invite.token)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                              >
                                {copiedToken === invite.token ? (
                                  <>
                                    <CheckCircle2 size={14} />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} />
                                    Copy Link
                                  </>
                                )}
                              </button>
                            )}

                            {showDeleteConfirm === invite.id && (
                              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-sm shadow-xl">
                                  <h4 className="text-gray-900 font-bold mb-2">Delete Invite?</h4>
                                  <p className="text-gray-600 text-sm mb-4">This action cannot be undone. The vendor will not receive this invite.</p>
                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => setShowDeleteConfirm(null)}
                                      className="flex-1 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleDeleteInvite(invite.id)}
                                      className="flex-1 px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* <button
                              onClick={() => setShowDeleteConfirm(invite.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center p-12">
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 9H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-gray-600 text-lg">No vendor invites yet</p>
                        <p className="text-gray-500 text-sm">
                          Send your first vendor invite to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
