import { ScrollArea } from "@/components/ui/scroll-area";
import { DocsSidebarNav } from "@/components/docs/sidebar-nav";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="flex-1 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 items-start">
      <aside className="fixed hidden w-full h-[calc(100vh-3.5rem)] md:sticky md:block top-14 -ml-2 shrink-0">
        <ScrollArea className="h-full py-6 pr-6 lg:py-8">
          <DocsSidebarNav />
        </ScrollArea>
      </aside>
      {children}
    </div>
  );
}
