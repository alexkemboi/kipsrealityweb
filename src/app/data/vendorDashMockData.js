import { ClipboardList, Clock, CheckCircle2, Activity, TrendingUp } from "lucide-react";

export const dashboardData = {
  metrics: [
    { id: 1, title: "Active Work Orders", value: 12, icon: ClipboardList, trend: "+2 from last week" },
    { id: 2, title: "Pending Approvals", value: 7, icon: Clock, trend: "3 urgent" },
    { id: 3, title: "Completed Jobs", value: 34, icon: CheckCircle2, trend: "+8 this month" },
    { id: 4, title: "Average Completion", value: "2.8 days", icon: Activity, trend: "0.3 days faster" },
    { id: 5, title: "SLA Compliance", value: "93%", icon: TrendingUp, trend: "+2% improvement" },
  ],
  workOrders: [
    { id: 1, title: "Fix leaking faucet", property: "Green Villa", status: "IN_PROGRESS", priority: "High", assignedDate: "2025-10-20", dueDate: "2025-10-23", tenant: "John Doe", description: "Kitchen faucet leaking.", beforePhoto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp9N6fX3f1mUpOBOQK_yuDSGfvNe8zUxvsEA&s", afterPhoto: null },
    { id: 2, title: "Replace broken window", property: "Sunset Apartments", status: "PENDING", priority: "Medium", assignedDate: "2025-10-21", dueDate: "2025-10-24", tenant: "Mary Smith", description: "Living room window shattered.", beforePhoto: "https://www.plan-itwindows.com/wp-content/uploads/2023/10/Broken-Window-scaled-1.jpeg", afterPhoto: null },
    { id: 3, title: "Aircon servicing", property: "Ocean View Condos", status: "COMPLETED", priority: "Low", assignedDate: "2025-10-18", dueDate: "2025-10-20", tenant: "Alex Johnson", description: "Routine maintenance of AC units.", beforePhoto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7cAacq7dA6ZavubGYOzPq_BJFk8zvxPmAIA&s", afterPhoto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUy3NtO_NR6ewvAZN6u3y8p4Ks1l6ZBrDIbDwt4M4hp74z8MoWH0ZQNO2ge6W7qiVmbV8&usqp=CAU" },
    { id: 4, title: "Repair garage door", property: "Sunrise Apartments", status: "IN_PROGRESS", priority: "High", assignedDate: "2025-10-19", dueDate: "2025-10-22", tenant: "Lily Adams", description: "Garage door motor malfunction.", beforePhoto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6TV3HlR2BJErYrVQsIvU1bfYN48WvtyKkKQ&s", afterPhoto: null },
    { id: 5, title: "Fix bathroom tiles", property: "Maple Residency", status: "PENDING", priority: "Medium", assignedDate: "2025-10-20", dueDate: "2025-10-25", tenant: "David Kim", description: "Tiles cracked and water seepage.", beforePhoto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXnZC9tODaDLwt2OT-oXHFx88j4FsbTtMueQ&s", afterPhoto: null },
    { id: 6, title: "Replace kitchen sink", property: "Oakwood Apartments", status: "COMPLETED", priority: "Low", assignedDate: "2025-10-15", dueDate: "2025-10-17", tenant: "Sarah Lee", description: "Sink rusted and leaking.", beforePhoto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgVQ7BCQ_l5HxGFJSwf4pubTgDeWXFwxok1g&s", afterPhoto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQI3-3tYCwFc_pb-_US0SQQhUHYk_liTE6PKg&s" },
  ],
  invoices: [
    { id: 1, property: "Green Villa", amount: 150, status: "Paid", date: "2025-10-21" },
    { id: 2, property: "Sunset Apartments", amount: 200, status: "Pending", date: "2025-10-22" },
    { id: 3, property: "Ocean View Condos", amount: 300, status: "Paid", date: "2025-10-20" },
    { id: 4, property: "Sunrise Apartments", amount: 180, status: "Pending", date: "2025-10-23" },
    { id: 5, property: "Maple Residency", amount: 250, status: "Paid", date: "2025-10-19" },
    { id: 6, property: "Oakwood Apartments", amount: 220, status: "Pending", date: "2025-10-21" },
  ],
  analytics: {
    monthlyCompletion: [
      { month: "Jan", completed: 12 },
      { month: "Feb", completed: 15 },
      { month: "Mar", completed: 20 },
      { month: "Apr", completed: 18 },
      { month: "May", completed: 22 },
      { month: "Jun", completed: 17 },
      { month: "Jul", completed: 25 },
      { month: "Aug", completed: 30 },
    ],
    slaCompliance: [
      { property: "Green Villa", sla: 92 },
      { property: "Sunset Apartments", sla: 95 },
      { property: "Ocean View Condos", sla: 98 },
      { property: "Sunrise Apartments", sla: 90 },
      { property: "Maple Residency", sla: 93 },
      { property: "Oakwood Apartments", sla: 96 },
    ],
  },
  notifications: [
    { id: 1, type: "New Assignment", message: "New maintenance ticket assigned: Fix leaking faucet", date: "2025-10-21" },
    { id: 2, type: "Urgent", message: "Urgent request: Replace broken window", date: "2025-10-21" },
    { id: 3, type: "Payment Update", message: "Invoice #2 payment pending", date: "2025-10-22" },
    { id: 4, type: "New Assignment", message: "New ticket: Repair garage door", date: "2025-10-22" },
    { id: 5, type: "Completed", message: "Maintenance ticket completed: Aircon servicing", date: "2025-10-20" },
  ],
  profile: {
    name: "Vendor Company Ltd",
    contactPerson: "Michael Carter",
    email: "michael@vendorco.com",
    phone: "+254712345678",
    address: "123 Business St, Nairobi, Kenya",
    certifications: [
      { id: 1, name: "Electrical Safety", documentUrl: "https://via.placeholder.com/150" },
      { id: 2, name: "Plumbing License", documentUrl: "https://via.placeholder.com/150" },
      { id: 3, name: "HVAC Certification", documentUrl: "https://via.placeholder.com/150" },
    ],
    securitySettings: {
      twoFactorAuth: true,
      passwordLastChanged: "2025-09-15",
    },
  },
};