import ServiceCrudWrapper from "@/components/Dashboard/SystemadminDash/service-crud/ServiceCrudWrapper";

export const dynamic = "force-dynamic";

export default function ServicePage() {
  return (
    <main className="p-6">
      <ServiceCrudWrapper />
    </main>
  );
}
