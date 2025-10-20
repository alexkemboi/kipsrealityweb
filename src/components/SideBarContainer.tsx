"use client";
import React from "react";
import { Sidebar, Menu, MenuItem, sidebarClasses } from "react-pro-sidebar";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SettingsIcon from "@mui/icons-material/Settings";
import AddHomeIcon from "@mui/icons-material/AddHome";
import LockIcon from "@mui/icons-material/Lock";
import WalletIcon from "@mui/icons-material/Wallet";
import SmsIcon from "@mui/icons-material/Sms";
import HowToRegIcon from "@mui/icons-material/HowToReg";

const SideBarComponent = () => {
	const sidebarItems = [
		{
			label: "Property Management",
			items: [
				{ icon: <AddHomeIcon />, text: "Dashboard", link: "/dashboard" },
				{ icon: <WalletIcon />, text: "Properties", link: "/properties" },
				{ icon: <LockIcon />, text: "Add Property", link: "/property/add" },
				{ icon: <AssignmentTurnedInIcon />, text: "Tenants", link: "/tenants" },
				{ icon: <HowToRegIcon />, text: "Leases", link: "/leases" },
			],
		},
		{
			label: "Financial Management",
			items: [
				{ icon: <SettingsIcon />, text: "Payments", link: "/payments" },
				{ icon: <SmsIcon />, text: "Reports", link: "/reports" },
			],
		},
	];

	return (
		<div className="relative mt-20 w-56 h-[80vh] ">


			{/* Sidebar */}
			<Sidebar
				rootStyles={{
					[`.${sidebarClasses.container}`]: {
						backgroundColor: "transparent",
						height: "100%",
						borderRadius: "1rem",
						backdropFilter: "blur(20px)",
					},
				}}
			>
				<Menu>
					{sidebarItems.map((section, index) => (
						<div key={index} className="mb-4">
							<h4 className="text-white font-bold text-sm px-4 mb-2">
								{section.label}
							</h4>
							{section.items.map((item, itemIndex) => (
								<MenuItem
									key={itemIndex}
									href={item.link}
									className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-blue/10 transition-all duration-300 group"
								>
									<div className="text-white group-hover:text-blue-primary">
										{React.cloneElement(item.icon, { className: "w-5 h-5" })}
									</div>
									<span className="font-inter font-semibold">{item.text}</span>
								</MenuItem>
							))}
						</div>
					))}
				</Menu>
			</Sidebar>
		</div>
	);
};

export default SideBarComponent;
