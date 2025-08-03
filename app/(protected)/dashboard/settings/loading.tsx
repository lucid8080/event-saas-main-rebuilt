import { DashboardHeader } from "@/components/dashboard/header";
import { SkeletonSection } from "@/components/shared/section-skeleton";

export default function DashboardSettingsLoading() {
  return (
    <>
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      <div className="pb-10 divide-y divide-muted">
        <SkeletonSection />
        <SkeletonSection />
        <SkeletonSection card />
      </div>
    </>
  );
}
