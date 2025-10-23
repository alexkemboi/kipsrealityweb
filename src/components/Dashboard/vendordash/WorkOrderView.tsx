import { theme } from "../../ui/theme";
import { dashboardData } from "../../../app/data/vendorDashMockData";
import WorkOrderCard from "./WorkOrderCard";

interface WorkOrdersViewProps {
  filter: "ALL" | "IN_PROGRESS" | "PENDING" | "COMPLETED";
  title: string;
}

export default function WorkOrdersView({ filter, title }: WorkOrdersViewProps) {
  const filteredOrders =
    filter === "ALL"
      ? dashboardData.workOrders
      : dashboardData.workOrders.filter(
          (order) => order.status === filter
        );

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: theme.primary }}
        >
          {title}
        </h1>
        <p className="text-gray-600">
          Showing {filteredOrders.length} work orders
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.map((order) => (
          <WorkOrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
