"use client";

import { useTransition } from "react";
import { openCustomerPortal } from "@/actions/open-customer-portal";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { toast } from "sonner";

interface CustomerPortalButtonProps {
  userStripeId: string;
}

export function CustomerPortalButton({
  userStripeId,
}: CustomerPortalButtonProps) {
  let [isPending, startTransition] = useTransition();

  const stripeSessionAction = () =>
    startTransition(async () => {
      try {
        await openCustomerPortal(userStripeId);
      } catch (error: any) {
        toast.error(error?.message || "Failed to open customer portal");
      }
    });

  return (
    <Button disabled={isPending} onClick={stripeSessionAction}>
      {isPending ? (
        <Icons.spinner className="size-4 mr-2 animate-spin" />
      ) : null}
      Open Customer Portal
    </Button>
  );
}
