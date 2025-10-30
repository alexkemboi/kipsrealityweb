"use client";

import { useEffect, useState } from "react";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export default function ContactsDashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch("/api/contact");
        const data = await res.json();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Loading contacts...</p>;
  }

  if (contacts.length === 0) {
    return <p className="text-center mt-10 text-gray-600">No contact messages yet.</p>;
  }

  return (
    <section className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Contact Messages</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{contact.name}</h3>
            <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong> {contact.email}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Phone:</strong> {contact.phone}</p>
            <p className="text-sm text-gray-700 mt-3 italic">"{contact.message}"</p>
            <p className="text-xs text-gray-400 mt-4">
              {new Date(contact.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
