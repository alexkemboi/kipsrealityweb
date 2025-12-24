"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  Clock, 
  DollarSign, 
  FileText, 
  Home,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function LandlordDashboard() {
  const { user } = useAuth();

  // Mock data for demonstration
  const dashboardStats = {
    totalProperties: 8,
    occupiedUnits: 22,
    vacantUnits: 3,
    monthlyRevenue: 18600,
    pendingMaintenance: 5,
    overduePayments: 2,
    occupancyRate: 88,
    avgRent: 850
  };

  const properties = [
    {
      id: "1",
      name: "Sunset Apartments",
      address: "123 Sunset Blvd, Downtown",
      totalUnits: 12,
      occupiedUnits: 11,
      monthlyRevenue: 4400,
      status: "Excellent"
    },
    {
      id: "2",
      name: "Oak Ridge Complex",
      address: "456 Oak Street, Suburbs",
      totalUnits: 8,
      occupiedUnits: 7,
      monthlyRevenue: 2800,
      status: "Good"
    },
    {
      id: "3",
      name: "Maple Heights",
      address: "789 Maple Drive, City Center",
      totalUnits: 5,
      occupiedUnits: 4,
      monthlyRevenue: 2000,
      status: "Needs Attention"
    }
  ];

  const recentActivities = [
    {
      id: "1",
      type: "Payment Received",
      description: "Rent payment from Unit 3B - $850",
      property: "Sunset Apartments",
      time: "2 hours ago",
      amount: 850,
      status: "success"
    },
    {
      id: "2",
      type: "Maintenance Request",
      description: "Leaky faucet reported in Unit 2A",
      property: "Oak Ridge Complex",
      time: "4 hours ago",
      status: "warning"
    },
    {
      id: "3",
      type: "Lease Renewal",
      description: "Lease expiring in 30 days for Unit 1C",
      property: "Maple Heights",
      time: "1 day ago",
      status: "info"
    },
    {
      id: "4",
      type: "Late Payment",
      description: "Rent overdue for Unit 4B - Sunset Apartments",
      property: "Sunset Apartments",
      time: "2 days ago",
      amount: 850,
      status: "error"
    }
  ];

  const upcomingTasks = [
    {
      id: "1",
      task: "Property Inspection",
      property: "Oak Ridge Complex",
      dueDate: "2025-12-18",
      priority: "High"
    },
    {
      id: "2",
      task: "Lease Renewal Meeting",
      property: "Sunset Apartments",
      dueDate: "2025-12-20",
      priority: "Medium"
    },
    {
      id: "3",
      task: "Maintenance Review",
      property: "Maple Heights",
      dueDate: "2025-12-22",
      priority: "Low"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Landlord Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.firstName || user?.email}! Here's your property management overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.occupiedUnits}/{dashboardStats.occupiedUnits + dashboardStats.vacantUnits} units occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg rent: ${dashboardStats.avgRent}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.vacantUnits} vacant units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.pendingMaintenance + dashboardStats.overduePayments}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.pendingMaintenance} maintenance, {dashboardStats.overduePayments} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Properties Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Properties Overview</CardTitle>
          <CardDescription>
            Your property portfolio and current occupancy status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{property.name}</h4>
                    <Badge 
                      variant={
                        property.status === "Excellent" ? "default" : 
                        property.status === "Good" ? "secondary" : 
                        "destructive"
                      }
                    >
                      {property.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{property.address}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>{property.occupiedUnits}/{property.totalUnits} units occupied</span>
                    <span>${property.monthlyRevenue}/month</span>
                  </div>
                </div>
                <div className="text-right">
                  <Button size="sm" variant="outline">
                    Manage Property
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities and Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest events across your properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {activity.status === "warning" && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                    {activity.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                    {activity.status === "info" && <Clock className="h-5 w-5 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.type}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.property} • {activity.time}</p>
                    {activity.amount && (
                      <p className="text-sm font-medium text-green-600">+${activity.amount}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>
              Important tasks and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-xs text-gray-600">{task.property}</p>
                    <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                  </div>
                  <Badge 
                    variant={
                      task.priority === "High" ? "destructive" : 
                      task.priority === "Medium" ? "secondary" : 
                      "outline"
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Property</CardTitle>
            <CardDescription>
              Register a new property
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Add Property
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tenant Management</CardTitle>
            <CardDescription>
              Manage your tenants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              View Tenants
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Maintenance</CardTitle>
            <CardDescription>
              Handle maintenance requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              View Requests
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Reports</CardTitle>
            <CardDescription>
              View revenue and expense reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}