import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Calendar, User, Tag, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { constructMetadata } from "@/lib/utils";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Fallback blog posts for when database table doesn't exist
const fallbackPosts = [
  {
    id: "1",
    title: "Deploying Next.js Applications",
    slug: "deploying-next-apps",
    excerpt: "Learn how to deploy your Next.js applications to production with best practices and optimization tips.",
    content: "This is a comprehensive guide to deploying Next.js applications...",
    featuredImage: "/_static/blog/deploying-next-apps.jpg",
    tags: ["Next.js", "Deployment", "Production"],
    status: "PUBLISHED",
    publishedAt: new Date("2024-01-15"),
    createdAt: new Date("2024-01-15"),
    viewCount: 0,
    metaTitle: "Deploying Next.js Applications - EventCraftAI",
    metaDescription: "Learn how to deploy your Next.js applications to production with best practices and optimization tips.",
    author: {
      name: "EventCraftAI Team",
      email: "team@eventcraftai.com"
    }
  },
  {
    id: "2", 
    title: "Dynamic Routing and Static Regeneration",
    slug: "dynamic-routing-static-regeneration",
    excerpt: "Explore Next.js dynamic routing capabilities and how to implement static regeneration for optimal performance.",
    content: "Next.js provides powerful dynamic routing capabilities...",
    featuredImage: "/_static/blog/dynamic-routing.jpg",
    tags: ["Next.js", "Routing", "Performance"],
    status: "PUBLISHED",
    publishedAt: new Date("2024-01-10"),
    createdAt: new Date("2024-01-10"),
    viewCount: 0,
    metaTitle: "Dynamic Routing and Static Regeneration - EventCraftAI",
    metaDescription: "Explore Next.js dynamic routing capabilities and how to implement static regeneration for optimal performance.",
    author: {
      name: "EventCraftAI Team",
      email: "team@eventcraftai.com"
    }
  },
  {
    id: "3",
    title: "Preview Mode with Headless CMS",
    slug: "preview-mode-headless-cms", 
    excerpt: "Implement preview mode in your Next.js application with headless CMS integration for content management.",
    content: "Preview mode allows you to see your content changes before publishing...",
    featuredImage: "/_static/blog/preview-mode.jpg",
    tags: ["CMS", "Preview", "Content"],
    status: "PUBLISHED",
    publishedAt: new Date("2024-01-05"),
    createdAt: new Date("2024-01-05"),
    viewCount: 0,
    metaTitle: "Preview Mode with Headless CMS - EventCraftAI",
    metaDescription: "Implement preview mode in your Next.js application with headless CMS integration for content management.",
    author: {
      name: "EventCraftAI Team",
      email: "team@eventcraftai.com"
    }
  }
];

async function getBlogPost(slug: string) {
  try {
    // Try to get post from database
    const post = await prisma.blogPost.findUnique({
      where: {
        slug,
        status: "PUBLISHED",
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return post;
  } catch (error) {
    // If database table doesn't exist, use fallback posts
    console.log("Blog posts table not found, using fallback content");
    return fallbackPosts.find(post => post.slug === slug);
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return constructMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: post.featuredImage,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  // Increment view count (only if database is available)
  try {
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });
  } catch (error) {
    // Silently ignore view count increment errors when database is not available
    console.log("Could not increment view count - database not available");
  }

  return (
    <div className="container max-w-4xl px-4 py-8 mx-auto">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/blog">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Blog
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <article className="mb-12">
        {/* Tags */}
        <div className="flex mb-4 items-center gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Title */}
        <h1 className="mb-6 text-4xl md:text-5xl font-bold tracking-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-8 text-xl text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 rounded-lg md:h-96 object-cover"
            />
          </div>
        )}

        {/* Meta Information */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap text-sm text-muted-foreground items-center gap-6">
              <div className="flex items-center gap-2">
                <User className="size-4" />
                <span>By {post.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                <span>
                  {post.publishedAt
                    ? format(new Date(post.publishedAt), "MMMM d, yyyy")
                    : format(new Date(post.createdAt), "MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="size-4" />
                <span>{post.tags.length} tags</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="size-4" />
                <span>{post.viewCount} views</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Article Content */}
        <div className="max-w-none dark:prose-invert prose prose-lg">
          <div className="whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>
        </div>
      </article>

      {/* Share Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Share this article</h3>
          <div className="flex gap-2">
            <Link href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`)}`} target="_blank">
              <Button variant="outline">
                <Share2 className="size-4 mr-2" />
                Share on Twitter
              </Button>
            </Link>
            <Link href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`)}`} target="_blank">
              <Button variant="outline">
                Share on Facebook
              </Button>
            </Link>
            <Link href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`)}`} target="_blank">
              <Button variant="outline">
                Share on LinkedIn
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Related Posts */}
      <div className="mb-8">
        <h3 className="mb-6 text-2xl font-semibold">Related Posts</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* You can implement related posts logic here */}
          <Card className="p-4">
            <CardContent>
              <p className="text-muted-foreground text-sm">
                More posts coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Back to Blog */}
      <div className="text-center">
        <Link href="/blog">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Blog
          </Button>
        </Link>
      </div>
    </div>
  );
} 