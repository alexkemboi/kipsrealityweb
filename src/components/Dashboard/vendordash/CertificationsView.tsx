import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { theme } from "../../ui/theme";
import { dashboardData } from "../../../app/data/vendorDashMockData";

export default function CertificationsView() {
  const { profile } = dashboardData;
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>Certifications & Documents</h1>
        <p className="text-gray-600">Your professional credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profile.certifications.map((cert) => (
          <Card key={cert.id} className="p-6 hover:shadow-xl transition-all border-t-4" style={{ borderTopColor: theme.secondary }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: theme.primary }}>{cert.name}</h3>
            <img src={cert.documentUrl} alt={cert.name} className="w-full h-48 object-cover rounded-lg mb-4 border-2" style={{ borderColor: theme.tertiary }} />
            <Button className="w-full" style={{ backgroundColor: theme.primary }}>
              View Document
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}