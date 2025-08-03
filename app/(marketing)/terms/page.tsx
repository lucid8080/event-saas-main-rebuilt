import { Metadata } from "next"
import { allPages } from "@/.contentlayer/generated"
import { notFound } from "next/navigation"
import { Mdx } from "@/components/content/mdx-components"

export const metadata: Metadata = {
  title: "Terms of Service - EventCraftAI",
  description: "Read our terms and conditions for using EventCraftAI services.",
}

async function getPageFromParams() {
  const page = allPages.find((page) => page.slugAsParams === "terms")
  
  if (!page) {
    null
  }

  return page
}

export default async function TermsPage() {
  const page = await getPageFromParams()

  if (!page) {
    notFound()
  }

  return (
    <div className="container max-w-4xl px-4 py-16 mx-auto">
      <div className="max-w-none dark:prose-invert prose prose-gray">
        <Mdx code={page.body.code} />
      </div>
    </div>
  )
} 