import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { theme } from "../../ui/theme";
import { dashboardData } from "../../../app/data/vendorDashMockData";

export default function BusinessInfoView() {
  const { profile } = dashboardData;
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>Business Information</h1>
        <p className="text-gray-600">Manage your company profile</p>
      </div>

      <Card className="p-8 border-t-4" style={{ borderTopColor: theme.primary }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg" style={{ backgroundColor: theme.accent }}>
            <p className="text-sm font-medium mb-1" style={{ color: theme.secondary }}>Company Name</p>
            <p className="text-xl font-bold" style={{ color: theme.primary }}>{profile.name}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: theme.accent }}>
            <p className="text-sm font-medium mb-1" style={{ color: theme.secondary }}>Contact Person</p>
            <p className="text-xl font-bold" style={{ color: theme.primary }}>{profile.contactPerson}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: theme.accent }}>
            <p className="text-sm font-medium mb-1" style={{ color: theme.secondary }}>Email</p>
            <p className="text-xl font-bold" style={{ color: theme.primary }}>{profile.email}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: theme.accent }}>
            <p className="text-sm font-medium mb-1" style={{ color: theme.secondary }}>Phone</p>
            <p className="text-xl font-bold" style={{ color: theme.primary }}>{profile.phone}</p>
          </div>
          <div className="p-4 rounded-lg md:col-span-2" style={{ backgroundColor: theme.accent }}>
            <p className="text-sm font-medium mb-1" style={{ color: theme.secondary }}>Address</p>
            <p className="text-xl font-bold" style={{ color: theme.primary }}>{profile.address}</p>
          </div>
        </div>
        <Button className="mt-6 px-6" style={{ backgroundColor: theme.primary }}>
          Edit Information
        </Button>
      </Card>
    </div>
  );
}