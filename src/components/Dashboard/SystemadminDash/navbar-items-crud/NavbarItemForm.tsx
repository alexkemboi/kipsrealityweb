"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface NavbarItemFormProps {
  selectedItem: any | null;
  onSave: (item: any) => Promise<void> | void;
  onCancel: () => void;
}

export default function NavbarItemForm({ selectedItem, onSave, onCancel }: NavbarItemFormProps) {
  const [form, setForm] = useState({
    id: undefined,
    name: "",
    href: "",
    order: 0,
    isVisible: true,
    isAvailable: true,
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
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
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

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-[#0b1f3a] text-white p-6 rounded-2xl shadow-md w-full max-w-xl mx-auto"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="border border-[#30D5C8]/40 p-2 rounded-md w-full bg-[#15386a] text-white placeholder-gray-300 focus:ring-2 focus:ring-[#30D5C8] focus:outline-none"
          required
        />

        <input
          name="href"
          value={form.href}
          onChange={handleChange}
          placeholder="Href (e.g. /about)"
          className="border border-[#30D5C8]/40 p-2 rounded-md w-full bg-[#15386a] text-white placeholder-gray-300 focus:ring-2 focus:ring-[#30D5C8] focus:outline-none"
          required
        />

        <input
          name="order"
          type="number"
          value={form.order}
          onChange={handleChange}
          placeholder="Order"
          className="border border-[#30D5C8]/40 p-2 rounded-md w-full bg-[#15386a] text-white placeholder-gray-300 focus:ring-2 focus:ring-[#30D5C8] focus:outline-none"
        />

        <label className="flex items-center space-x-2">
          <input
            name="isVisible"
            type="checkbox"
            checked={form.isVisible}
            onChange={handleChange}
            className="accent-[#30D5C8]"
          />
          <span>Visible</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            name="isAvailable"
            type="checkbox"
            checked={form.isAvailable}
            onChange={handleChange}
            className="accent-[#30D5C8]"
          />
          <span>Available</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white font-medium transition-all duration-200 ${
            loading
              ? "bg-[#15386a] opacity-70 cursor-not-allowed"
              : "bg-[#30D5C8] hover:bg-[#25b9ad] text-[#0b1f3a]"
          }`}
        >
          {loading ? "Saving..." : form.id ? "Update Item" : "Add Item"}
        </button>

        {selectedItem && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-white text-[#0b1f3a] hover:bg-gray-200 transition-all duration-200"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
