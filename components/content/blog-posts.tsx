import { Post } from "@/.contentlayer/generated";

import { BlogCard } from "./blog-card";

export function BlogPosts({
  posts,
}: {
  posts: (Post & {
    blurDataURL: string | null;
  })[];
}) {
  if (!posts || posts.length === 0) {
    return (
      <main className="space-y-8">
        <div className="py-12 text-center">
          <h2 className="text-2xl text-gray-900 dark:text-gray-100 font-bold">
            No blog posts available
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Check back later for new content.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <BlogCard data={posts[0]} horizontale priority />

      <div className="grid md:grid-cols-2 md:gap-x-6 md:gap-y-10 xl:grid-cols-3 gap-8">
        {posts.slice(1).map((post, idx) => (
          <BlogCard data={post} key={post._id} priority={idx <= 2} />
        ))}
      </div>
    </main>
  );
}
