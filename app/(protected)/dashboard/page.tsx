import { ImageGenerator } from "@/components/dashboard/image-generator";
import { DashboardHeader } from "@/components/dashboard/header";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex flex-col">
      <div className="shrink-0">
        <DashboardHeader
          heading="Event Generator"
          text="Create unique images for your events using AI"
        />
      </div>
      
      <div className="flex flex-col">
        <div>
          <ImageGenerator />
        </div>
      </div>
    </div>
  );
}