import { cn } from "@/lib/utils";

import { Icons } from "../shared/icons";

interface DocsPageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string;
  text?: string;
}

export function DocsPageHeader({
  heading,
  text,
  className,
  ...props
}: DocsPageHeaderProps) {
  return (
    <>
      <div className="flex mb-4 space-x-1 text-sm text-muted-foreground items-center">
        <div className="truncate">Docs</div>
        <Icons.chevronRight className="size-4" />
        <div className="text-purple-600/95 dark:text-purple-400 font-medium">
          {heading}
        </div>
      </div>

      <div className={cn("space-y-2", className)} {...props}>
        <h1 className="inline-block text-4xl scroll-m-20 font-heading">
          {heading}
        </h1>
        {text && (
          <p className="text-balance text-lg text-muted-foreground">{text}</p>
        )}
      </div>
    </>
  );
}
