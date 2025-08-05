import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { constructMetadata } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Blog - EventCraftAI",
  description: "Discover tips, guides, and insights for creating amazing events with AI-powered design tools.",
});

// Fallback blog posts for when database table doesn't exist
const fallbackPosts = [
  {
    id: "1",
    title: "Deploying Next.js Applications",
    slug: "deploying-next-apps",
    excerpt: "Learn how to deploy your Next.js applications to production with best practices and optimization tips.",
    content: "",
    featuredImage: "/_static/blog/deploying-next-apps.jpg",
    tags: ["Next.js", "Deployment", "Production"],
    status: "PUBLISHED",
    publishedAt: new Date("2024-01-15"),
    createdAt: new Date("2024-01-15"),
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
    content: "",
    featuredImage: "/_static/blog/dynamic-routing.jpg",
    tags: ["Next.js", "Routing", "Performance"],
    status: "PUBLISHED",
    publishedAt: new Date("2024-01-10"),
    createdAt: new Date("2024-01-10"),
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
    content: "",
    featuredImage: "/_static/blog/preview-mode.jpg",
    tags: ["CMS", "Preview", "Content"],
    status: "PUBLISHED",
    publishedAt: new Date("2024-01-05"),
    createdAt: new Date("2024-01-05"),
    author: {
      name: "EventCraftAI Team",
      email: "team@eventcraftai.com"
    }
  }
];

async function getBlogPosts() {
  try {
    // Try to get posts from database
    const posts = await prisma.blogPost.findMany({
      where: {
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
      orderBy: {
        publishedAt: "desc",
      },
    });

    return posts;
  } catch (error) {
    // If database table doesn't exist, use fallback posts
    console.log("Blog posts table not found, using fallback content");
    return fallbackPosts;
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          EventCraftAI Blog
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
          Discover tips, guides, and insights for creating amazing events with AI-powered design tools.
        </p>
      </div>

      {/* Featured Post */}
      {posts.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Featured Post</h2>
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6">
              {posts[0].featuredImage && (
                <div className="relative h-64 md:h-full">
                  <img
                    src={posts[0].featuredImage}
                    alt={posts[0].title}
                    className="size-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col p-6 justify-center">
                <div className="flex mb-4 items-center gap-2">
                  <Badge variant="secondary">Featured</Badge>
                  {posts[0].tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="mb-3 text-2xl font-bold">{posts[0].title}</h3>
                <p className="mb-4 text-muted-foreground line-clamp-3">
                  {posts[0].excerpt}
                </p>
                <div className="flex mb-4 text-sm text-muted-foreground items-center gap-4">
                  <span>By {posts[0].author.name}</span>
                  <span>•</span>
                  <span>
                    {posts[0].publishedAt
                      ? format(new Date(posts[0].publishedAt), "MMM d, yyyy")
                      : format(new Date(posts[0].createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <Link href={`/blog/${posts[0].slug}`}>
                  <Button>Read More</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* All Posts */}
      <div>
        <h2 className="mb-6 text-2xl font-semibold">All Posts</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(1).map((post) => (
            <Card key={post.id} className="transition-shadow hover:shadow-lg overflow-hidden">
              {post.featuredImage && (
                <div className="relative h-48">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="size-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex mb-2 items-center gap-2">
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex text-sm text-muted-foreground items-center gap-4">
                    <span>{post.author.name}</span>
                    <span>•</span>
                    <span>
                      {post.publishedAt
                        ? format(new Date(post.publishedAt), "MMM d, yyyy")
                        : format(new Date(post.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="ghost" size="sm">
                      Read More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="py-12 text-center">
          <div className="text-muted-foreground">
            <div className="mb-4 text-6xl">📝</div>
            <h3 className="mb-2 text-xl font-semibold">No posts yet</h3>
            <p>Check back soon for amazing content about event planning and design!</p>
          </div>
        </div>
      )}
    </div>
  );
}
