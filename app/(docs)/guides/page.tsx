import Link from "next/link";
// import { allGuides } from "contentlayer/generated";

// Temporary fallback for contentlayer
const allGuides: any[] = [];
import { compareDesc } from "date-fns";

import { formatDate } from "@/lib/utils";
import { DocsPageHeader } from "@/components/docs/page-header";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export const metadata = {
  title: "Guides",
  description:
    "This section includes end-to-end guides for developing Next.js 13 apps.",
};

export default function GuidesPage() {
  const guides = allGuides
    .filter((guide) => guide.published)
    .sort((a, b) => {
      return compareDesc(new Date(a.date), new Date(b.date));
    });

  return (
    <MaxWidthWrapper className="py-6 lg:py-10">
      <DocsPageHeader
        heading="Guides"
        text="This section includes end-to-end guides for developing Next.js 13 apps."
      />
      {guides?.length ? (
        <div className="grid mt-5 md:grid-cols-2 md:gap-6 gap-4">
          {guides.map((guide) => (
            <article
              key={guide._id}
              className="relative p-6 rounded-lg shadow-md transition-shadow hover:shadow-lg group border"
            >
              {guide.featured && (
                <span className="absolute px-3 py-1 text-xs rounded-full right-4 top-4 font-medium">
                  Featured
                </span>
              )}
              <div className="flex flex-col space-y-4 justify-between">
                <div className="space-y-2">
                  <h2 className="text-xl font-medium tracking-tight">
                    {guide.title}
                  </h2>
                  {guide.description && (
                    <p className="text-muted-foreground">{guide.description}</p>
                  )}
                </div>
                {guide.date && (
                  <p className="text-sm text-muted-foreground">
                    {formatDate(guide.date)}
                  </p>
                )}
              </div>
              <Link href={guide.slug} className="absolute inset-0">
                <span className="sr-only">View</span>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p>No guides published.</p>
      )}
    </MaxWidthWrapper>
  );
}
