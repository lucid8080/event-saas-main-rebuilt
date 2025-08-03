"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarNavItem } from "@/types";
import { Menu, X, Zap } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icons } from "@/components/shared/icons";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { UserAccountNav } from "@/components/layout/user-account-nav";

interface TopNavbarProps {
  links: SidebarNavItem[];
  userCredits?: number;
}

export function TopNavbar({ links, userCredits = 0 }: TopNavbarProps) {
  const path = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="sticky w-full bg-background/95 border-b top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 px-4 mx-auto lg:h-[60px] xl:px-8 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex text-lg items-center gap-2 font-semibold"
            >
              <Icons.logo className="size-6" />
              <span className="text-xl font-urban font-bold">
                {siteConfig.name}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {links.map((section) => (
              <div key={section.title} className="flex items-center gap-1">
                {section.items.map((item) => {
                  const Icon = Icons[item.icon || "arrowRight"];
                  return (
                    item.href && (
                      <Tooltip key={`tooltip-${item.title}`}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.disabled ? "#" : item.href}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                              path === item.href
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground",
                              item.disabled &&
                                "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground",
                            )}
                          >
                            <Icon className="size-4" />
                            <span className="hidden lg:inline">{item.title}</span>
                            {item.badge && (
                              <Badge className="flex size-5 ml-1 text-xs rounded-full shrink-0 items-center justify-center">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  );
                })}
              </div>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            {/* Credits Display - Desktop */}
            <div className="hidden px-3 py-1.5 bg-gradient-to-r rounded-lg dark:from-purple-950/50 dark:to-blue-950/50 md:flex items-center gap-2 border from-purple-50 to-blue-50">
              <Zap className="size-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Credits:</span>
              <span className={cn(
                "text-sm font-bold",
                userCredits > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {userCredits}
              </span>
            </div>

            {/* Mode Toggle */}
            <ModeToggle />

            {/* User Account Nav */}
            <UserAccountNav />

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0"
                  >
                    <Menu className="size-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col p-0">
                  <div className="flex flex-col h-screen">
                    <div className="flex p-6 border-b items-center justify-between">
                      <Link
                        href="/"
                        className="flex text-lg items-center gap-2 font-semibold"
                      >
                        <Icons.logo className="size-6" />
                        <span className="text-xl font-urban font-bold">
                          {siteConfig.name}
                        </span>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <X className="size-5" />
                      </Button>
                    </div>

                    {/* Mobile Credits Display */}
                    <div className="flex px-3 py-2 mx-6 my-4 bg-gradient-to-r rounded-lg dark:from-purple-950/50 dark:to-blue-950/50 items-center justify-center gap-2 border from-purple-50 to-blue-50">
                      <Zap className="size-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Credits:</span>
                      <span className={cn(
                        "text-sm font-bold",
                        userCredits > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {userCredits}
                      </span>
                    </div>

                    <nav className="flex flex-1 flex-col p-6 gap-y-4">
                      {links.map((section) => (
                        <section
                          key={section.title}
                          className="flex flex-col gap-1"
                        >
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            {section.title}
                          </p>
                          <div className="flex flex-col gap-1">
                            {section.items.map((item) => {
                              const Icon = Icons[item.icon || "arrowRight"];
                              return (
                                item.href && (
                                  <Link
                                    key={`mobile-link-${item.title}`}
                                    onClick={() => {
                                      if (!item.disabled) setIsMobileMenuOpen(false);
                                    }}
                                    href={item.disabled ? "#" : item.href}
                                    className={cn(
                                      "flex items-center gap-3 rounded-md p-3 text-sm font-medium transition-colors hover:bg-muted",
                                      path === item.href
                                        ? "bg-muted text-foreground"
                                        : "text-muted-foreground hover:text-foreground",
                                      item.disabled &&
                                        "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground",
                                    )}
                                  >
                                    <Icon className="size-5" />
                                    <span>{item.title}</span>
                                    {item.badge && (
                                      <Badge className="flex size-5 ml-auto text-xs rounded-full shrink-0 items-center justify-center">
                                        {item.badge}
                                      </Badge>
                                    )}
                                  </Link>
                                )
                              );
                            })}
                          </div>
                        </section>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
} 