"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlogPostEditor } from "@/components/admin/blog-post-editor";

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  publishedAt?: string;
}

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/admin/blog-posts/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        console.error("Failed to fetch post");
        router.push("/admin/blog");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      router.push("/admin/blog");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedPost: BlogPost) => {
    try {
      const response = await fetch(`/api/admin/blog-posts/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPost),
      });

      if (response.ok) {
        const savedPost = await response.json();
        setPost(savedPost);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to save post");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      throw error;
    }
  };

  const handlePublish = async (updatedPost: BlogPost) => {
    try {
      const response = await fetch(`/api/admin/blog-posts/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...updatedPost,
          status: "PUBLISHED",
          publishedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const savedPost = await response.json();
        setPost(savedPost);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to publish post");
      }
    } catch (error) {
      console.error("Error publishing post:", error);
      throw error;
    }
  };

  const handleUnpublish = async (updatedPost: BlogPost) => {
    try {
      const response = await fetch(`/api/admin/blog-posts/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...updatedPost,
          status: "DRAFT",
          publishedAt: null,
        }),
      });

      if (response.ok) {
        const savedPost = await response.json();
        setPost(savedPost);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to unpublish post");
      }
    } catch (error) {
      console.error("Error unpublishing post:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="container p-6 mx-auto">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="size-8 mx-auto mb-4 border-b-2 border-primary rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container p-6 mx-auto">
        <div className="text-center">
          <p className="text-muted-foreground">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      <BlogPostEditor
        post={post}
        onSave={handleSave}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
      />
    </div>
  );
} 