"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Home, ClipboardList, FileText, BarChart2, Bell, User, ChevronDown, DollarSign } from "lucide-react";

const theme = {
  primary: "#016B61",
  accent: "#E5E9C5",
  secondary: "#9ECFD4"
};

const dashboardData = {
  notifications: [1, 2, 3] 
};

interface SidebarProps {
  selected: string;
  onSelect: (item: string) => void;
}

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

interface SubMenuItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

const MenuItem = ({ icon: Icon, label, onClick, isActive }: MenuItemProps) => (
  <Button
    variant="ghost"
    className={`w-full justify-start gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-200 ${
      isActive 
        ? 'bg-[#016B61] text-white hover:bg-[#015550] hover:text-white shadow-md' 
        : 'hover:bg-[#E5E9C5] hover:shadow-sm'
    }`}
    style={{ color: isActive ? 'white' : theme.primary }}
    onClick={onClick}
  >
    <Icon size={20} strokeWidth={2} />
    <span className="font-medium">{label}</span>
  </Button>
);

const SubMenuItem = ({ icon: Icon, label, onClick, isActive }: SubMenuItemProps) => (
  <Button
    variant="ghost"
    size="sm"
    className={`w-full justify-start gap-2.5 pl-4 py-2.5 mb-1 rounded-lg transition-all duration-200 ${
      isActive 
        ? 'bg-[#9ECFD4] text-[#016B61] shadow-sm' 
        : 'hover:bg-[#E5E9C5]/50'
    }`}
    style={{ color: isActive ? theme.primary : '#6b7280' }}
    onClick={onClick}
  >
    <Icon size={16} strokeWidth={2} />
    <span className="text-sm font-medium">{label}</span>
  </Button>
);

export default function Sidebar({ selected, onSelect }: SidebarProps) {
  const [openMenus, setOpenMenus] = useState({ workOrders: true, invoices: false, profile: false });

  const toggleMenu = (menu: keyof typeof openMenus) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isActive = (item: string) => selected === item;

  return (
    <div className="w-72 h-screen bg-gradient-to-b from-gray-50 to-white shadow-2xl overflow-y-auto border-r border-gray-200">
      <div className="p-6 border-b-2 border-[#016B61]/10" style={{ background: 'linear-gradient(135deg, #E5E9C5 0%, #9ECFD4 100%)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
            <Home size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: theme.primary }}>Vendor Portal</h2>
            <p className="text-xs text-gray-600">Property Management</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-1">
        {/* Dashboard Overview */}
        <div className="mb-6">
          <MenuItem 
            icon={Home} 
            label="Dashboard Overview" 
            onClick={() => onSelect("Dashboard Overview")}
            isActive={isActive("Dashboard Overview")}
          />
          <div className="ml-2 mt-2 space-y-1 pl-3 border-l-2 border-gray-200">
            {["Active Work Orders", "Pending Approvals", "Completed Jobs"].map(item => (
              <SubMenuItem
                key={item}
                icon={ClipboardList}
                label={item}
                onClick={() => onSelect(item)}
                isActive={isActive(item)}
              />
            ))}
          </div>
        </div>

        {/* Work Orders */}
        <Collapsible open={openMenus.workOrders} className="mb-4">
          <CollapsibleTrigger
            onClick={() => toggleMenu("workOrders")}
            className="w-full text-left flex items-center justify-between gap-2 px-4 py-3 hover:bg-[#E5E9C5] rounded-xl transition-all duration-200"
            style={{ color: theme.primary }}
          >
            <div className="flex items-center gap-3">
              <ClipboardList size={20} strokeWidth={2} />
              <span className="font-medium">Work Orders</span>
            </div>
            <ChevronDown size={18} strokeWidth={2} className={`transition-transform duration-200 ${openMenus.workOrders ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-2 mt-2 space-y-1 pl-3 border-l-2 border-gray-200">
            {["Assigned Requests", "Update Progress", "Submit Reports / Photos", "Status Tracking", "Maintenance History", "View Past Work"].map(item => (
              <SubMenuItem
                key={item}
                icon={FileText}
                label={item}
                onClick={() => onSelect(item)}
                isActive={isActive(item)}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Invoices */}
        <Collapsible open={openMenus.invoices} className="mb-4">
          <CollapsibleTrigger
            onClick={() => toggleMenu("invoices")}
            className="w-full text-left flex items-center justify-between gap-2 px-4 py-3 hover:bg-[#E5E9C5] rounded-xl transition-all duration-200"
            style={{ color: theme.primary }}
          >
            <div className="flex items-center gap-3">
              <DollarSign size={20} strokeWidth={2} />
              <span className="font-medium">Invoices & Payments</span>
            </div>
            <ChevronDown size={18} strokeWidth={2} className={`transition-transform duration-200 ${openMenus.invoices ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-2 mt-2 space-y-1 pl-3 border-l-2 border-gray-200">
            {["Generate Invoice", "Payment History", "Payment Updates"].map(item => (
              <SubMenuItem
                key={item}
                icon={FileText}
                label={item}
                onClick={() => onSelect(item)}
                isActive={isActive(item)}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Analytics */}
        <MenuItem 
          icon={BarChart2} 
          label="Analytics by Property" 
          onClick={() => onSelect("Analytics by Property")}
          isActive={isActive("Analytics by Property")}
        />

        {/* Notifications */}
        <div className="relative mb-4">
          <MenuItem 
            icon={Bell} 
            label="Notifications" 
            onClick={() => onSelect("Notifications")}
            isActive={isActive("Notifications")}
          />
          {dashboardData.notifications.length > 0 && (
            <Badge 
              className="absolute top-2.5 right-4 px-2 py-0.5 text-xs font-bold animate-pulse"
              style={{ backgroundColor: '#ef4444', color: 'white' }}
            >
              {dashboardData.notifications.length}
            </Badge>
          )}
        </div>

        {/* Profile */}
        <Collapsible open={openMenus.profile} className="mt-6 pt-4 border-t-2 border-gray-200">
          <CollapsibleTrigger
            onClick={() => toggleMenu("profile")}
            className="w-full text-left flex items-center justify-between gap-2 px-4 py-3 hover:bg-[#E5E9C5] rounded-xl transition-all duration-200"
            style={{ color: theme.primary }}
          >
            <div className="flex items-center gap-3">
              <User size={20} strokeWidth={2} />
              <span className="font-medium">Profile & Settings</span>
            </div>
            <ChevronDown size={18} strokeWidth={2} className={`transition-transform duration-200 ${openMenus.profile ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-2 mt-2 space-y-1 pl-3 border-l-2 border-gray-200">
            {["Business Info", "Certifications & Documents", "Security Settings"].map(item => (
              <SubMenuItem
                key={item}
                icon={User}
                label={item}
                onClick={() => onSelect(item)}
                isActive={isActive(item)}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}