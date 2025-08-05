import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
import { DashboardHeader } from "@/components/dashboard/header";
import { UserNameForm } from "@/components/forms/user-name-form";
import { CreditValueForm } from "@/components/forms/credit-value-form";
import { UserImageForm } from "@/components/forms/user-image-form";
import { TicketmasterFlyerToggleForm } from "@/components/forms/ticketmaster-flyer-toggle-form";
import { CarouselMakerToggleForm } from "@/components/forms/carousel-maker-toggle-form";
import { WatermarkToggleForm } from "@/components/forms/watermark-toggle-form";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

export const metadata = constructMetadata({
  title: "Settings – EventCraftAI",
  description: "Configure your account and website settings.",
});

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user?.id) redirect("/login");

  return (
    <>
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      <div className="pb-10 divide-y divide-muted">
        <UserImageForm user={{ id: user.id, name: user.name, image: user.image }} />
        <UserNameForm user={{ id: user.id, name: user.name || "" }} />
        {user.role === "ADMIN" && <CreditValueForm />}
        <TicketmasterFlyerToggleForm />
        <CarouselMakerToggleForm />
        <WatermarkToggleForm />
        <DeleteAccountSection />
      </div>
    </>
  );
}
