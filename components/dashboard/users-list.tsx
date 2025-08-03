"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Users, Crown, User, Edit2, Check, X, Coins } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "ADMIN" | "USER";
  credits: number;
  createdAt: string;
  updatedAt: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeCurrentPeriodEnd: string | null;
  _count: {
    generatedImages: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UsersResponse {
  users: User[];
  pagination: Pagination;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [editingCredits, setEditingCredits] = useState<string | null>(null);
  const [updatingCredits, setUpdatingCredits] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
          const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: "10",
      search,
      ...(roleFilter !== "all" && { role: roleFilter }),
      sortBy,
      sortOrder,
    });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      
      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search, roleFilter, sortBy, sortOrder]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const handleRoleEdit = (userId: string) => {
    setEditingRole(userId);
  };

  const handleRoleCancel = () => {
    setEditingRole(null);
  };

  const handleRoleSave = async (userId: string, newRole: "ADMIN" | "USER") => {
    setUpdatingRole(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      // Update the user in the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast.success(`User role updated to ${newRole}`);
      setEditingRole(null);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleCreditsEdit = (userId: string) => {
    setEditingCredits(userId);
  };

  const handleCreditsCancel = () => {
    setEditingCredits(null);
  };

  const handleCreditsSave = async (userId: string, newCredits: number) => {
    setUpdatingCredits(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credits: newCredits }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user credits");
      }

      // Update the user in the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, credits: newCredits } : user
        )
      );

      toast.success(`User credits updated to ${newCredits}`);
      setEditingCredits(null);
    } catch (error) {
      console.error("Error updating user credits:", error);
      toast.error("Failed to update user credits");
    } finally {
      setUpdatingCredits(null);
    }
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const isSubscriptionActive = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate) > new Date();
  };

  if (loading && users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex py-8 items-center justify-center">
            <div className="text-muted-foreground">Loading users...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5" />
          User Management
        </CardTitle>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative">
              <Search className="absolute size-4 text-muted-foreground left-2 top-2.5" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-8 sm:w-64"
              />
            </div>
            <Select value={roleFilter} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {pagination && (
            <div className="text-sm text-muted-foreground">
              {pagination.total} total users
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("role")}
                    className="h-auto p-0 font-medium"
                  >
                    Role
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("credits")}
                    className="h-auto p-0 font-medium"
                  >
                    Credits
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("_count.generatedImages")}
                    className="h-auto p-0 font-medium"
                  >
                    Images
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("createdAt")}
                    className="h-auto p-0 font-medium"
                  >
                    Joined
                  </Button>
                </TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback>
                          {getInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.name || "Unnamed User"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingRole === user.id ? (
                      <div className="flex items-center gap-2">
                        <Select
                          defaultValue={user.role}
                          onValueChange={(value: "ADMIN" | "USER") => {
                            setUsers(prevUsers =>
                              prevUsers.map(u =>
                                u.id === user.id ? { ...u, role: value } : u
                              )
                            );
                          }}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">USER</SelectItem>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRoleSave(user.id, user.role)}
                          disabled={updatingRole === user.id}
                        >
                          {updatingRole === user.id ? (
                            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Check className="size-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleRoleCancel}
                          disabled={updatingRole === user.id}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                          {user.role === "ADMIN" ? (
                            <Crown className="size-3 mr-1" />
                          ) : (
                            <User className="size-3 mr-1" />
                          )}
                          {user.role}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRoleEdit(user.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="size-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCredits === user.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          defaultValue={user.credits}
                          className="w-20"
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setUsers(prevUsers =>
                              prevUsers.map(u =>
                                u.id === user.id ? { ...u, credits: value } : u
                              )
                            );
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCreditsSave(user.id, user.credits)}
                          disabled={updatingCredits === user.id}
                        >
                          {updatingCredits === user.id ? (
                            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Check className="size-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCreditsCancel}
                          disabled={updatingCredits === user.id}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium flex items-center gap-1">
                          <Coins className="size-3" />
                          {user.credits}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCreditsEdit(user.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="size-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {user._count.generatedImages}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.stripeSubscriptionId ? (
                      <Badge
                        variant={isSubscriptionActive(user.stripeCurrentPeriodEnd) ? "default" : "destructive"}
                      >
                        {isSubscriptionActive(user.stripeCurrentPeriodEnd) ? "Active" : "Expired"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleEdit(user.id)}
                        disabled={editingRole === user.id}
                      >
                        Edit Role
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreditsEdit(user.id)}
                        disabled={editingCredits === user.id}
                      >
                        Edit Credits
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex mt-4 items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 