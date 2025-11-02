"use client";

import { useEffect, useState } from "react";
import NavbarItemList from "./NavbarItemList";
import NavbarItemForm from "./NavbarItemForm";
import { toast } from "sonner";
import { Menu, Plus, RefreshCw, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

export default function NavbarManagerPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/navbar-items?includeAll=true");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching navbar items:", error);
      toast.error("Failed to load navbar items");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
    toast.success("List refreshed!");
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async (item: any) => {
    try {
      if (item.id) {
        const response = await fetch(`/api/navbar-items/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        if (!response.ok) throw new Error("Failed to update item");
      } else {
        const response = await fetch("/api/navbar-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        if (!response.ok) throw new Error("Failed to create item");
      }
      
      await fetchItems();
      setSelectedItem(null);
    } catch (error) {
      console.error("Error saving item:", error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    const itemToDelete = items.find(item => item.id === id);
    const hasChildren = items.some(item => item.parentId === id);

    if (hasChildren) {
      const confirmDelete = confirm(
        `"${itemToDelete?.name}" has submenu items. Deleting it will also delete all its submenus. Continue?`
      );
      if (!confirmDelete) return;
    }

    try {
      const response = await fetch(`/api/navbar-items/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete item");

      toast.success("Item deleted successfully");
      await fetchItems();
      
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleAddSubmenu = (parentId: number) => {
    const parentItem = items.find(item => item.id === parentId);
    
    setSelectedItem({
      id: undefined,
      name: "",
      href: "",
      order: 0,
      isVisible: true,
      isAvailable: true,
      parentId: parentId,
    });

    toast.info(`Adding submenu to "${parentItem?.name}"`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setTimeout(() => {
      setSelectedItem({
        id: undefined,
        name: "",
        href: "",
        order: 0,
        isVisible: true,
        isAvailable: true,
        parentId: null,
      });
    }, 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate statistics
  const stats = {
    total: items.length,
    topLevel: items.filter(i => !i.parentId).length,
    submenus: items.filter(i => i.parentId).length,
    visible: items.filter(i => i.isVisible).length,
    hidden: items.filter(i => !i.isVisible).length,
    available: items.filter(i => i.isAvailable).length,
    unavailable: items.filter(i => !i.isAvailable).length,
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0b1f3a] to-[#0a1628]">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#30D5C8]/20 border-t-[#30D5C8] mx-auto"></div>
            <Menu className="w-8 h-8 text-[#30D5C8] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white mt-6 text-lg font-medium">Loading navbar items...</p>
          <p className="text-gray-400 mt-2 text-sm">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0b1f3a] to-[#0a1628] text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#30D5C8]/10 to-transparent rounded-2xl blur-xl"></div>
          <div className="relative bg-[#0b1f3a]/80 backdrop-blur-sm rounded-2xl p-8 border border-[#30D5C8]/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#30D5C8]/10 rounded-xl">
                  <Menu className="w-8 h-8 text-[#30D5C8]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Navbar Management
                  </h1>
                  <p className="text-gray-400">
                    Create and organize your navigation menu
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-[#15386a] hover:bg-[#1a4575] text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-[#30D5C8]/20"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#30D5C8] to-[#25b9ad] hover:from-[#25b9ad] hover:to-[#1fa89c] text-[#0b1f3a] rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-[#30D5C8]/20 hover:shadow-xl hover:shadow-[#30D5C8]/30 hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Add New Item
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="bg-[#15386a]/50 backdrop-blur-sm rounded-lg p-4 border border-[#30D5C8]/10 hover:border-[#30D5C8]/30 transition-all">
                <div className="text-2xl font-bold text-[#30D5C8] mb-1">{stats.total}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Total Items</div>
              </div>
              
              <div className="bg-[#15386a]/50 backdrop-blur-sm rounded-lg p-4 border border-[#30D5C8]/10 hover:border-[#30D5C8]/30 transition-all">
                <div className="text-2xl font-bold text-blue-400 mb-1">{stats.topLevel}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Top Level</div>
              </div>
              
              <div className="bg-[#15386a]/50 backdrop-blur-sm rounded-lg p-4 border border-[#30D5C8]/10 hover:border-[#30D5C8]/30 transition-all">
                <div className="text-2xl font-bold text-purple-400 mb-1">{stats.submenus}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Submenus</div>
              </div>
              
              <div className="bg-[#15386a]/50 backdrop-blur-sm rounded-lg p-4 border border-[#30D5C8]/10 hover:border-[#30D5C8]/30 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-green-400" />
                  <div className="text-2xl font-bold text-green-400">{stats.visible}</div>
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Visible</div>
              </div>
              
              <div className="bg-[#15386a]/50 backdrop-blur-sm rounded-lg p-4 border border-[#30D5C8]/10 hover:border-[#30D5C8]/30 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <EyeOff className="w-4 h-4 text-orange-400" />
                  <div className="text-2xl font-bold text-orange-400">{stats.hidden}</div>
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Hidden</div>
              </div>
              
              <div className="bg-[#15386a]/50 backdrop-blur-sm rounded-lg p-4 border border-[#30D5C8]/10 hover:border-[#30D5C8]/30 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <div className="text-2xl font-bold text-green-400">{stats.available}</div>
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Available</div>
              </div>
              
              <div className="bg-[#15386a]/50 backdrop-blur-sm rounded-lg p-4 border border-[#30D5C8]/10 hover:border-[#30D5C8]/30 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <div className="text-2xl font-bold text-red-400">{stats.unavailable}</div>
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Unavailable</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        {selectedItem && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-[#0b1f3a]/80 backdrop-blur-sm rounded-2xl p-1 border border-[#30D5C8]/20 shadow-xl">
              <div className="bg-gradient-to-r from-[#30D5C8]/10 to-transparent rounded-t-xl p-4 border-b border-[#30D5C8]/20">
                <h2 className="text-lg font-semibold text-[#30D5C8] flex items-center gap-2">
                  {selectedItem.id ? "✏️ Edit Item" : "✨ Create New Item"}
                </h2>
              </div>
              <div className="p-6">
                <NavbarItemForm
                  selectedItem={selectedItem}
                  onSave={handleSave}
                  onCancel={() => setSelectedItem(null)}
                  allItems={items}
                />
              </div>
            </div>
          </div>
        )}

        {/* List Section */}
        <div className="bg-[#0b1f3a]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#30D5C8]/20 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#30D5C8]/20">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">
                Navigation Items
              </h2>
              <p className="text-sm text-gray-400">
                Manage your navbar structure • Click <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500/20 text-green-400 rounded text-xs mx-1">+</span> to add submenus
              </p>
            </div>
          </div>
          
          <NavbarItemList
            items={items}
            onEdit={setSelectedItem}
            onDelete={handleDelete}
            onAddSubmenu={handleAddSubmenu}
          />
        </div>
      </div>
    </div>
  );
}