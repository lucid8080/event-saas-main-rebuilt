"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, 
  Eye, 
  EyeOff, 
  Upload, 
  Calendar, 
  Tag, 
  User, 
  FileText,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

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

interface BlogPostEditorProps {
  post?: BlogPost;
  onSave: (post: BlogPost) => Promise<void>;
  onPublish?: (post: BlogPost) => Promise<void>;
  onUnpublish?: (post: BlogPost) => Promise<void>;
}

export function BlogPostEditor({ post, onSave, onPublish, onUnpublish }: BlogPostEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<BlogPost>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    status: "DRAFT",
    tags: [],
    metaTitle: "",
    metaDescription: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData(post);
    }
  }, [post]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      metaTitle: title,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      toast.success("Post saved successfully");
    } catch (error) {
      toast.error("Failed to save post");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsLoading(true);
    try {
      const postToPublish = {
        ...formData,
        status: "PUBLISHED" as const,
        publishedAt: new Date().toISOString(),
      };
      await onPublish?.(postToPublish);
      setFormData(postToPublish);
      toast.success("Post published successfully");
    } catch (error) {
      toast.error("Failed to publish post");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setIsLoading(true);
    try {
      const postToUnpublish = {
        ...formData,
        status: "DRAFT" as const,
        publishedAt: undefined,
      };
      await onUnpublish?.(postToUnpublish);
      setFormData(postToUnpublish);
      toast.success("Post unpublished successfully");
    } catch (error) {
      toast.error("Failed to unpublish post");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = formData.content.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {post?.id ? "Edit Post" : "Create New Post"}
          </h1>
          <p className="text-muted-foreground">
            {post?.id ? "Update your blog post" : "Write a new blog post"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <EyeOff className="size-4 mr-2" /> : <Eye className="size-4 mr-2" />}
            {previewMode ? "Hide Preview" : "Preview"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
          >
            <Save className="size-4 mr-2" />
            Save Draft
          </Button>
          {formData.status === "DRAFT" ? (
            <Button
              onClick={handlePublish}
              disabled={isLoading}
              variant="default"
            >
              <CheckCircle className="size-4 mr-2" />
              Publish
            </Button>
          ) : (
            <Button
              onClick={handleUnpublish}
              disabled={isLoading}
              variant="outline"
            >
              <Clock className="size-4 mr-2" />
              Unpublish
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Post Title
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Enter your post title..."
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-2xl font-bold"
              />
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <div className="flex text-sm text-muted-foreground items-center gap-4">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{readingTime} min read</span>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write your blog post content here..."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[400px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Preview */}
          {previewMode && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-none dark:prose-invert prose">
                  <h1>{formData.title}</h1>
                  {formData.featuredImage && (
                    <img 
                      src={formData.featuredImage} 
                      alt={formData.title}
                      className="w-full h-48 rounded-lg object-cover"
                    />
                  )}
                  <p className="text-muted-foreground">{formData.excerpt}</p>
                  <div className="whitespace-pre-wrap">{formData.content}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {formData.status === "PUBLISHED" ? (
                  <CheckCircle className="size-4 text-green-500" />
                ) : (
                  <Clock className="size-4 text-yellow-500" />
                )}
                <Badge variant={formData.status === "PUBLISHED" ? "default" : "secondary"}>
                  {formData.status}
                </Badge>
              </div>
              {formData.publishedAt && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Published: {new Date(formData.publishedAt).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Slug */}
          <Card>
            <CardHeader>
              <CardTitle>URL Slug</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="post-url-slug"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                /blog/{formData.slug}
              </p>
            </CardContent>
          </Card>

          {/* Excerpt */}
          <Card>
            <CardHeader>
              <CardTitle>Excerpt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Brief description of your post..."
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="size-5" />
                Featured Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Image URL..."
                value={formData.featuredImage}
                onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
              />
              {formData.featuredImage && (
                <img 
                  src={formData.featuredImage} 
                  alt="Featured"
                  className="w-full h-32 mt-2 rounded-lg object-cover"
                />
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="size-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex mb-2 gap-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button onClick={handleAddTag} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <Input
                  placeholder="SEO title..."
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  placeholder="SEO description..."
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 