"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface NavbarItemFormProps {
  selectedItem: any | null;
  onSave: (item: any) => Promise<void> | void;
  onCancel: () => void;
  allItems: any[]; // For parent selection
}

export default function NavbarItemForm({ 
  selectedItem, 
  onSave, 
  onCancel,
  allItems 
}: NavbarItemFormProps) {
  const [form, setForm] = useState({
    id: undefined,
    name: "",
    href: "",
    order: 0,
    isVisible: true,
    isAvailable: true,
    parentId: null as number | null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setForm(selectedItem);
    } else {
      resetForm();
    }
  }, [selectedItem]);

  const resetForm = () => {
    setForm({
      id: undefined,
      name: "",
      href: "",
      order: 0,
      isVisible: true,
      isAvailable: true,
      parentId: null,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : (name === "parentId" ? (value === "" ? null : Number(value)) : value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(form);
      toast.success(form.id ? " Navbar item updated!" : " Navbar item added!");
      if (!form.id) resetForm();
    } catch (error) {
      console.error(error);
      toast.error(" Failed to save item.");
    } finally {
      setLoading(false);
    }
  };

  // Get top-level items only for parent selection (exclude current item to prevent self-referencing)
  const topLevelItems = allItems.filter(item => 
    !item.parentId && item.id !== form.id
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-[#0b1f3a] text-white p-6 rounded-2xl shadow-md w-full max-w-2xl mx-auto"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#30D5C8] mb-1">
            Name *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., Services, About Us"
            className="border border-[#30D5C8]/40 p-2 rounded-md w-full bg-[#15386a] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#30D5C8] focus:outline-none"
            required
          />
        </div>

        {/* Href */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#30D5C8] mb-1">
            Link (href) *
          </label>
          <input
            name="href"
            value={form.href}
            onChange={handleChange}
            placeholder="e.g., /services or #"
            className="border border-[#30D5C8]/40 p-2 rounded-md w-full bg-[#15386a] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#30D5C8] focus:outline-none"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Use "#" for parent items with submenus
          </p>
        </div>

        {/* Parent Selection */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#30D5C8] mb-1">
            Parent Item (Optional)
          </label>
          <select
            name="parentId"
            value={form.parentId ?? ""}
            onChange={handleChange}
            className="border border-[#30D5C8]/40 p-2 rounded-md w-full bg-[#15386a] text-white focus:ring-2 focus:ring-[#30D5C8] focus:outline-none"
          >
            <option value="">None (Top-level item)</option>
            {topLevelItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Select a parent to create a submenu item
          </p>
        </div>

        {/* Order */}
        <div>
          <label className="block text-sm font-medium text-[#30D5C8] mb-1">
            Order
          </label>
          <input
            name="order"
            type="number"
            value={form.order}
            onChange={handleChange}
            placeholder="0"
            className="border border-[#30D5C8]/40 p-2 rounded-md w-full bg-[#15386a] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#30D5C8] focus:outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Lower numbers appear first
          </p>
        </div>

        {/* Visible & Available */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              name="isVisible"
              type="checkbox"
              checked={form.isVisible}
              onChange={handleChange}
              className="w-4 h-4 accent-[#30D5C8] cursor-pointer"
            />
            <span className="text-sm">Visible on navbar</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              name="isAvailable"
              type="checkbox"
              checked={form.isAvailable}
              onChange={handleChange}
              className="w-4 h-4 accent-[#30D5C8] cursor-pointer"
            />
            <span className="text-sm">Available for use</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
            loading
              ? "bg-[#15386a] opacity-70 cursor-not-allowed text-gray-400"
              : "bg-[#30D5C8] hover:bg-[#25b9ad] text-[#0b1f3a]"
          }`}
        >
          {loading ? "Saving..." : form.id ? "Update Item" : "Add Item"}
        </button>

        {selectedItem && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-md bg-white text-[#0b1f3a] hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}