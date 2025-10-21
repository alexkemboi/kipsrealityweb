"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import AddIcCallSharpIcon from "@mui/icons-material/AddIcCallSharp";
import LockOpenSharpIcon from "@mui/icons-material/LockOpenSharp";
import Tooltip from "@mui/material/Tooltip";
import FeedSharpIcon from "@mui/icons-material/FeedSharp";
import profilepivc from "../../../public/favicon/favicon-32x32.png";
import insure from "../../../public/image/free-insurance-1817174-1538042.png";
import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function Navbar() {
	const router = useRouter();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		// Your function logic
	};

	const handleLogout = async () => {
		setAnchorEl(null);
		router.push('/login');
		// setLoading(true)
	};

	const iconstyle = "black";
	return (
		<>
			<div className="fixed bottom-0 w-full z-50 bg-neutral-900/95">


				{/* AppBar Content */}
				<Box sx={{ flexGrow: 1 }} className="relative z-20">
					<AppBar className="flex justify-between h-16 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500">
						<Toolbar className="flex justify-between">
							{/* Left Side */}
							<div className="flex items-center gap-2">
								<Image
									width={30}
									height={20}
									src={insure}
									alt="Logo"
									className="rounded-lg"
								/>
								<h6 className="hidden md:block text-white text-2xl font-semibold">
									RentFlow360
								</h6>
							</div>

							{/* Right Side Icons */}
							<div className="flex items-center gap-3">
								{[
									{ title: "Help", icon: <HelpOutlineRoundedIcon /> },
									{ title: "Contact us", icon: <AddIcCallSharpIcon /> },
									{ title: "About", icon: <FeedSharpIcon /> },
									{ title: "Change password", icon: <LockOpenSharpIcon /> },
								].map((item, index) => (
									<Tooltip key={index} title={item.title} arrow>
										<IconButton
											size="large"
											color="inherit"
											className="bg-white/10 p-2 rounded-lg backdrop-blur-md hover:bg-white/20 transition-all duration-300"
										>
											{React.cloneElement(item.icon, { className: "text-white w-5 h-5" })}
										</IconButton>
									</Tooltip>
								))}

								<IconButton
									size="large"
									onClick={handleMenu}
									className="bg-white/10 p-1 rounded-lg backdrop-blur-md hover:bg-white/20 transition-all duration-300"
								>
									<Image
										width={30}
										height={20}
										src={profilepivc}
										alt="Profile"
										className="rounded-lg"
									/>
								</IconButton>

								<Menu
									id="menu-appbar"
									anchorEl={anchorEl}
									anchorOrigin={{ vertical: "top", horizontal: "right" }}
									keepMounted
									transformOrigin={{ vertical: "top", horizontal: "right" }}
									open={Boolean(anchorEl)}
									onClose={handleClose}
									className="bg-white/10 backdrop-blur-xl text-white"
								>
									<MenuItem onClick={handleClose} className="text-white bg-white/10">Profile</MenuItem>
									<MenuItem onClick={handleClose} className="text-white bg-white/10">My account</MenuItem>
									<MenuItem onClick={handleLogout} className="text-white bg-white/10">Log out</MenuItem>
								</Menu>
							</div>
						</Toolbar>
					</AppBar>
				</Box>
			</div>

		</>
	);
}
