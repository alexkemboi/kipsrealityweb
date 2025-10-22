"use client";
import * as React from "react";
import { useRouter } from 'next/navigation';
import { HelpCircle, Phone, FileText, Lock, Menu, User, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import profilepivc from "../../../../public/favicon/favicon.ico";
import insure from "../../../../public/favicon/favicon.ico";

export default function Navbar() {
	const router = useRouter();
	const [menuOpen, setMenuOpen] = React.useState(false);
	const menuRef = React.useRef<HTMLDivElement>(null);

	const handleLogout = async () => {
		setMenuOpen(false);
		router.push('/login');
	};

	// Close menu when clicking outside
	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setMenuOpen(false);
			}
		};

		if (menuOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [menuOpen]);

	const navItems = [
		{ title: "Help", icon: <HelpCircle className="w-5 h-5" />, action: () => { } },
		{ title: "Contact", icon: <Phone className="w-5 h-5" />, action: () => { } },
		{ title: "About", icon: <FileText className="w-5 h-5" />, action: () => { } },
		{ title: "Security", icon: <Lock className="w-5 h-5" />, action: () => { } },
	];

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a] backdrop-blur-lg border-b border-[#0f172a]">
			<div className="mx-auto px-6 h-16">
				<div className="flex items-center justify-between h-full">
					{/* Logo Section */}
					<div className="flex items-center gap-3">
						<Image
							width={32}
							height={32}
							src={insure}
							alt="Logo"
							className="rounded-lg"
						/>
						<h1 className="hidden md:block text-white text-xl font-semibold tracking-tight">
							RentFlow360
						</h1>
					</div>

					{/* Right Section */}
					<div className="flex items-center gap-2">
						{/* Navigation Icons - Hidden on mobile */}
						<div className="hidden lg:flex items-center gap-1">
							{navItems.map((item, index) => (
								<button
									key={index}
									onClick={item.action}
									className="group relative px-3 py-2 text-neutral-400 hover:text-white transition-colors duration-200"
									title={item.title}
								>
									{item.icon}
									<span className="absolute bottom-0 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
										{item.title}
									</span>
								</button>
							))}
						</div>

						{/* Divider */}
						<div className="hidden lg:block w-px h-6 bg-neutral-700 mx-2" />

						{/* Profile Menu */}
						<div className="relative" ref={menuRef}>
							<button
								onClick={() => setMenuOpen(!menuOpen)}
								className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors duration-200"
							>
								<Image
									width={32}
									height={32}
									src={profilepivc}
									alt="Profile"
									className="rounded-full"
								/>
								<span className="hidden md:block text-white text-sm font-medium">Account</span>
							</button>

							{/* Dropdown Menu */}
							{menuOpen && (
								<div className="absolute right-0 mt-2 w-56 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 overflow-hidden">
									<div className="py-1">
										<button
											onClick={() => {
												setMenuOpen(false);
												router.push('/profile');
											}}
											className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
										>
											<User className="w-4 h-4" />
											<span>Profile</span>
										</button>
										<button
											onClick={() => {
												setMenuOpen(false);
												router.push('/settings');
											}}
											className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
										>
											<Settings className="w-4 h-4" />
											<span>Settings</span>
										</button>
										<div className="my-1 h-px bg-neutral-700" />
										<button
											onClick={handleLogout}
											className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-neutral-700 hover:text-red-300 transition-colors"
										>
											<LogOut className="w-4 h-4" />
											<span>Log out</span>
										</button>
									</div>
								</div>
							)}
						</div>

						{/* Mobile Menu Button */}
						<button className="lg:hidden p-2 text-neutral-400 hover:text-white transition-colors">
							<Menu className="w-6 h-6" />
						</button>
					</div>
				</div>
			</div>
		</nav>
	);
}