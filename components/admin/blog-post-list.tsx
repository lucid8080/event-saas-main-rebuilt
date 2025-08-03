"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  User,
  Tag,
  BarChart3,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tags: string[];
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    email: string;
  };
}

interface BlogPostListProps {
  posts: BlogPost[];
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") => Promise<void>;
}

export function BlogPostList({ posts, onDelete, onStatusChange }: BlogPostListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");

  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || post.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "publishedAt":
          return (b.publishedAt || "").localeCompare(a.publishedAt || "");
        case "viewCount":
          return b.viewCount - a.viewCount;
        case "createdAt":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete post");
      console.error(error);
    }
  };

  const handleStatusChange = async (id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    try {
      await onStatusChange(id, status);
      toast.success("Post status updated successfully");
    } catch (error) {
      toast.error("Failed to update post status");
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage your blog posts and content
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="size-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute size-4 text-muted-foreground left-3 top-3" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="publishedAt">Date Published</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="viewCount">Views</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex text-sm text-muted-foreground items-center justify-center">
              {filteredPosts.length} of {posts.length} posts
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <FileText className="size-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No posts found</p>
                <p className="text-sm">Create your first blog post to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-2 text-xl font-semibold">{post.title}</h3>
                        <p className="mb-3 text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="flex ml-4 items-center gap-2">
                        <Badge variant="secondary" className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                        <div className="flex text-sm text-muted-foreground items-center gap-1">
                          <BarChart3 className="size-4" />
                          {post.viewCount}
                        </div>
                      </div>
                    </div>

                    <div className="flex text-sm text-muted-foreground items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="size-4" />
                        {post.author.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="size-4" />
                          {post.tags.slice(0, 3).join(", ")}
                          {post.tags.length > 3 && ` +${post.tags.length - 3} more`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex ml-4 items-center gap-2">
                    <Link href={`/admin/blog/${post.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="size-4" />
                      </Button>
                    </Link>
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <Eye className="size-4" />
                      </Button>
                    </Link>
                    <Select
                      value={post.status}
                      onValueChange={(value: "DRAFT" | "PUBLISHED" | "ARCHIVED") => 
                        handleStatusChange(post.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{post.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(post.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 