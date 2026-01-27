"use client";

import { JSX, useState } from "react";
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus } from "lucide-react";
import { NavbarItem } from "@prisma/client";

interface NavbarItemListProps {
  items: any[];
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  onAddSubmenu: (parentId: number) => void;
}

export default function NavbarItemList({ 
  items, 
  onEdit, 
  onDelete,
  onAddSubmenu 
}: NavbarItemListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const flattenItems = (itemsList: NavbarItem[]): NavbarItem[] => {
    const flattened: NavbarItem[] = [];
    itemsList.forEach(item => {
      const { children, ...itemWithoutChildren } = item as any;
      flattened.push(itemWithoutChildren);
      if (children && children.length > 0) {
        flattened.push(...flattenItems(children));
      }
    });
    return flattened;
  };

  const flatItems = flattenItems(items);

  // Organize items into parent-child structure
  const topLevelItems = flatItems.filter(item => !item.parentId);
  const childrenMap = flatItems.reduce((acc, item) => {
    if (item.parentId) {
      if (!acc[item.parentId]) acc[item.parentId] = [];
      acc[item.parentId].push(item);
    }
    return acc;
  }, {} as Record<number, NavbarItem[]>);

  const renderItemRow = (item: any, isChild: boolean = false): JSX.Element => {
    const hasChildren = childrenMap[item.id]?.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id}>
    
        <div className="hidden md:grid md:grid-cols-[40px_50px_200px_250px_80px_80px_100px_150px] gap-2 items-center p-3 hover:bg-[#15386a]/60 border-b border-[#30D5C8]/20 transition-colors">
    
          <div>
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(item.id)}
                className="p-1 hover:bg-[#30D5C8]/20 rounded transition"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[#30D5C8]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#30D5C8]" />
                )}
              </button>
            ) : null}
          </div>

          <div className="text-center">{item.id}</div>
          
          <div className={`${isChild ? 'pl-6 text-gray-300' : 'font-semibold'} truncate`}>
            {isChild && "↳ "}
            {item.name}
          </div>
          
          <div className="text-sm break-all text-gray-300">{item.href}</div>
          <div className="text-center">{item.order}</div>
          <div className="text-center">{item.isVisible ? "✅" : "❌"}</div>
          <div className="text-center">{item.isAvailable ? "✅" : "❌"}</div>
          
          <div className="flex gap-2 justify-center">
            {!isChild && (
              <button
                onClick={() => onAddSubmenu(item.id)}
                className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-500 transition"
                title="Add Submenu"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 bg-[#30D5C8] text-[#0b1f3a] rounded-md hover:bg-[#25b9ad] transition"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (hasChildren) {
                  if (confirm(`Delete "${item.name}" and all its submenus?`)) {
                    onDelete(item.id);
                  }
                } else {
                  onDelete(item.id);
                }
              }}
              className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Card */}
        <div className="md:hidden p-4 bg-[#0b1f3a] text-white rounded-lg shadow border border-[#30D5C8]/30 mb-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="p-1 hover:bg-[#30D5C8]/20 rounded transition"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#30D5C8]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#30D5C8]" />
                  )}
                </button>
              )}
              <h3 className={`${isChild ? 'text-gray-300' : 'font-semibold text-[#30D5C8]'}`}>
                {isChild && "↳ "}
                {item.name}
              </h3>
            </div>
            
            <div className="flex gap-2">
              {!isChild && (
                <button
                  onClick={() => onAddSubmenu(item.id)}
                  className="p-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-500"
                  title="Add Submenu"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 bg-[#30D5C8] text-[#0b1f3a] rounded text-sm hover:bg-[#25b9ad]"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-200 space-y-1">
            <p><span className="font-medium text-[#30D5C8]">ID:</span> {item.id}</p>
            <p><span className="font-medium text-[#30D5C8]">Href:</span> {item.href}</p>
            <p><span className="font-medium text-[#30D5C8]">Order:</span> {item.order}</p>
            <p><span className="font-medium text-[#30D5C8]">Visible:</span> {item.isVisible ? "✅" : "❌"}</p>
            <p><span className="font-medium text-[#30D5C8]">Available:</span> {item.isAvailable ? "✅" : "❌"}</p>
          </div>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="bg-[#15386a]/30">
            {childrenMap[item.id].map((child: any) => renderItemRow(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-6">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-[#30D5C8]/30 shadow-sm bg-[#0b1f3a] text-white">
        {/* Table Header */}
        <div className="grid grid-cols-[40px_50px_200px_250px_80px_80px_100px_150px] gap-2 items-center p-3 bg-[#15386a] text-[#30D5C8] uppercase text-sm font-semibold border-b border-[#30D5C8]/30">
          <div></div>
          <div className="text-center">ID</div>
          <div>Name</div>
          <div>Href</div>
          <div className="text-center">Order</div>
          <div className="text-center">Visible</div>
          <div className="text-center">Available</div>
          <div className="text-center">Actions</div>
        </div>

        {/* Table Body */}
        <div>
          {topLevelItems.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No navbar items yet. Add your first item above!
            </div>
          ) : (
            topLevelItems.map(item => renderItemRow(item))
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {topLevelItems.length === 0 ? (
          <div className="p-8 text-center text-gray-400 bg-[#0b1f3a] rounded-lg border border-[#30D5C8]/30">
            No navbar items yet. Add your first item above!
          </div>
        ) : (
          topLevelItems.map(item => renderItemRow(item))
        )}
      </div>
    </div>
  );
}