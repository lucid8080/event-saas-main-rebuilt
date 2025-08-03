import { redirect } from "next/navigation";

import { sidebarLinks } from "@/config/dashboard";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { TopNavbar } from "@/components/layout/top-navbar";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  // Get user's current credits
  let userCredits = 0;
  if (user?.id) {
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true }
    });
    userCredits = userData?.credits || 0;
  }

  const filteredLinks = sidebarLinks.map((section) => ({
    ...section,
    items: section.items.filter(
      ({ authorizeOnly }) => {
        if (!authorizeOnly) return true;
        if (Array.isArray(authorizeOnly)) {
          return authorizeOnly.includes(user.role);
        }
        return authorizeOnly === user.role;
      },
    ),
  }));

  return (
    <div className="relative flex flex-col w-full min-h-screen">
      {/* Top Navigation Bar */}
      <TopNavbar links={filteredLinks} userCredits={userCredits} />

      {/* Main Content */}
      <main className="flex-1 p-4 xl:px-8">
        <MaxWidthWrapper className="flex flex-col max-w-7xl px-0 lg:gap-6 gap-4">
          {children}
        </MaxWidthWrapper>
      </main>
    </div>
  );
}