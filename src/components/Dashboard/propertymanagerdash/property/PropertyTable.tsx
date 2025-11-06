"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Pencil, Building2, Home } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateProperty, deleteProperty } from "@/lib/property-manager";

interface PropertyTableProps {
  properties: any[]; // You can replace with Property[]
}

export default function PropertyTable({ properties }: PropertyTableProps) {
  const [propertyList, setPropertyList] = useState(properties);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Open edit modal
  const openEditModal = (property: any) => {
    setSelectedProperty(property);
    setFormData({
      name: property.name,
      city: property.city,
      address: property.address,
      amenities: property.details?.amenities,
      isFurnished: property.details?.isFurnished,
      availabilityStatus: property.availabilityStatus,
    });
    setEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (property: any) => {
    setSelectedProperty(property);
    setDeleteModalOpen(true);
  };

  // Save edit
  const handleEditSave = async () => {
    if (!selectedProperty?.id) return;
    setLoadingId(selectedProperty.id);
    try {
      const payload = {
        ...selectedProperty,
        ...formData,
      };
      const updated = await updateProperty(selectedProperty.id, payload);
      setPropertyList((prev) =>
        prev.map((p) => (p.id === selectedProperty.id ? updated : p))
      );
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error updating property");
    } finally {
      setLoadingId(null);
    }
  };

  // Confirm delete
  const handleDelete = async () => {
    if (!selectedProperty?.id) return;
    setLoadingId(selectedProperty.id);
    try {
      await deleteProperty(selectedProperty.id);
      setPropertyList((prev) =>
        prev.filter((p) => p.id !== selectedProperty.id)
      );
      setDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error deleting property");
    } finally {
      setLoadingId(null);
    }
  };

  if (propertyList.length === 0) {
    return <div className="text-center text-gray-500 mt-10">No properties available.</div>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Location</th>
              <th className="px-6 py-3 text-left">Details</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {propertyList.map((p) => {
              const isApartment = p.type === "Apartment";
              return (
                <tr key={p.id} className="border-t hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 flex items-center gap-2">
                    {isApartment ? <Building2 className="text-blue-600 w-4 h-4" /> : <Home className="text-green-600 w-4 h-4" />}
                    <span className="capitalize">{p.type}</span>
                  </td>
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-gray-600">{p.city}, {p.address}</td>
                  <td className="px-6 py-4 text-xs">
                    {isApartment ? (
                      <div className="space-y-1">
                        <p>Building: {p.details?.buildingName || "N/A"}</p>
                        <p>Floors: {p.details?.totalFloors || "N/A"}</p>
                        <p>Units: {p.details?.totalUnits || "N/A"}</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p>Bedrooms: {p.details?.bedrooms || "N/A"}</p>
                        <p>Bathrooms: {p.details?.bathrooms || "N/A"}</p>
                        <p>Size: {p.details?.size ? `${p.details.size} sqft` : "N/A"}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className={`px-2 py-1 rounded-full ${p.availabilityStatus === "Available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.availabilityStatus || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-3 text-center">
                    <button
                      onClick={() => openEditModal(p)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Pencil className="w-4 h-4" /> Update
                    </button>
                    <button
                      onClick={() => openDeleteModal(p)}
                      disabled={loadingId === p.id}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" /> {loadingId === p.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- Edit Modal --- */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-4">
              <Label>Name</Label>
              <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <Label>City</Label>
              <Input value={formData.city || ""} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              <Label>Address</Label>
              <Input value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              <Label>Amenities</Label>
              <Textarea value={formData.amenities || ""} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} />
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isFurnished || false} onChange={(e) => setFormData({ ...formData, isFurnished: e.target.checked })} />
                <Label>Furnished</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={loadingId !== null}>
              {loadingId === selectedProperty?.id ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Delete Modal --- */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete <strong>{selectedProperty?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loadingId !== null}>
              {loadingId === selectedProperty?.id ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
