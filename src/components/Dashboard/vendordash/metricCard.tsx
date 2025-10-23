import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { theme } from "../../ui/theme";

interface MetricCardProps {
  metric: {
    id: number;
    title: string;
    value: number | string;
    icon: React.ElementType;
    trend: string;
  };
}

export default function MetricCard({ metric }: MetricCardProps) {
  const Icon = metric.icon;
  return (
    <Card className="p-6 hover:shadow-lg transition-all border-l-4 hover:scale-105" style={{ borderLeftColor: theme.primary }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
          <p className="text-3xl font-bold mb-2" style={{ color: theme.primary }}>{metric.value}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <TrendingUp size={12} style={{ color: theme.secondary }} />
            {metric.trend}
          </p>
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: theme.accent }}>
          <Icon style={{ color: theme.primary }} size={24} />
        </div>
      </div>
    </Card>
  );
}