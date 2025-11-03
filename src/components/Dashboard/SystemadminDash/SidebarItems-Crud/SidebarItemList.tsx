"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SidebarItemForm, { UserRole } from "./SidebarItemForm";

interface SidebarItem {
  id: number;
  label: string;
  path: string;
  role: UserRole;
  section?: string;
  feature?: { title: string };
  plans?: { name: string }[];
  order?: number;
  isActive?: boolean;
  badge?: string;
}

export default function SidebarItemList() {
  const [items, setItems] = useState<SidebarItem[]>([]);
  const [editingItem, setEditingItem] = useState<SidebarItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Don't pass role parameter to get ALL items for admin view
      const res = await fetch("/api/sidebarItem?all=true");
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Fetched items:", data); // Debug log
      
      setItems(data.map((i: any) => ({ ...i, role: i.role as UserRole })));
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch sidebar items");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this sidebar item?")) {
      return;
    }

    setDeleting(id);
    try {
      const res = await fetch(`/api/sidebarItem/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Sidebar item deleted successfully");
      fetchItems();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete sidebar item");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">Loading sidebar items...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sidebar Items</h1>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
        >
          + Create Sidebar Item
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl relative max-h-[90vh] overflow-hidden">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              onClick={() => setShowForm(false)}
            >
              <span className="text-2xl">✕</span>
            </button>
            <SidebarItemForm
              item={editingItem}
              onSaved={() => {
                setShowForm(false);
                fetchItems();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No sidebar items found.</p>
          <p className="text-sm mt-2">Click "Create Sidebar Item" to add one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((item) => (
              <div
                key={item.id}
                className={`border rounded-lg p-4 transition-colors ${
                  item.isActive === false ? "bg-gray-50 opacity-60" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{item.label}</h3>
                      {item.badge && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {item.badge}
                        </span>
                      )}
                      {item.isActive === false && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">Path:</span> {item.path}
                      </div>
                      <div>
                        <span className="font-medium">Role:</span>{" "}
                        <span className="inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                          {item.role}
                        </span>
                      </div>
                      {item.section && (
                        <div>
                          <span className="font-medium">Section:</span> {item.section}
                        </div>
                      )}
                      {item.order !== undefined && (
                        <div>
                          <span className="font-medium">Order:</span> {item.order}
                        </div>
                      )}
                      {item.feature && (
                        <div>
                          <span className="font-medium">Feature:</span>{" "}
                          <span className="text-green-600">{item.feature.title}</span>
                        </div>
                      )}
                      {item.plans && item.plans.length > 0 && (
                        <div>
                          <span className="font-medium">Plans:</span>{" "}
                          {item.plans.map((p) => p.name).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
                      onClick={() => {
                        setEditingItem(item);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                    >
                      {deleting === item.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}