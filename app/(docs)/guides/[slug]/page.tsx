import { allGuides } from "contentlayer/generated";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Mdx } from "@/components/content/mdx-components";
import { DocsPageHeader } from "@/components/docs/page-header";
import { Icons } from "@/components/shared/icons";
import { DashboardTableOfContents } from "@/components/shared/toc";
import { getTableOfContents } from "@/lib/toc";

import "@/styles/mdx.css";

import { Metadata } from "next";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { buttonVariants } from "@/components/ui/button";
import { cn, constructMetadata } from "@/lib/utils";

export async function generateStaticParams() {
  return allGuides.map((guide) => ({
    slug: guide.slugAsParams,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const guide = allGuides.find((guide) => guide.slugAsParams === params.slug);
  if (!guide) {
    return;
  }

  const { title, description } = guide;

  return constructMetadata({
    title: `${title} – EventCraftAI`,
    description: description,
  });
}

export default async function GuidePage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const guide = allGuides.find((guide) => guide.slugAsParams === params.slug);

  if (!guide) {
    notFound();
  }

  const toc = await getTableOfContents(guide.body.raw);

  return (
    <MaxWidthWrapper>
      <div className="relative py-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 lg:py-10 xl:gap-20">
        <div>
          <DocsPageHeader heading={guide.title} text={guide.description} />
          <Mdx code={guide.body.code} />
          <hr className="my-4" />
          <div className="flex py-6 lg:py-10 justify-center">
            <Link
              href="/guides"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              <Icons.chevronLeft className="size-4 mr-2" />
              See all guides
            </Link>
          </div>
        </div>
        <div className="hidden text-sm lg:block">
          <div className="sticky max-h-[calc(var(--vh)-4rem)] pt-10 top-16 -mt-10 overflow-y-auto">
            <DashboardTableOfContents toc={toc} />
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
