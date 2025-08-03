"use client";

import { useState, useEffect } from "react";
import { Users, Image, TrendingUp, Activity, Crown, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalImages: number;
  activeSubscriptions: number;
  newUsersThisMonth: number;
  userGrowth: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      
      const data: AdminStats = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row pb-2 space-y-0 items-center justify-between">
              <div className="w-20 h-4 bg-muted rounded animate-pulse" />
              <div className="size-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="w-16 h-8 mb-1 bg-muted rounded animate-pulse" />
              <div className="w-24 h-3 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Failed to load statistics
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row pb-2 space-y-0 items-center justify-between">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.userGrowth >= 0 ? "+" : ""}{stats.userGrowth}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row pb-2 space-y-0 items-center justify-between">
          <CardTitle className="text-sm font-medium">Images Generated</CardTitle>
          <Image className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalImages.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Across all users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row pb-2 space-y-0 items-center justify-between">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <CreditCard className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalUsers > 0 ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) : 0}% conversion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row pb-2 space-y-0 items-center justify-between">
          <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          <Crown className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAdmins}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalUsers > 0 ? Math.round((stats.totalAdmins / stats.totalUsers) * 100) : 0}% of total users
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 