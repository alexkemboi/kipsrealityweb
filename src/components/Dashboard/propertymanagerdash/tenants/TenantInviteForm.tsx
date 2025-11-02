"use client";

import { useState } from "react";

export default function InviteTenantForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [message, setMessage] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/invites/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, phone }),
        credentials: "include", // sends cookies automatically
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong");
        return;
      }

      setInviteLink(data.inviteLink || "");
      setMessage(data.message || "Tenant invited successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Invite Tenant</h2>
      <form onSubmit={handleInvite} className="space-y-2">
        <input
          type="email"
          placeholder="Tenant Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Send Invite
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
      {inviteLink && (
        <p className="mt-2">
          Invite Link (dev only):{" "}
          <a href={inviteLink} target="_blank" className="text-blue-600 underline">
            {inviteLink}
          </a>
        </p>
      )}
    </div>
  );
}
