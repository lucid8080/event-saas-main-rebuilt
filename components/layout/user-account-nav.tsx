"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Lock, LogOut, Settings, CreditCard } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Drawer } from "vaul";

import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";

export function UserAccountNav() {
  const { data: session } = useSession();
  const user = session?.user;

  const [open, setOpen] = useState(false);
  const closeDrawer = () => {
    setOpen(false);
  };

  const { isMobile } = useMediaQuery();

  if (!user)
    return (
      <div className="size-8 bg-muted rounded-full animate-pulse border" />
    );

  if (isMobile) {
    return (
      <Drawer.Root open={open} onClose={closeDrawer}>
        <Drawer.Trigger onClick={() => setOpen(true)}>
          <UserAvatar
            user={{ name: user.name || null, image: user.image || null }}
            className="size-9 border"
          />
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay
            className="fixed h-full bg-background/80 inset-0 z-40 backdrop-blur-sm"
            onClick={closeDrawer}
          />
          <Drawer.Content className="fixed px-3 mt-24 bg-background text-sm rounded-t-[10px] inset-x-0 bottom-0 z-50 overflow-hidden border">
            <div className="sticky flex w-full bg-inherit top-0 z-20 items-center justify-center">
              <div className="w-16 h-1.5 my-3 bg-muted-foreground/20 rounded-full" />
            </div>

            <div className="flex p-2 items-center justify-start gap-2">
              <div className="flex flex-col">
                {user.name && <p className="font-medium">{user.name}</p>}
                {user.email && (
                  <p className="w-[200px] text-muted-foreground truncate">
                    {user?.email}
                  </p>
                )}
              </div>
            </div>

            <ul role="list" className="w-full mt-1 mb-14 text-muted-foreground">
              {user.role === "ADMIN" ? (
                <li className="text-foreground rounded-lg hover:bg-muted">
                  <Link
                    href="/admin"
                    onClick={closeDrawer}
                    className="flex w-full px-2.5 py-2 items-center gap-3"
                  >
                    <Lock className="size-4" />
                    <p className="text-sm">Admin</p>
                  </Link>
                </li>
              ) : null}

              <li className="text-foreground rounded-lg hover:bg-muted">
                <Link
                  href="/dashboard"
                  onClick={closeDrawer}
                  className="flex w-full px-2.5 py-2 items-center gap-3"
                >
                  <LayoutDashboard className="size-4" />
                  <p className="text-sm">Dashboard</p>
                </Link>
              </li>

              <li className="text-foreground rounded-lg hover:bg-muted">
                <Link
                  href="/dashboard/settings"
                  onClick={closeDrawer}
                  className="flex w-full px-2.5 py-2 items-center gap-3"
                >
                  <Settings className="size-4" />
                  <p className="text-sm">Settings</p>
                </Link>
              </li>

              <li className="text-foreground rounded-lg hover:bg-muted">
                <Link
                  href="/dashboard/billing"
                  onClick={closeDrawer}
                  className="flex w-full px-2.5 py-2 items-center gap-3"
                >
                  <CreditCard className="size-4" />
                  <p className="text-sm">Billing</p>
                </Link>
              </li>

              <li
                className="text-foreground rounded-lg hover:bg-muted"
                onClick={(event) => {
                  event.preventDefault();
                  signOut({
                    callbackUrl: `${window.location.origin}/`,
                  });
                }}
              >
                <div className="flex w-full px-2.5 py-2 items-center gap-3">
                  <LogOut className="size-4" />
                  <p className="text-sm">Log out </p>
                </div>
              </li>
            </ul>
          </Drawer.Content>
          <Drawer.Overlay />
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{ name: user.name || null, image: user.image || null }}
          className="size-8 border"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex p-2 items-center justify-start gap-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] text-sm text-muted-foreground truncate">
                {user?.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {user.role === "ADMIN" ? (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex space-x-2.5 items-center">
              <Lock className="size-4" />
              <p className="text-sm">Admin</p>
            </Link>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex space-x-2.5 items-center">
            <LayoutDashboard className="size-4" />
            <p className="text-sm">Dashboard</p>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/settings"
            className="flex space-x-2.5 items-center"
          >
            <Settings className="size-4" />
            <p className="text-sm">Settings</p>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/billing"
            className="flex space-x-2.5 items-center"
          >
            <CreditCard className="size-4" />
            <p className="text-sm">Billing</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault();
            signOut({
              callbackUrl: `${window.location.origin}/`,
            });
          }}
        >
          <div className="flex space-x-2.5 items-center">
            <LogOut className="size-4" />
            <p className="text-sm">Log out </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}