"use client";

import { useRouter } from "next/navigation";
import { BlogPostEditor } from "@/components/admin/blog-post-editor";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

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

export default function NewBlogPostPage() {
  const router = useRouter();

  const handleSave = async (post: BlogPost) => {
    try {
      const response = await fetch("/api/admin/blog-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(post),
      });

      if (response.ok) {
        const savedPost = await response.json();
        router.push(`/admin/blog/${savedPost.id}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to save post");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      throw error;
    }
  };

  const handlePublish = async (post: BlogPost) => {
    try {
      const response = await fetch("/api/admin/blog-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...post,
          status: "PUBLISHED",
          publishedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const savedPost = await response.json();
        router.push(`/admin/blog/${savedPost.id}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to publish post");
      }
    } catch (error) {
      console.error("Error publishing post:", error);
      throw error;
    }
  };

  return (
    <div className="container p-6 mx-auto">
      <BlogPostEditor
        onSave={handleSave}
        onPublish={handlePublish}
      />
    </div>
  );
} 