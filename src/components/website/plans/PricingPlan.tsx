// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Check } from "lucide-react";

// interface Feature { id: number; title: string; description: string; }
// interface Plan { id: number; name: string; badge?: string; monthlyPrice: number; yearlyPrice: number; description?: string; features: Feature[]; }

// export const PricingPlans = () => {
//   const [plans, setPlans] = useState<Plan[]>([]);
//   const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");

//   useEffect(() => {
//     const fetchPlans = async () => {
//       const res = await fetch("/api/plan");
//       const data = await res.json();
//       setPlans(data);
//     };
//     fetchPlans();
//   }, []);

//   const currentPrice = (plan: Plan) =>
//     billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

//   return (
//     <section className="relative px-6 pb-20 -mt-20 bg-white">
//       <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-3">
//         {plans.map((plan) => (
//           <Card
//             key={plan.id}
//             className={`relative bg-white border ${
//               plan.badge === "Most Popular"
//                 ? "border-blue-600 shadow-xl"
//                 : "border-slate-200 hover:border-slate-300"
//             }`}
//           >
//             {plan.badge && (
//               <div className="absolute -top-4 left-1/2 -translate-x-1/2">
//                 <Badge className="bg-blue-600 text-white px-4 py-2 font-semibold">
//                   {plan.badge}
//                 </Badge>
//               </div>
//             )}

//             <CardHeader className="pb-6 pt-12 text-center">
//               <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
//               <div className="mt-4">
//                 <div className="flex justify-center items-baseline gap-1 mb-2">
//                   <span className="text-4xl font-bold">${currentPrice(plan)}</span>
//                   <span className="text-xl text-slate-500">/month</span>
//                 </div>
//                 <CardDescription className="text-slate-600 mt-2">
//                   {plan.description}
//                 </CardDescription>
//               </div>
//             </CardHeader>

//             <CardContent className="pb-8">
//               <Button className="w-full text-lg py-3 font-semibold bg-blue-600 text-white">
//                 Start Free Trial
//               </Button>

//               <div className="mt-8 space-y-4">
//                 <p className="font-semibold text-lg border-b pb-2">
//                   What's included:
//                 </p>
//                 {plan.features.map((feature) => (
//                   <div key={feature.id} className="flex items-start gap-3">
//                     <div className="h-5 w-5 flex items-center justify-center rounded-full bg-green-500 mt-1">
//                       <Check className="h-3 w-3 text-white" />
//                     </div>
//                     <span className="text-slate-700 text-sm">{feature.title}</span>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </section>
//   );
// };
