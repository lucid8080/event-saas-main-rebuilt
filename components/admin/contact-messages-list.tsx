"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Search,
  Eye,
  CheckCircle,
  MessageSquare,
  Archive,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "RESPONDED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const statusColors = {
  NEW: "bg-blue-100 text-blue-800",
  READ: "bg-yellow-100 text-yellow-800",
  RESPONDED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  NEW: "New",
  READ: "Read",
  RESPONDED: "Responded",
  ARCHIVED: "Archived",
};

export function ContactMessagesList() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
        status: statusFilter,
      });

      const response = await fetch(`/api/contact?${params}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
        setPagination(data.pagination);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch messages",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const response = await fetch(`/api/contact/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Message status updated successfully",
        });
        fetchMessages(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating message status:", error);
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentPage, searchTerm, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "NEW":
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      case "READ":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case "RESPONDED":
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case "ARCHIVED":
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
      default:
        return null;
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Messages</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="READ">Read</SelectItem>
            <SelectItem value="RESPONDED">Responded</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(message.status)}
                    <Badge className={statusColors[message.status]}>
                      {statusLabels[message.status]}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {message.firstName} {message.lastName}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <a
                    href={`mailto:${message.email}`}
                    className="text-primary hover:underline"
                  >
                    {message.email}
                  </a>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {message.subject}
                </TableCell>
                <TableCell>{formatDate(message.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMessage(message)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    {message.status === "NEW" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateMessageStatus(message.id, "READ")}
                      >
                        <CheckCircle className="size-4" />
                      </Button>
                    )}
                    {message.status !== "ARCHIVED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateMessageStatus(message.id, "ARCHIVED")}
                      >
                        <Archive className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} messages
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">
                    {selectedMessage.firstName} {selectedMessage.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <p className="font-medium">{selectedMessage.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <p>{formatDate(selectedMessage.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedMessage.status)}
                  <Badge className={statusColors[selectedMessage.status]}>
                    {statusLabels[selectedMessage.status]}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Message</label>
                <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t">
                {selectedMessage.status === "NEW" && (
                  <Button
                    onClick={() => {
                      updateMessageStatus(selectedMessage.id, "READ");
                      setSelectedMessage(null);
                    }}
                  >
                    <CheckCircle className="size-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
                {selectedMessage.status === "READ" && (
                  <Button
                    onClick={() => {
                      updateMessageStatus(selectedMessage.id, "RESPONDED");
                      setSelectedMessage(null);
                    }}
                  >
                    <MessageSquare className="size-4 mr-2" />
                    Mark as Responded
                  </Button>
                )}
                {selectedMessage.status !== "ARCHIVED" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateMessageStatus(selectedMessage.id, "ARCHIVED");
                      setSelectedMessage(null);
                    }}
                  >
                    <Archive className="size-4 mr-2" />
                    Archive
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`);
                  }}
                >
                  Reply via Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 