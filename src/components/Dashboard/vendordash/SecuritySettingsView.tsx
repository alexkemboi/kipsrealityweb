import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { theme } from "../../ui/theme";
import { dashboardData } from "../../../app/data/vendorDashMockData";

export default function SecuritySettingsView() {
  const { profile } = dashboardData;
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>Security Settings</h1>
        <p className="text-gray-600">Manage your account security</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6 border-l-4" style={{ borderLeftColor: theme.primary }}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1" style={{ color: theme.primary }}>Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <Badge 
              className="px-4 py-2 text-sm font-semibold"
              style={{ 
                backgroundColor: profile.securitySettings.twoFactorAuth ? '#dcfce7' : '#fee2e2',
                color: profile.securitySettings.twoFactorAuth ? '#16a34a' : '#dc2626'
              }}
            >
              {profile.securitySettings.twoFactorAuth ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </Card>

        <Card className="p-6 border-l-4" style={{ borderLeftColor: theme.secondary }}>
          <h3 className="font-bold text-lg mb-2" style={{ color: theme.primary }}>Password Management</h3>
          <p className="text-sm text-gray-600 mb-4">
            Last changed: <span className="font-medium">{profile.securitySettings.passwordLastChanged}</span>
          </p>
          <Button variant="outline" style={{ borderColor: theme.primary, color: theme.primary }}>
            Change Password
          </Button>
        </Card>

        <Card className="p-6 border-l-4" style={{ borderLeftColor: theme.tertiary }}>
          <h3 className="font-bold text-lg mb-2" style={{ color: theme.primary }}>Login History</h3>
          <p className="text-sm text-gray-600 mb-4">Review recent activity on your account</p>
          <Button variant="outline" style={{ borderColor: theme.primary, color: theme.primary }}>
            View Activity Log
          </Button>
        </Card>
      </div>
    </div>
  );
}