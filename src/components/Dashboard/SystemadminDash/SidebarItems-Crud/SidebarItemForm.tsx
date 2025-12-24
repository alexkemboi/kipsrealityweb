"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Plan { id: number; name: string; }
interface Feature { id: number; title: string; }

export type UserRole = "SYSTEM_ADMIN" | "PROPERTY_MANAGER" | "TENANT" | "VENDOR" | "ALL";

interface SidebarItem {
  id?: number;
  label: string;
  path: string;
  role?: UserRole;
  icon?: string;
  section?: string;
  order?: number;
  badge?: string;
  description?: string;
  isActive?: boolean;
  isExternal?: boolean;
  target?: string;
  featureId?: number | null;
  planIds?: number[];
}

interface Props {
  item?: SidebarItem | null;
  onSaved: () => void;
  onCancel?: () => void;
}

const INITIAL_FORM_STATE: SidebarItem = {
  label: "",
  path: "",
  role: "ALL",
  icon: "",
  section: "",
  order: undefined,
  badge: "",
  description: "",
  isActive: true,
  isExternal: false,
  target: "",
  featureId: null,
  planIds: [],
};

export default function SidebarItemForm({ item, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<SidebarItem>(INITIAL_FORM_STATE);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setForm({
        ...INITIAL_FORM_STATE,
        ...item,
        planIds: item.planIds || [],
      });
    }

    fetchInitialData();
  }, [item]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [fRes, pRes] = await Promise.all([
        fetch("/api/feature"),
        fetch("/api/plan")
      ]);

      if (!fRes.ok || !pRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [featuresData, plansData] = await Promise.all([
        fRes.json(),
        pRes.json()
      ]);

      setFeatures(featuresData);
      setPlans(plansData);
    } catch (error) {
      toast.error("Failed to load features and plans");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.label.trim()) {
      newErrors.label = "Label is required";
    }

    if (!form.path.trim()) {
      newErrors.path = "Path is required";
    } else if (!form.path.startsWith("/")) {
      newErrors.path = "Path must start with /";
    }

    if (!form.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlans = Array.from(e.target.selectedOptions, opt => Number(opt.value));
    setForm(prev => ({ ...prev, planIds: selectedPlans }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSaving(true);

    const method = item?.id ? "PUT" : "POST";
    const url = item?.id ? `/api/sidebarItem/${item.id}` : "/api/sidebarItem";

    // Clean up form data - ensure all required fields are included
    const payload = {
      label: form.label,
      path: form.path,
      role: form.role, // Required field
      icon: form.icon || null,
      section: form.section || null,
      order: form.order ? Number(form.order) : null,
      badge: form.badge || null,
      description: form.description || null,
      isActive: form.isActive ?? true,
      isExternal: form.isExternal ?? false,
      target: form.target || null,
      featureId: form.featureId || null,
      planIds: form.planIds || [],
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success(`Sidebar item ${item ? "updated" : "created"} successfully`);
      setForm(INITIAL_FORM_STATE);
      onSaved();
    } catch (error) {
      toast.error("Failed to save sidebar item");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(item || INITIAL_FORM_STATE);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="max-h-[80vh] bg-white rounded-md shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto bg-white rounded-md shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {item ? "Edit Sidebar Item" : "Create Sidebar Item"}
          </h2>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4 pb-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Basic Information</h3>
            
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                Label <span className="text-red-500">*</span>
              </label>
              <input
                id="label"
                name="label"
                value={form.label}
                onChange={handleChange}
                placeholder="e.g., Dashboard"
                required
                className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.label ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.label && <p className="mt-1 text-sm text-red-500">{errors.label}</p>}
            </div>

            <div>
              <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-1">
                Path <span className="text-red-500">*</span>
              </label>
              <input
                id="path"
                name="path"
                value={form.path}
                onChange={handleChange}
                placeholder="/dashboard"
                required
                className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.path ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.path && <p className="mt-1 text-sm text-red-500">{errors.path}</p>}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={form.role || ""}
                onChange={handleChange}
                required
                className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.role ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">-- Select Role --</option>
                <option value="SYSTEM_ADMIN">System Admin</option>
                <option value="PROPERTY_MANAGER">Property Manager</option>
                <option value="TENANT">Tenant</option>
                <option value="VENDOR">Vendor</option>
                <option value="ALL">All Roles</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                placeholder="Brief description of this menu item"
                rows={3}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-4 pb-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Display Options</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <input
                  id="icon"
                  name="icon"
                  value={form.icon || ""}
                  onChange={handleChange}
                  placeholder="e.g., home"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="badge" className="block text-sm font-medium text-gray-700 mb-1">
                  Badge
                </label>
                <input
                  id="badge"
                  name="badge"
                  value={form.badge || ""}
                  onChange={handleChange}
                  placeholder="e.g., New"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <input
                  id="section"
                  name="section"
                  value={form.section || ""}
                  onChange={handleChange}
                  placeholder="e.g., Main"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  id="order"
                  name="order"
                  type="number"
                  value={form.order || ""}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Access Control */}
          <div className="space-y-4 pb-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Access Control</h3>

            <div>
              <label htmlFor="featureId" className="block text-sm font-medium text-gray-700 mb-1">
                Feature Gate
              </label>
              <select
                id="featureId"
                name="featureId"
                value={form.featureId || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- No Feature Restriction --</option>
                {features.map(f => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Link to a feature flag to control visibility</p>
            </div>

            <div>
              <label htmlFor="planIds" className="block text-sm font-medium text-gray-700 mb-1">
                Plans
              </label>
              <select
                id="planIds"
                multiple
                name="planIds"
                value={form.planIds?.map(String) || []}
                onChange={handlePlanChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple plans</p>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Advanced Options</h3>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive ?? true}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isExternal"
                  checked={form.isExternal ?? false}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Open in new tab</span>
              </label>
            </div>

            <div>
              <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
                Target
              </label>
              <input
                id="target"
                name="target"
                value={form.target || ""}
                onChange={handleChange}
                placeholder="e.g., _blank"
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="mt-1 text-xs text-gray-500">HTML target attribute for links</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-green-500 hover:bg-green-500 disabled:bg-green-300 text-white font-medium py-2.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </span>
            ) : (
              item ? "Update Item" : "Create Item"
            )}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}