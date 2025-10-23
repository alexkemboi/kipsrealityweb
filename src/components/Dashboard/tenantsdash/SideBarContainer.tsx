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
  Users,
  Wrench,
  Calculator,
  Zap,
  Settings,
  Menu as MenuIcon,
  X,
} from "lucide-react";

const SideBarComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  const sidebarItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      text: "Overview",
      link: "/tenants",
      subItems: [
        { text: "Rent Status", link: "/tenants/rent-status" },
        { text: "Lease Summary", link: "/tenants/lease-summary" },
        { text: "Maintenance Updates", link: "/tenants/maintenance-updates" },
      ],
    },
    {
      icon: <Users className="w-5 h-5" />,
      text: "My Lease",
      link: "/tenants/my-lease",
      subItems: [
        { text: "View Lease Details", link: "/tenants/lease-details" },
        { text: "Renew / Terminate Request", link: "/tenants/renew-terminate" },
        { text: "Insurance Upload", link: "/tenants/insurance-upload" },
      ],
    },
    {
      icon: <Calculator className="w-5 h-5" />,
      text: "Payments",
      link: "/tenants/payments",
      subItems: [
        { text: "Pay Rent (Stripe / Zelle / ACH)", link: "/tenants/pay-rent" },
        { text: "Payment History", link: "/tenants/payment-history" },
        { text: "Upcoming Invoices", link: "/tenants/upcoming-invoices" },
      ],
    },
    {
      icon: <Wrench className="w-5 h-5" />,
      text: "Maintenance",
      link: "/tenants/maintenance",
      subItems: [
        { text: "Submit Request", link: "/tenants/submit-request" },
        { text: "Track Progress", link: "/tenants/track-progress" },
        { text: "View Past Requests", link: "/tenants/past-requests" },
      ],
    },
    {
      icon: <Zap className="w-5 h-5" />,
      text: "Utilities",
      link: "/tenants/utilities",
      subItems: [
        { text: "Usage Summary", link: "/tenants/usage-summary" },
        { text: "Shared Utility Bills", link: "/tenants/shared-bills" },
        { text: "Payment Breakdown", link: "/tenants/payment-breakdown" },
      ],
    },
    {
      icon: <Users className="w-5 h-5" />,
      text: "Insurance",
      link: "/tenants/insurance",
      subItems: [
        { text: "Purchase / Upload Policy", link: "/tenants/insurance-purchase" },
        { text: "Renewal Reminders", link: "/tenants/insurance-renewal" },
        { text: "Claim Assistance", link: "/tenants/insurance-claims" },
      ],
    },
    {
      icon: <Zap className="w-5 h-5" />,
      text: "Notifications",
      link: "/tenants/notifications",
      subItems: [
        { text: "Rent Reminders", link: "/tenants/rent-reminders" },
        { text: "Maintenance Updates", link: "/tenants/maintenance-notifications" },
        { text: "Lease Alerts", link: "/tenants/lease-alerts" },
      ],
    },
    {
      icon: <Settings className="w-5 h-5" />,
      text: "Profile & Security",
      link: "/tenants/profile",
      subItems: [
        { text: "Update Info", link: "/tenants/update-info" },
        { text: "MFA / Password Change", link: "/tenants/security" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
      >
        {isOpen ? <X size={20} /> : <MenuIcon size={20} />}
      </button>

      {/* Sidebar Container */}
      <div
        className={`fixed lg:sticky top-0 h-screen pt-10 transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 bg-gradient-to-b from-blue-100 to-blue-300 text-blue-900 shadow-lg`}
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
          <div className="h-full overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent bg-[#0f172a]">
            <Menu
              menuItemStyles={{
                button: ({ active }) => ({
                  backgroundColor: active
                    ? "rgba(59, 130, 246, 0.2)"
                    : "transparent",
                  color: active ? "#1E3A8A" : "#1E40AF",
                  padding: "0.625rem 1.25rem",
                  margin: "0.125rem 0.5rem",
                  borderRadius: "0.375rem",
                  fontWeight: "500",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.3)",
                    color: "#1E3A8A",
                  },
                }),
                subMenuContent: {
                  backgroundColor: "transparent",
                  padding: "0.25rem 0",
                },
                icon: {
                  minWidth: "32px",
                },
              }}
            >
              {sidebarItems.map((item, index) =>
                item.subItems ? (
                  <SubMenu key={index} icon={item.icon} label={item.text}>
                    {item.subItems.map((subItem, subIndex) => (
                      <MenuItem key={subIndex} href={subItem.link}>
                        <span className="pl-2 text-xs text-blue-800 hover:text-blue-950 transition-colors">
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
      </div>
    </>
  );
};

export default SideBarComponent;
