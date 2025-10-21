import React from 'react';

const Footer: React.FC = () => {
	return (
		<footer className="relative w-full overflow-hidden">
			{/* Background Layers */}
			<div className="absolute inset-0 z-0">
				{/* Base Background */}
				<div className="absolute inset-0 bg-neutral-900/95" />

				{/* Gradient Overlays */}
				<div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-900/60" />
				<div className="absolute inset-0 bg-gradient-to-r from-neutral-900/40 via-transparent to-neutral-900/40" />

				{/* Grid Overlay */}
				<div className="absolute inset-0 opacity-[0.03]">
					<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
				</div>

				{/* Floating Orbs */}
				<div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl animate-float-slow" />
				<div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float-medium delay-2000" />
				<div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/8 rounded-full blur-3xl animate-float-slow delay-1000" />
			</div>

			{/* Footer Content */}
			<div className="relative z-20 container mx-auto py-6 text-center">
				<span className="text-white font-inter font-semibold text-sm sm:text-base">
					© 2025 Rentflow360. All Rights Reserved.
				</span>
			</div>
		</footer>

	);
};

export default Footer;
