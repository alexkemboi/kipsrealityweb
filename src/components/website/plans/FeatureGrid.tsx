// "use client";

// import { useEffect, useState } from "react";

// interface Feature { id: number; title: string; description: string; }

// export const FeatureGrid = () => {
//   const [features, setFeatures] = useState<Feature[]>([]);

//   useEffect(() => {
//     const fetchFeatures = async () => {
//       const res = await fetch("/api/feature?limit=6");
//       const data = await res.json();
//       setFeatures(data);
//     };
//     fetchFeatures();
//   }, []);

//   return (
//     <section className="bg-[#0b1f3a] px-6 py-20 text-white">
//       <div className="mx-auto max-w-6xl text-center mb-16">
//         <h2 className="text-3xl lg:text-5xl font-bold mb-4">Powerful Features</h2>
//         <p className="text-lg lg:text-2xl text-gray-300 max-w-4xl mx-auto">
//           Enhance your workflow with these incredible features included in RentFlow360.
//         </p>
//       </div>

//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {features.map((feature) => (
//           <div
//             key={feature.id}
//             className="bg-[#15386a] border border-white/10 rounded-2xl p-8 shadow-2xl text-center hover:border-blue-400 transition-all duration-500"
//           >
//             <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
//             <p className="text-gray-300">{feature.description}</p>
//             <div className="mt-4 h-0.5 w-12 bg-blue-300 mx-auto"></div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };
