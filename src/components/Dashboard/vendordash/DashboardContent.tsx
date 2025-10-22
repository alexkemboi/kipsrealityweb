import DashboardOverview from "./DashboardOverview";
import WorkOrdersView from "./WorkOrderView";
import InvoicesView from "./InvoiceView";
import AnalyticsView from "./AnalyticsView";
import NotificationsView from "./NotificationView";
import BusinessInfoView from "./BusinessInfoView";
import CertificationsView from "./CertificationsView";
import SecuritySettingsView from "./SecuritySettingsView";
import { dashboardData } from "../../../app/data/vendorDashMockData";

const vendorDashMockData = dashboardData;

interface DashboardContentProps {
  selected: string;
}

export default function DashboardContent({ selected }: DashboardContentProps) {
  const getContent = () => {
    switch (selected) {
      case "Dashboard Overview":
        return <DashboardOverview metrics={vendorDashMockData.metrics} />;

      case "Active Work Orders":
        return (
          <WorkOrdersView
            filter="IN_PROGRESS"
            title="Active Work Orders"
          />
        );

      case "Pending Approvals":
        return (
          <WorkOrdersView
            filter="PENDING"
            title="Pending Approvals"
          />
        );

      case "Completed Jobs":
        return (
          <WorkOrdersView
            filter="COMPLETED"
            title="Completed Jobs"
          />
        );

      case "Assigned Requests":
        return <WorkOrdersView filter="PENDING" title="Assigned Requests" />;
      
      case "Update Progress":
         return <WorkOrdersView filter="IN_PROGRESS" title="Update Progress" />;

      case "Submit Reports / Photos":
        return <WorkOrdersView filter="COMPLETED" title="Submit Reports / Photos" />;

      case "Status Tracking":
        return <WorkOrdersView filter="ALL" title="Status Tracking" />;

      case "Maintenance History":
        return <WorkOrdersView filter="COMPLETED" title="Maintenance History" />;
      
      case "View Past Work":
        return <WorkOrdersView filter="COMPLETED" title="All Work Orders" />;

      case "Generate Invoice":
      case "Payment History":
      case "Payment Updates":
        return <InvoicesView filter="ALL" />;

      case "Analytics by Property":
        return <AnalyticsView />;

      case "Notifications":
        return <NotificationsView />;

      case "Business Info":
        return <BusinessInfoView />;

      case "Certifications & Documents":
        return <CertificationsView />;

      case "Security Settings":
        return <SecuritySettingsView />;

      default:
        return <DashboardOverview metrics={vendorDashMockData.metrics} />;
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      
      <div className="w-full h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          
          <div className="animate-fadeIn">
            {getContent()}
          </div>
        </div>
      </div>

      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        /* Custom scrollbar for better UX */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}