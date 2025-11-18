"use client";

import { useEffect, useState } from "react";
import { getProperties, deleteProperty } from "@/lib/property-manager";
import { Building2, Home, MapPin, Bed, Bath, User, Building } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PropertyForm from '@/components/website/PropertyManager/RegisterPropertyForm';
import EditPropertyForm from '@/components/website/PropertyManager/UpdatePropertyForm';



export default function PropertyManagerPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);


  const { user } = useAuth();

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user?.organizationUserId || !user?.organization?.id) {
        setError("Please log in to view properties");
        setLoading(false);
        return;
      }

      try {
        const data = await getProperties(
          user.organizationUserId,     
          user.organization.id        
        );

        setProperties(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch properties");
      } finally {
        setLoading(false);
      }
    };


    fetchProperties();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No properties found.</p>
          <p className="text-gray-400 text-sm mt-2">Start by adding your first property.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {user?.organization && (
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
            <Building className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">{user.organization.name}</span>
          </div>
        )}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">My Properties</h1>
          <p className="text-gray-500 mt-1">
            Managing {properties.length} {properties.length === 1 ? "property" : "properties"}
          </p>
        </div>
        
 {/* Add Property Button */}
  <button
    onClick={() => setIsModalOpen(true)}
    className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
  >
    + Add Property
  </button>


      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
{/* Add Property Modal */}
{isModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-3xl p-6 relative">

      {/* Close button */}
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-4 right-4 text-gray-500 text-lg hover:text-gray-700"
      >
        ✕
      </button>

      {/* PropertyForm Component */}
      <PropertyForm />
    </div>
  </div>
)}

 {/* Edit Property Modal */}
        {editModalOpen && selectedProperty && (
          <Modal close={() => setEditModalOpen(false)}>
            <h2 className="text-xl font-semibold mb-4">Update Property</h2>
            <EditPropertyForm
              initialData={selectedProperty}
              onSuccess={() => { setEditModalOpen(false); refreshProperties(); }}
            />
          </Modal>
        )}

        {/* Delete Property Modal */}
        {deleteModalOpen && selectedProperty && (
          <Modal close={() => setDeleteModalOpen(false)}>
            <h2 className="text-xl font-semibold text-red-600">Confirm Delete</h2>
            <p className="text-gray-700 mt-3">
              Are you sure you want to delete <strong>{selectedProperty.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteProperty(selectedProperty.id);
                    setDeleteModalOpen(false);
                    refreshProperties();
                  } catch (err) {
                    console.error(err);
                    alert("Failed to delete property.");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </Modal>
        )}



        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Property</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Details</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Manager</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700"> Actions
</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
                  onClick={() => window.location.href = `/property-manager/view-own-property/${p.id}`}
                >
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      {p.type?.toLowerCase() === "apartment" ? (
                        <Building2 className="text-blue-600 w-6 h-6" />
                      ) : (
                        <Home className="text-green-600 w-6 h-6" />
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
  {p.type}
</h2>

{/* Show buildingName if type is apartment */}
{p.type?.toLowerCase() === "apartment" && p.details?.buildingName && (
  <p className="text-sm text-blue-600 font-medium mt-1">
    {p.details.buildingName}
  </p>
)}

{/* Show houseName if it exists */}
{p.details?.houseName && (
  <p className="text-sm text-blue-600 font-medium mt-1">
    {p.details.houseName}
  </p>
)}
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                      {p.type}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="max-w-[200px] truncate">{p.city}, {p.address}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    {p.type?.toLowerCase() === "apartment" ? (
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Floors: {p.details?.totalFloors || "N/A"}</div>
                        <div>Units: {p.details?.totalUnits || "N/A"}</div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{p.details?.bedrooms || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{p.details?.bathrooms || "N/A"}</span>
                        </div>
                        {p.details?.size && <span>{p.details.size} sqft</span>}
                      </div>
                    )}
                  </td>
                  <td className="py-5 px-6">
                    {p.manager && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div className="text-sm">
                          <div className="font-medium text-gray-700">{p.manager.firstName} {p.manager.lastName}</div>
                          <div className="text-xs text-gray-500 capitalize">{p.manager.role?.replace(/_/g, ' ').toLowerCase()}</div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-5 px-6">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          p.availabilityStatus === "available" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {p.availabilityStatus || "Unknown"}
                      </span>
                      <div className="text-xs text-gray-500">{p.isFurnished ? "Furnished" : "Unfurnished"}</div>
                    </div>
                  </td>
                  <td className="py-5 px-6 relative" onClick={(e) => e.stopPropagation()}>
  <div className="relative">
    <button
      onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
      className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-sm"
    >
      ⋮ More
    </button>

    {/* Dropdown Menu */}
    {openMenu === p.id && (
      <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <button
          onClick={() =>
            (window.location.href =
              `/property-manager/view-own-property/${p.id}/units?type=${p.type}`)
          }
          className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50"
        >
          View Units
        </button>

        <button
          onClick={() =>
            (window.location.href =
              `/property-manager/view-own-property/${p.id}/manage_units_and_leases`)
          }
          className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50"
        >
          Manage Units & Leases
        </button>

         <button
            onClick={() => { setSelectedProperty(p); setEditModalOpen(true); setOpenMenu(null); }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50"
                          >
            Update Property
            </button>
             <button
              onClick={() => { setSelectedProperty(p); setDeleteModalOpen(true); setOpenMenu(null); }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600"
                          >
                            Delete Property
               </button>
      </div>
    )}
  </div>
</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
 function refreshProperties() {
    if (!user?.organizationUserId || !user?.organization?.id) return;
    setLoading(true);
    getProperties(user.organizationUserId, user.organization.id)
      .then(setProperties)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }
}

// Modal helper
const Modal = ({ children, close }: { children: React.ReactNode; close: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-3xl p-6 relative">
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 text-lg hover:text-gray-700"
      >
        ✕
      </button>
      {children}
    </div>
  </div>
);

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-500">Loading properties...</p>
    </div>
  </div>
);

const Error = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center text-red-500">{message}</div>
  </div>
);

const Empty = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">No properties found.</p>
      <p className="text-gray-400 text-sm mt-2">Start by adding your first property.</p>
    </div>
  </div>
);

