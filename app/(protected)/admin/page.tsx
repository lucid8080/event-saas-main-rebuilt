import { redirect } from "next/navigation";
import { Users, Image, TrendingUp, Activity, BarChart3, PieChart, Settings, FileText, MessageSquare, Database, Bell, Shield } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { DashboardHeader } from "@/components/dashboard/header";
import RealTransactionsList from "@/components/dashboard/real-transactions-list";
import UsersList from "@/components/dashboard/users-list";
import AdminStats from "@/components/dashboard/admin-stats";
import RealCharts from "@/components/dashboard/real-charts";
import { ImageEditToggleForm } from "@/components/forms/image-edit-toggle-form";
import { MarqueeToggleForm } from "@/components/forms/marquee-toggle-form";
import { SystemPromptsManager } from "@/components/admin/system-prompts-manager";
import { ContactMessagesList } from "@/components/admin/contact-messages-list";
import R2AnalyticsDashboard from "@/components/admin/r2-analytics-dashboard";
import R2AlertsDashboard from "@/components/admin/r2-alerts-dashboard";
import { RoleManagement } from "@/components/admin/role-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import all chart components
import { InteractiveBarChart } from "@/components/charts/interactive-bar-chart";
import { AreaChartStacked } from "@/components/charts/area-chart-stacked";
import { RadialChartGrid } from "@/components/charts/radial-chart-grid";
import { LineChartMultiple } from "@/components/charts/line-chart-multiple";
import { RadialTextChart } from "@/components/charts/radial-text-chart";
import { RadialStackedChart } from "@/components/charts/radial-stacked-chart";
import { RadialShapeChart } from "@/components/charts/radial-shape-chart";
import { RadarChartSimple } from "@/components/charts/radar-chart-simple";
import { BarChartMixed } from "@/components/charts/bar-chart-mixed";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "HERO")) redirect("/login");

  return (
    <>
      <DashboardHeader
        heading="Admin Dashboard"
        text="Comprehensive analytics and system monitoring for administrators."
      />
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-11 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="size-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="size-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="r2-analytics" className="flex items-center gap-2">
            <Database className="size-4" />
            R2 Analytics
          </TabsTrigger>
          <TabsTrigger value="r2-alerts" className="flex items-center gap-2">
            <Bell className="size-4" />
            R2 Alerts
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="size-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Settings className="size-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="size-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <FileText className="size-4" />
            System Prompts
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="size-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="size-4" />
            Roles
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Key Metrics */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <AdminStats />

          {/* Real Charts */}
          <RealCharts />
        </TabsContent>

        {/* Analytics Tab - Real Data Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="py-8 text-center">
            <h3 className="mb-2 text-lg font-semibold">Real-Time Analytics</h3>
            <p className="mb-4 text-muted-foreground">
              Analytics data will appear here as users interact with the system.
            </p>
            <p className="text-sm text-muted-foreground">
              The system is now tracking real statistics. Charts will populate as activity occurs.
            </p>
          </div>
        </TabsContent>

        {/* Performance Tab - Real Performance Data */}
        <TabsContent value="performance" className="space-y-6">
          <div className="py-8 text-center">
            <h3 className="mb-2 text-lg font-semibold">Performance Analytics</h3>
            <p className="mb-4 text-muted-foreground">
              Performance data will appear here as the system collects metrics.
            </p>
            <p className="text-sm text-muted-foreground">
              The system is now tracking real performance statistics.
            </p>
          </div>
        </TabsContent>

        {/* R2 Analytics Tab - Comprehensive R2 Monitoring */}
        <TabsContent value="r2-analytics" className="space-y-6">
          <R2AnalyticsDashboard />
        </TabsContent>

        {/* R2 Alerts Tab - Alert Management */}
        <TabsContent value="r2-alerts" className="space-y-6">
          <R2AlertsDashboard />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <UsersList />
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          {/* Real Transaction Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RealTransactionsList />
            <RealTransactionsList />
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Contact Messages</h2>
              <p className="text-muted-foreground">
                Manage and respond to contact form submissions from users.
              </p>
            </div>
            <ContactMessagesList />
          </div>
        </TabsContent>

        {/* System Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <SystemPromptsManager />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="space-y-6">
            <ImageEditToggleForm />
            <MarqueeToggleForm />
          </div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <RoleManagement currentUserRole={user.role} />
        </TabsContent>
      </Tabs>
    </>
  );
}
