'use client'

import { motion } from 'framer-motion'
import { RouteGroup } from './RouteGroup'
import { systemRoutes, routeConfig } from './SidebarLinks'
import { LogOut } from 'lucide-react'

interface DashboardSidebarLinksProps {
  user: { id: string, firstName: string, role: string, email: string }
  open?: boolean
  isCollapsed?: boolean
  darkMode?: boolean
}

export function DashboardSidebarLinks({ user, open = true, isCollapsed = false, darkMode = true }: DashboardSidebarLinksProps) {
  const userRoutes = routeConfig[user.role as keyof typeof routeConfig]

  const handleLogout = async () => {
    // TODO: Handle Logout 
  }

  return (
    <motion.div className="flex flex-1 flex-col justify-between overflow-hidden" layout>
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
        {userRoutes.main && <RouteGroup routes={userRoutes.main} open={open} isCollapsed={isCollapsed} darkMode={darkMode} />}
        {Object.entries(userRoutes).map(([key, routes]: any) => key !== 'main' && routes && (
          <RouteGroup
            key={key}
            routes={routes}
            open={open}
            categoryLabel={key.charAt(0).toUpperCase() + key.slice(1)}
            isCollapsed={isCollapsed}
            darkMode={darkMode}
          />
        ))}
      </div>

      <div className="border-t pt-4 transition-colors duration-300">
        <RouteGroup routes={systemRoutes} open={open} isCollapsed={isCollapsed} darkMode={darkMode} />
        <div className="px-2 pb-2">
          <motion.button
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-xl p-3 w-full text-neutral-700 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            {open && <span className="text-sm font-medium whitespace-nowrap">Logout</span>}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { cn } from "@/lib/utils";
// import * as Icons from "lucide-react";
// import { Skeleton } from "@/components/ui/skeleton";

// interface SidebarItem {
//   id: number;
//   label: string;
//   path: string;
//   role: string;
//   icon?: string;
//   section?: string;
//   order?: number;
//   badge?: string;
//   description?: string;
//   isActive: boolean;
//   isExternal: boolean;
//   target?: string;
//   feature?: {
//     id: number;
//     title: string;
//     isActive: boolean;
//   };
//   plans?: {
//     id: number;
//     name: string;
//   }[];
// }

// interface DashboardSidebarLinksProps {
//   user: {
//     id: string;
//     role: string;
//     planIds?: number[]; // User's subscription plan IDs
//   };
//   open: boolean;
//   isCollapsed: boolean;
// }

// export function DashboardSidebarLinks({
//   user,
//   open,
//   isCollapsed,
// }: DashboardSidebarLinksProps) {
//   const pathname = usePathname();
//   const [menuItems, setMenuItems] = useState<SidebarItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetchMenuItems();
//   }, [user.role, user.id]);

//   const fetchMenuItems = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       // Build query params based on user
//       const params = new URLSearchParams({
//         role: user.role,
//       });

//       // Add plan IDs if available
//       if (user.planIds && user.planIds.length > 0) {
//         params.append("planIds", user.planIds.join(","));
//       }

//       const response = await fetch(`/api/sidebarItem?${params.toString()}`);

//       if (!response.ok) {
//         throw new Error("Failed to fetch menu items");
//       }

//       const data = await response.json();
//       setMenuItems(data);
//     } catch (err) {
//       console.error("Error fetching menu items:", err);
//       setError("Failed to load menu");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get icon component from lucide-react
//   const getIcon = (iconName?: string) => {
//     if (!iconName) return null;
    
//     // @ts-ignore - Dynamic icon lookup
//     const IconComponent = Icons[iconName];
    
//     if (!IconComponent) {
//       console.warn(`Icon "${iconName}" not found in lucide-react`);
//       return null;
//     }
    
//     return <IconComponent className="w-5 h-5" />;
//   };

//   // Group items by section
//   const groupedItems = menuItems.reduce((acc, item) => {
//     const section = item.section || "Main";
//     if (!acc[section]) {
//       acc[section] = [];
//     }
//     acc[section].push(item);
//     return acc;
//   }, {} as Record<string, SidebarItem[]>);

//   // Loading skeleton
//   if (loading) {
//     return (
//       <div className="p-3 space-y-2">
//         {[1, 2, 3, 4, 5].map((i) => (
//           <Skeleton
//             key={i}
//             className={cn(
//               "h-10 bg-neutral-800",
//               !open && "w-12 mx-auto"
//             )}
//           />
//         ))}
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="p-4">
//         <div className="text-red-400 text-sm text-center">
//           {error}
//           <button
//             onClick={fetchMenuItems}
//             className="block mt-2 text-blue-400 hover:text-blue-300 underline mx-auto"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Empty state
//   if (menuItems.length === 0) {
//     return (
//       <div className="p-4">
//         <p className="text-neutral-500 text-sm text-center">
//           No menu items available
//         </p>
//       </div>
//     );
//   }

//   return (
//     <nav className="p-3 space-y-6">
//       {Object.entries(groupedItems).map(([section, items]) => (
//         <div key={section}>
//           {/* Section Header */}
//           {open && (
//             <div className="px-3 mb-2">
//               <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
//                 {section}
//               </h3>
//             </div>
//           )}

//           {/* Section Items */}
//           <div className="space-y-1">
//             {items.map((item) => {
//               const isActive = pathname === item.path;
//               const LinkComponent = item.isExternal ? "a" : Link;
//               const linkProps = item.isExternal
//                 ? { href: item.path, target: item.target || "_blank", rel: "noopener noreferrer" }
//                 : { href: item.path };

//               return (
//                 <LinkComponent
//                   key={item.id}
//                   {...linkProps}
//                   className={cn(
//                     "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
//                     isActive
//                       ? "bg-blue-600 text-white"
//                       : "text-neutral-400 hover:bg-neutral-800 hover:text-white",
//                     !open && "justify-center"
//                   )}
//                   title={!open ? item.label : undefined}
//                 >
//                   {/* Icon */}
//                   <div className={cn(
//                     "flex-shrink-0",
//                     isActive ? "text-white" : "text-neutral-400 group-hover:text-white"
//                   )}>
//                     {getIcon(item.icon)}
//                   </div>

//                   {/* Label and Badge */}
//                   {open && (
//                     <div className="flex-1 flex items-center justify-between min-w-0">
//                       <span className="text-sm font-medium truncate">
//                         {item.label}
//                       </span>
                      
//                       {item.badge && (
//                         <span className={cn(
//                           "ml-2 px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0",
//                           isActive
//                             ? "bg-white/20 text-white"
//                             : "bg-blue-600 text-white"
//                         )}>
//                           {item.badge}
//                         </span>
//                       )}
//                     </div>
//                   )}

//                   {/* Tooltip for collapsed state */}
//                   {!open && (
//                     <div className="absolute left-full ml-2 px-3 py-2 bg-neutral-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg border border-neutral-700">
//                       {item.label}
//                       {item.badge && (
//                         <span className="ml-2 px-2 py-0.5 text-xs bg-blue-600 rounded-full">
//                           {item.badge}
//                         </span>
//                       )}
//                     </div>
//                   )}
//                 </LinkComponent>
//               );
//             })}
//           </div>
//         </div>
//       ))}
//     </nav>
//   );
// }
