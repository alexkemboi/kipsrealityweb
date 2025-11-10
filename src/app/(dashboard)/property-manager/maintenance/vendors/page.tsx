// import { prisma } from "@/lib/db";
// import VendorsClient from "@/components/Dashboard/maintenance/VendorsClient";

// export default async function VendorsPage() {
//   let vendors: any[] = [];
//   try {
//     vendors = await (prisma as any).vendor.findMany({
//       orderBy: { createdAt: "desc" },
//       include: {
//         user: {
//           select: {
//             firstName: true,
//             lastName: true,
//             email: true,
//             phone: true
//           }
//         }
//       }
//     });
//   } catch (err) {
//     console.warn("Vendor table not available yet:", err);
//   }

//   return <VendorsClient initialVendors={vendors} />;
// }