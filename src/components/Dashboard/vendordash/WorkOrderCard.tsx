import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { theme } from "../../ui/theme";

interface WorkOrderCardProps {
  order: {
    id: number;
    title: string;
    property: string;
    status: string;
    priority: string;
    assignedDate: string;
    dueDate: string;
    tenant: string;
    description: string;
    beforePhoto: string;
    afterPhoto: string | null;
  };
}

export default function WorkOrderCard({ order }: WorkOrderCardProps) {
  const statusStyles = {
    COMPLETED: { bg: '#dcfce7', text: '#16a34a' },
    IN_PROGRESS: { bg: theme.tertiary, text: theme.primary },
    PENDING: { bg: '#fef3c7', text: '#d97706' }
  };

  const priorityStyles = {
    High: { bg: '#fee2e2', text: '#dc2626' },
    Medium: { bg: '#fef3c7', text: '#d97706' },
    Low: { bg: '#dcfce7', text: '#16a34a' }
  };

  return (
    <Card className="p-6 hover:shadow-xl transition-all border-t-4" style={{ borderTopColor: theme.secondary }}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1" style={{ color: theme.primary }}>{order.title}</h3>
          <p className="text-gray-600 text-sm flex items-center gap-2">
            <span className="font-medium">{order.property}</span>
            <ChevronRight size={14} />
            <span>{order.tenant}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Badge 
            className="px-3 py-1 text-xs font-semibold"
            style={{ 
              backgroundColor: priorityStyles[order.priority as keyof typeof priorityStyles].bg, 
              color: priorityStyles[order.priority as keyof typeof priorityStyles].text 
            }}
          >
            {order.priority}
          </Badge>
          <Badge 
            className="px-3 py-1 text-xs font-semibold"
            style={{ 
              backgroundColor: statusStyles[order.status as keyof typeof statusStyles].bg, 
              color: statusStyles[order.status as keyof typeof statusStyles].text 
            }}
          >
            {order.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4 text-sm leading-relaxed">{order.description}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} style={{ color: theme.secondary }} />
          <div>
            <p className="text-xs text-gray-500">Assigned</p>
            <p className="font-medium">{order.assignedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock size={16} style={{ color: theme.secondary }} />
          <div>
            <p className="text-xs text-gray-500">Due Date</p>
            <p className="font-medium">{order.dueDate}</p>
          </div>
        </div>
      </div>

      {order.beforePhoto && (
        <div className="flex gap-4 pt-4 border-t">
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: theme.primary }}>Before</p>
            <img src={order.beforePhoto} alt="Before" className="w-32 h-32 object-cover rounded-lg border-2" style={{ borderColor: theme.tertiary }} />
          </div>
          {order.afterPhoto && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: theme.primary }}>After</p>
              <img src={order.afterPhoto} alt="After" className="w-32 h-32 object-cover rounded-lg border-2" style={{ borderColor: theme.tertiary }} />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}