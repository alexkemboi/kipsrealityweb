"use client";
import React, { useState } from "react";
import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
  sidebarClasses,
} from "react-pro-sidebar";
import {
  LayoutDashboard,
  Building2,
  Users,
  Wrench,
  Calculator,
  Zap,
  BarChart3,
  Settings,
  Menu as MenuIcon,
  X,
} from "lucide-react";

const SideBarComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  const sidebarItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      text: "Dashboard Overview",
      link: "/dashboard",
      subItems: [
        { text: "Active Leases", link: "/dashboard/active-leases" },
        { text: "Maintenance Summary", link: "/dashboard/maintenance" },
        { text: "Rent Collection Overview", link: "/dashboard/rent-collection" },
      ],
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      text: "Properties & Units",
      link: "/properties",
      subItems: [
        { text: "Register New Property", link: "/properties/register" },
        { text: "Manage Units & Leases", link: "/properties/manage" },
        { text: "Vacancy Tracker", link: "/properties/vacancy" },
      ],
    },
    {
      icon: <Users className="w-5 h-5" />,
      text: "Tenant Management",
      link: "/tenants",
      subItems: [
        { text: "Applications & Screening", link: "/tenants/applications" },
        { text: "Move-ins / Move-outs", link: "/tenants/moves" },
        { text: "Communication Center", link: "/tenants/communication" },
      ],
    },
    {
      icon: <Wrench className="w-5 h-5" />,
      text: "Maintenance & Vendors",
      link: "/maintenance",
      subItems: [
        { text: "New Requests", link: "/maintenance/requests" },
        { text: "Assign Vendors", link: "/maintenance/vendors" },
        { text: "Maintenance Analytics", link: "/maintenance/analytics" },
      ],
    },
    {
      icon: <Calculator className="w-5 h-5" />,
      text: "Accounting",
      link: "/accounting",
      subItems: [
        { text: "Rent Invoicing", link: "/accounting/invoicing" },
        { text: "Late Fee Automation", link: "/accounting/late-fees" },
        { text: "Reconciliation", link: "/accounting/reconciliation" },
      ],
    },
    {
      icon: <Zap className="w-5 h-5" />,
      text: "Utilities",
      link: "/utilities",
      subItems: [
        { text: "Track Usage", link: "/utilities/track" },
        { text: "Allocate Bills", link: "/utilities/allocate" },
        { text: "Utility Reports", link: "/utilities/reports" },
      ],
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      text: "Analytics & Reports",
      link: "/analytics",
      subItems: [
        { text: "Revenue Insights", link: "/analytics/revenue" },
        { text: "Tenant Satisfaction", link: "/analytics/satisfaction" },
        { text: "Predictive Occupancy", link: "/analytics/occupancy" },
      ],
    },
    {
      icon: <Settings className="w-5 h-5" />,
      text: "System Settings",
      link: "/settings",
      subItems: [
        { text: "Integrations", link: "/settings/integrations" },
        { text: "Notifications", link: "/settings/notifications" },
        { text: "Role Management", link: "/settings/roles" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
      >
        {isOpen ? <X size={20} /> : <MenuIcon size={20} />}
      </button>

      {/* Sidebar Container */}
      <div
        className={`fixed lg:sticky top-0 h-screen pt-10 transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 bg-[#E3F2FD] text-gray-800 shadow-lg`}
        style={{ width: "260px" }}
      >
        <Sidebar
          width="100%"
          rootStyles={{
            [`.${sidebarClasses.container}`]: {
              backgroundColor: "transparent",
              height: "100vh",
            },
          }}
        >
          <div className="h-full overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
            <Menu
              menuItemStyles={{
                button: ({ active }) => ({
                  backgroundColor: active ? "#BBDEFB" : "transparent",
                  color: active ? "#0D47A1" : "#1E3A8A",
                  padding: "0.625rem 1.25rem",
                  margin: "0.125rem 0.5rem",
                  borderRadius: "0.375rem",
                  fontWeight: "500",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#BBDEFB",
                    color: "#0D47A1",
                  },
                }),
                subMenuContent: {
                  backgroundColor: "transparent",
                  padding: "0.25rem 0",
                },
                icon: {
                  minWidth: "32px",
                  color: "#1565C0",
                },
              }}
            >
              {sidebarItems.map((item, index) =>
                item.subItems ? (
                  <SubMenu key={index} icon={item.icon} label={item.text}>
                    {item.subItems.map((subItem, subIndex) => (
                      <MenuItem key={subIndex} href={subItem.link}>
                        <span className="pl-2 text-sm text-blue-700 hover:text-blue-900 transition-colors">
                          {subItem.text}
                        </span>
                      </MenuItem>
                    ))}
                  </SubMenu>
                ) : (
                  <MenuItem key={index} icon={item.icon} href={item.link}>
                    {item.text}
                  </MenuItem>
                )
              )}
            </Menu>
          </div>
        </Sidebar>

        {/* Custom Scrollbar */}
        <style jsx global>{`
          .scrollbar-thin::-webkit-scrollbar {
            width: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: rgba(33, 150, 243, 0.3);
            border-radius: 10px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: rgba(30, 136, 229, 0.6);
          }
        `}</style>
      </div>
    </>
  );
};

export default SideBarComponent;
