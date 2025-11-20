// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// export async function PATCH(req: { json: () => PromiseLike<{ status: any; amount: any; }> | { status: any; amount: any; }; }, { params }: any) {
//   const id = params.id;
//   const { status, amount } = await req.json();

//   if (!id || !status || amount === undefined) {
//     return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//   }

//   try {
//     const updated = await prisma.maintenanceRequest.update({
//       where: { id },
//       data: {
//         status,
//         amount,
//       },
//     });
//     return NextResponse.json(updated);
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
