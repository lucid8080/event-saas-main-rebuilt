"use client";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { useDeleteAccountModal } from "@/components/modals/delete-account-modal";
import { Icons } from "@/components/shared/icons";

export function DeleteAccountSection() {
  const { setShowDeleteAccountModal, DeleteAccountModal } =
    useDeleteAccountModal();

  const userPaidPlan = true;

  return (
    <>
      <DeleteAccountModal />
      <SectionColumns
        title="Delete Account"
        description="This is a danger zone - Be careful!!!"
      >
        <div className="flex flex-col p-4 border-red-400 rounded-xl dark:border-red-900 gap-4 border">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-medium">Are you sure ?</span>

              {userPaidPlan ? (
                <div className="flex p-1 pr-2 bg-red-600/10 text-xs text-red-600 rounded-md dark:bg-red-500/10 dark:text-red-500 items-center gap-1 font-medium">
                  <div className="p-[3px] m-0.5 bg-red-600 rounded-full">
                    <Icons.close size={10} className="text-background" />
                  </div>
                  Active Subscription
                </div>
              ) : null}
            </div>
            <div className="text-balance text-sm text-muted-foreground">
              Permanently delete your {siteConfig.name} account
              {userPaidPlan ? " and your subscription" : ""}. This action cannot
              be undone - please proceed with caution.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="destructive"
              onClick={() => setShowDeleteAccountModal(true)}
            >
              <Icons.trash className="size-4 mr-2" />
              <span>Delete Account</span>
            </Button>
          </div>
        </div>
      </SectionColumns>
    </>
  );
}
