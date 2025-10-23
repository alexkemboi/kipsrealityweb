import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { theme } from "../../ui/theme";
import MetricCard from "./metricCard";
import { Metric } from "./type";
import { dashboardData } from "../../../app/data/vendorDashMockData";

interface DashboardOverviewProps {
  metrics?: Metric[]; 
}

export default function DashboardOverview({ metrics }: DashboardOverviewProps) {
 
  const displayMetrics = metrics || dashboardData.metrics;

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: theme.primary }}
        >
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {displayMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="p-6 border-t-4"
          style={{ borderTopColor: theme.primary }}
        >
          <h3
            className="text-xl font-semibold mb-4"
            style={{ color: theme.primary }}
          >
            Recent Work Orders
          </h3>
          <div className="space-y-3">
            {dashboardData.workOrders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-lg transition-all hover:scale-[1.02]"
                style={{ backgroundColor: theme.accent }}
              >
                <div className="flex-1">
                  <p
                    className="font-semibold"
                    style={{ color: theme.primary }}
                  >
                    {order.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {order.property}
                  </p>
                </div>
                <Badge
                  className="px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor:
                      order.status === "COMPLETED"
                        ? "#dcfce7"
                        : order.status === "IN_PROGRESS"
                        ? theme.tertiary
                        : "#fef3c7",
                    color:
                      order.status === "COMPLETED"
                        ? "#16a34a"
                        : order.status === "IN_PROGRESS"
                        ? theme.primary
                        : "#d97706",
                  }}
                >
                  {order.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card
          className="p-6 border-t-4"
          style={{ borderTopColor: theme.secondary }}
        >
          <h3
            className="text-xl font-semibold mb-4"
            style={{ color: theme.primary }}
          >
            Recent Notifications
          </h3>
          <div className="space-y-3">
            {dashboardData.notifications.slice(0, 4).map((notif) => (
              <div
                key={notif.id}
                className="p-4 rounded-lg transition-all hover:scale-[1.02]"
                style={{ backgroundColor: theme.accent }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: theme.tertiary }}
                  >
                    <Bell size={16} style={{ color: theme.primary }} />
                  </div>
                  <div className="flex-1">
                    <p
                      className="font-semibold text-sm"
                      style={{ color: theme.primary }}
                    >
                      {notif.type}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{notif.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
