import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { theme } from "../../ui/theme";
import { dashboardData } from "../../../app/data/vendorDashMockData";

interface InvoicesViewProps {
  filter: string;
}

export default function InvoicesView({ filter }: InvoicesViewProps) {
  const filteredInvoices = filter === "ALL"
    ? dashboardData.invoices
    : dashboardData.invoices.filter(inv => inv.status === filter);

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>Invoices & Payments</h1>
        <p className="text-gray-600">Track and manage your financial records</p>
      </div>

      <Card className="p-8 mb-6 border-l-4" style={{ backgroundColor: theme.accent, borderLeftColor: theme.primary }}>
        <p className="text-sm font-medium text-gray-600 mb-1">Total Amount ({filter})</p>
        <p className="text-5xl font-bold" style={{ color: theme.primary }}>${totalAmount}</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="p-6 hover:shadow-xl transition-all border-t-4" style={{ borderTopColor: theme.secondary }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold" style={{ color: theme.primary }}>Invoice #{invoice.id}</h3>
                <p className="text-gray-600 mt-1">{invoice.property}</p>
              </div>
              <Badge 
                className="px-3 py-1 text-xs font-semibold"
                style={{ 
                  backgroundColor: invoice.status === 'Paid' ? '#dcfce7' : '#fef3c7',
                  color: invoice.status === 'Paid' ? '#16a34a' : '#d97706'
                }}
              >
                {invoice.status}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-3xl font-bold" style={{ color: theme.primary }}>${invoice.amount}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={14} />
              <span>{invoice.date}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}