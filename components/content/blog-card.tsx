import Link from "next/link";
// import { Post } from "contentlayer/generated";

// Temporary fallback for contentlayer
type Post = any;

import { cn, formatDate, placeholderBlurhash } from "@/lib/utils";
import BlurImage from "@/components/shared/blur-image";

import Author from "./author";

export function BlogCard({
  data,
  priority,
  horizontale = false,
}: {
  data: Post & {
    blurDataURL: string;
  };
  priority?: boolean;
  horizontale?: boolean;
}) {
  return (
    <article
      className={cn(
        "group relative",
        horizontale
          ? "grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6"
          : "flex flex-col space-y-2",
      )}
    >
      {data.image && (
        <div className="w-full rounded-xl overflow-hidden border">
          <BlurImage
            alt={data.title}
            blurDataURL={data.blurDataURL ?? placeholderBlurhash}
            className={cn(
              "size-full object-cover object-center",
              horizontale ? "lg:h-72" : null,
            )}
            width={800}
            height={400}
            priority={priority}
            placeholder="blur"
            src={data.image}
            sizes="(max-width: 768px) 750px, 600px"
          />
        </div>
      )}
      <div
        className={cn(
          "flex flex-1 flex-col",
          horizontale ? "justify-center" : "justify-between",
        )}
      >
        <div className="w-full">
          <h2 className="my-1.5 text-2xl line-clamp-2 font-heading">
            {data.title}
          </h2>
          {data.description && (
            <p className="text-muted-foreground line-clamp-2">
              {data.description}
            </p>
          )}
        </div>
        <div className="flex mt-4 space-x-3 items-center">
          <div className="flex items-center -space-x-2">
            {data.authors.map((author) => (
              <Author username={author} key={data._id + author} imageOnly />
            ))}
          </div>

          {data.date && (
            <p className="text-sm text-muted-foreground">
              {formatDate(data.date)}
            </p>
          )}
        </div>
      </div>
      <Link href={data.slug} className="absolute inset-0">
        <span className="sr-only">View Article</span>
      </Link>
    </article>
  );
}
