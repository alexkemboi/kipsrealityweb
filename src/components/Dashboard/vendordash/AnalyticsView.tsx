import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { theme } from "../../ui/theme";
import { dashboardData } from "../../../app/data/vendorDashMockData";

export default function AnalyticsView() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>Analytics</h1>
        <p className="text-gray-600">Performance insights and trends</p>
      </div>
      
      <Card className="p-6 mb-6 border-t-4" style={{ borderTopColor: theme.primary }}>
        <h3 className="text-xl font-semibold mb-6" style={{ color: theme.primary }}>Monthly Completion Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={dashboardData.analytics.monthlyCompletion}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.tertiary} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="completed" stroke={theme.primary} strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 border-t-4" style={{ borderTopColor: theme.secondary }}>
        <h3 className="text-xl font-semibold mb-6" style={{ color: theme.primary }}>SLA Compliance by Property</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dashboardData.analytics.slaCompliance}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.tertiary} />
            <XAxis dataKey="property" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sla" fill={theme.secondary} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}