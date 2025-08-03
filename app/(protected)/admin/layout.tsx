import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "Admin Dashboard – EventCraftAI",
  description: "Comprehensive admin dashboard with analytics and system monitoring.",
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
