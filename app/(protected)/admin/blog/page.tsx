"use client";

import { useState, useEffect } from "react";
import { BlogPostList } from "@/components/admin/blog-post-list";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

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

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/admin/blog-posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/blog-posts/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setPosts(posts.filter(post => post.id !== id));
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  };

  const handleStatusChange = async (id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    try {
      const post = posts.find(p => p.id === id);
      if (!post) return;

      const response = await fetch(`/api/admin/blog-posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...post,
          status,
        }),
      });
      
      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(p => p.id === id ? updatedPost : p));
      } else {
        throw new Error("Failed to update post status");
      }
    } catch (error) {
      console.error("Error updating post status:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="container p-6 mx-auto">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="size-8 mx-auto mb-4 border-b-2 border-primary rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      <BlogPostList
        posts={posts}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
} 