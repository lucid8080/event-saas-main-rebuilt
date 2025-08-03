"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

interface DocsSearchProps extends React.HTMLAttributes<HTMLFormElement> {}

export function DocsSearch({ className, ...props }: DocsSearchProps) {
  function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()

    return toast({
      title: "Not implemented",
      description: "We're still working on the search.",
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("relative w-full", className)}
      {...props}
    >
      <Input
        type="search"
        placeholder="Search documentation..."
        className="w-full h-8 sm:w-64 sm:pr-12"
      />
      <kbd className="absolute hidden h-5 px-1.5 bg-background text-[10px] text-muted-foreground rounded opacity-100 sm:flex pointer-events-none right-1.5 top-1.5 select-none items-center gap-1 border font-mono font-medium">
        <span className="text-xs">⌘</span>K
      </kbd>
    </form>
  )
}
