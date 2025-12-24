import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface NavbarItem {
  id: number;
  name: string;
  href: string;
  order: number;
  isVisible: boolean;
  isAvailable: boolean;
  parentId?: number | null;
  children?: NavbarItem[];
}

const NavbarAdminPanel = () => {
  const [items, setItems] = useState<NavbarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NavbarItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    href: '',
    order: 0,
    isVisible: true,
    isAvailable: true,
    parentId: null as number | null,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/navbar-items');
      const data = await response.json();
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingItem 
        ? `/api/navbar-items/${editingItem.id}`
        : '/api/navbar-items';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save item');
      }

      await fetchItems();
      resetForm();
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };

  const handleEdit = (item: NavbarItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      href: item.href,
      order: item.order,
      isVisible: item.isVisible,
      isAvailable: item.isAvailable,
      parentId: item.parentId || null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/navbar-items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      await fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      href: '',
      order: 0,
      isVisible: true,
      isAvailable: true,
      parentId: null,
    });
    setEditingItem(null);
  };

  const handleAddSubmenu = (parentId: number) => {
    setFormData({
      name: '',
      href: '',
      order: 0,
      isVisible: true,
      isAvailable: true,
      parentId: parentId,
    });
    setShowModal(true);
  };

  // Get top-level items
  const topLevelItems = items.filter(item => !item.parentId);

  // Organize children
  const getChildren = (parentId: number) => {
    return items.filter(item => item.parentId === parentId);
  };

  const renderItem = (item: NavbarItem, level = 0) => {
    const children = getChildren(item.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id}>
        <div
          className="flex items-center gap-3 p-3 border-b hover:bg-gray-50"
          style={{ paddingLeft: `${level * 2 + 0.75}rem` }}
        >
          {/* Expand/Collapse */}
          <button
            onClick={() => toggleExpand(item.id)}
            className="w-6 h-6 flex items-center justify-center"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          {/* Drag Handle */}
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />

          {/* Item Info */}
          <div className="flex-1 grid grid-cols-4 gap-4 items-center">
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-gray-600">{item.href}</div>
            <div className="text-sm text-gray-600">Order: {item.order}</div>
            <div className="flex items-center gap-2">
              {item.isVisible ? (
                <Eye className="w-4 h-4 text-green-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-xs">
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!item.parentId && (
              <button
                onClick={() => handleAddSubmenu(item.id)}
                className="p-2 text-green-500 hover:bg-green-50 rounded"
                title="Add Submenu"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleEdit(item)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Navbar Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-lg border">
        {topLevelItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No items yet. Click "Add Item" to create one.
          </div>
        ) : (
          topLevelItems.map(item => renderItem(item))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Link (href)</label>
                <input
                  type="text"
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Parent Item</label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentId: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">None (Top-level)</option>
                  {topLevelItems
                    .filter(item => item.id !== editingItem?.id)
                    .map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: Number(e.target.value) })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) =>
                      setFormData({ ...formData, isVisible: e.target.checked })
                    }
                  />
                  <span className="text-sm">Visible</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) =>
                      setFormData({ ...formData, isAvailable: e.target.checked })
                    }
                  />
                  <span className="text-sm">Available</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 border py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarAdminPanel;