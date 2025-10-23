import { Card } from "@/components/ui/card";
import { Bell, Calendar } from "lucide-react";
import { theme } from "../../ui/theme";
import { dashboardData } from "../../../app/data/vendorDashMockData";

export default function NotificationsView() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>Notifications</h1>
        <p className="text-gray-600">Stay updated with your latest alerts</p>
      </div>

      <div className="space-y-4">
        {dashboardData.notifications.map((notif) => (
          <Card key={notif.id} className="p-6 hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: theme.secondary }}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl" style={{ 
                backgroundColor: notif.type === 'Urgent' ? '#fee2e2' :
                                notif.type === 'New Assignment' ? theme.accent :
                                notif.type === 'Completed' ? '#dcfce7' : '#fef3c7'
              }}>
                <Bell size={20} style={{ 
                  color: notif.type === 'Urgent' ? '#dc2626' :
                        notif.type === 'New Assignment' ? theme.primary :
                        notif.type === 'Completed' ? '#16a34a' : '#d97706'
                }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1" style={{ color: theme.primary }}>{notif.type}</h3>
                <p className="text-gray-600 mb-2">{notif.message}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar size={12} />
                  {notif.date}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}