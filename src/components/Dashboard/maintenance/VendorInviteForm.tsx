"use client";

import { useState } from "react";
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

interface VendorInviteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (vendorData: any) => void;
}

export default function VendorInviteForm({ isOpen, onClose, onSuccess }: VendorInviteFormProps) {
  // Form state
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState<"Plumbing" | "Electrical" | "HVAC" | "General" | "Other">("General");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/invites/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          companyName,
          firstName, 
          lastName, 
          phone,
          serviceType 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invite");

      onSuccess?.(data.vendor);
      onClose();

      // Clear inputs
      setEmail("");
      setCompanyName("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setServiceType("General");
    } catch (err: any) {
      console.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[#0a1628] border-[#15386a] max-w-md flex flex-col max-h-[80vh]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-white mb-2">
            Invite Vendor
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Send an invitation to a new maintenance vendor
          </AlertDialogDescription>
        </AlertDialogHeader>
        
  <div className="flex-1 overflow-auto space-y-4 py-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Company Name *</label>
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full bg-[#15386a]/30 border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Service Type *</label>
            <select
              value={serviceType}
              onChange={e => setServiceType(e.target.value as any)}
              className="w-full bg-[#15386a]/30 border border-[#15386a] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8] focus:border-transparent"
            >
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="HVAC">HVAC</option>
              <option value="General">General Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email Address *</label>
            <input
              type="email"
              placeholder="vendor@example.com"
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
        
  <AlertDialogFooter className="gap-3 mt-4">
          <AlertDialogCancel className="bg-[#15386a]/50 text-gray-300 hover:bg-[#15386a] border-none">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleInvite}
            disabled={loading || !email || !firstName || !companyName}
            className="bg-[#30D5C8] text-[#0f172a] hover:bg-[#28bfb4] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "Sending..." : "Send Invite"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}