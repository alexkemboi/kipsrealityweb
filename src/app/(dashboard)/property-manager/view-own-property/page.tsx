"use client";

import { useEffect, useState, useRef } from "react";
import { getProperties, deleteProperty } from "@/lib/property-manager";
import { Building2, Home, MapPin, Bed, Bath, User, Building, MoreVertical, Eye, FileText, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PropertyForm from '@/components/website/PropertyManager/RegisterPropertyForm';
import EditPropertyForm from '@/components/website/PropertyManager/UpdatePropertyForm';

export default function PropertyManagerPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

  const { user } = useAuth();
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenu) {
        const dropdownElement = dropdownRefs.current[openMenu];
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setOpenMenu(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  useEffect(() => {
    const fetchProperties = async () => {
      console.log('=== Fetch Properties useEffect ===');
      console.log('User object:', user);
      console.log('organizationUserId:', user?.organizationUserId);
      console.log('organizationId:', user?.organization?.id);

      if (!user?.organizationUserId || !user?.organization?.id) {
        console.error('Missing user data:', {
          hasUser: !!user,
          hasOrgUserId: !!user?.organizationUserId,
          hasOrgId: !!user?.organization?.id
        });
        setError("Please log in to view properties");
        setLoading(false);
        return;
      }

      try {
        console.log('Calling getProperties...');
        const data = await getProperties(
          user.organizationUserId,
          user.organization.id
        );
        console.log('Properties received:', data);
        setProperties(data);
        setError(null);
      } catch (err) {
        console.error('Error in fetchProperties:', err);
        setError(err instanceof Error ? err.message : "Failed to fetch properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  const refreshProperties = async () => {
    if (!user?.organizationUserId || !user?.organization?.id) {
      console.error('Cannot refresh - missing user data');
      return;
    }
    
    setLoading(true);
    try {
      const data = await getProperties(user.organizationUserId, user.organization.id);
      setProperties(data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing properties:', err);
      setError(err instanceof Error ? err.message : "Failed to refresh properties");
    } finally {
      setLoading(false);
    }
  };

  // Add Property Modal
  const AddPropertyModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-3xl p-6 relative">
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-4 right-4 text-gray-500 text-lg hover:text-gray-700 transition-colors"
        >
          ✕
        </button>
        <PropertyForm onSuccess={() => {
          setIsModalOpen(false);
          refreshProperties();
        }} />
      </div>
    </div>
  );

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
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
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
            {properties.length === 0 
              ? "No properties yet. Add your first property to get started."
              : `Managing ${properties.length} ${properties.length === 1 ? "property" : "properties"}`
            }
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          Add Property
        </button>
      </div>

      {/* Add Property Modal */}
      {isModalOpen && <AddPropertyModal />}

      {/* Edit Property Modal */}
      {editModalOpen && selectedProperty && (
        <Modal close={() => setEditModalOpen(false)}>
          <h2 className="text-xl font-semibold mb-4">Update Property</h2>
          <EditPropertyForm
            initialData={selectedProperty}
            onSuccess={() => { 
              setEditModalOpen(false); 
              refreshProperties(); 
            }}
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
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
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
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Content Section */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Properties Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You haven't added any properties yet. Start by adding your first property to manage units, leases, and tenants.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 font-medium mx-auto"
          >
            <PlusIcon className="w-5 h-5" />
            Add Your First Property
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-screen">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Property</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Location</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Details</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Manager</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {properties.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        {p.type?.toLowerCase() === "apartment" ? (
                          <Building2 className="text-blue-600 w-6 h-6" />
                        ) : (
                          <Home className="text-navy-700 w-6 h-6" />
                        )}
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                            {p.type}
                          </h2>
                          {p.type?.toLowerCase() === "apartment" && p.details?.buildingName && (
                            <p className="text-sm text-blue-600 font-medium mt-1">
                              {p.details.buildingName}
                            </p>
                          )}
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
                            p.availabilityStatus === "available" ? "bg-navy-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {p.availabilityStatus || "Unknown"}
                        </span>
                        <div className="text-xs text-gray-500">{p.isFurnished ? "Furnished" : "Unfurnished"}</div>
                      </div>
                    </td>
                    <td className="py-5 px-6 relative" onClick={(e) => e.stopPropagation()}>
                      <div 
                        className="relative"
                        ref={(el) => { dropdownRefs.current[p.id] = el; }}
                      >
                        <button
                          onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <MoreVertical className="w-4 h-4" />
                          <span>Actions</span>
                        </button>

                        {openMenu === p.id && (
                          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                              <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                              <p className="text-xs text-gray-500 capitalize mt-1">{p.type} • {p.city}</p>
                            </div>
                            
                            <div className="py-2">
                              <button
                                onClick={() => {
                                  window.location.href = `/property-manager/view-own-property/${p.id}/units?type=${p.type}`;
                                  setOpenMenu(null);
                                }}
                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                              >
                                <Eye className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-600" />
                                <div className="text-left">
                                  <div className="font-medium">View Units</div>
                                  <div className="text-xs text-gray-500 group-hover:text-blue-600">Browse all property units</div>
                                </div>
                              </button>

                              <button
                                onClick={() => {
                                  window.location.href = `/property-manager/view-own-property/${p.id}/manage_units_and_leases`;
                                  setOpenMenu(null);
                                }}
                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                              >
                                <FileText className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-600" />
                                <div className="text-left">
                                  <div className="font-medium">Manage Units & Leases</div>
                                  <div className="text-xs text-gray-500 group-hover:text-blue-600">Leases and contracts</div>
                                </div>
                              </button>

                              <div className="border-t border-gray-100 my-1"></div>

                              <button
                                onClick={() => { 
                                  setSelectedProperty(p); 
                                  setEditModalOpen(true); 
                                  setOpenMenu(null); 
                                }}
                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-navy-50 hover:text-navy-900 transition-colors group"
                              >
                                <Edit className="w-4 h-4 mr-3 text-gray-400 group-hover:text-navy-700" />
                                <div className="text-left">
                                  <div className="font-medium">Update Property</div>
                                  <div className="text-xs text-gray-500 group-hover:text-navy-700">Edit property details</div>
                                </div>
                              </button>

                              <button
                                onClick={() => { 
                                  setSelectedProperty(p); 
                                  setDeleteModalOpen(true); 
                                  setOpenMenu(null); 
                                }}
                                className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors group"
                              >
                                <Trash2 className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-600" />
                                <div className="text-left">
                                  <div className="font-medium">Delete Property</div>
                                  <div className="text-xs text-red-500 group-hover:text-red-600">Remove permanently</div>
                                </div>
                              </button>
                            </div>
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
      )}
    </div>
  );
}

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const Modal = ({ children, close }: { children: React.ReactNode; close: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-3xl p-6 relative">
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 text-lg hover:text-gray-700 transition-colors"
      >
        ✕
      </button>
      {children}
    </div>
  </div>
);