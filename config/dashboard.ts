import { UserRole } from "@prisma/client";

import { SidebarNavItem } from "types";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "MENU",
    items: [
      {
        href: "/admin",
        icon: "laptop",
        title: "Admin Panel",
        authorizeOnly: [UserRole.ADMIN, UserRole.HERO],
      },
      {
        href: "/admin/blog",
        icon: "bookOpen",
        title: "Blog Posts",
        authorizeOnly: [UserRole.ADMIN, UserRole.HERO],
      },
      { href: "/dashboard", icon: "image", title: "Event Generator" },
      { href: "/carousel-maker", icon: "media", title: "Carousel Maker" },
      { href: "/gallery", icon: "dashboard", title: "Gallery" },
      { href: "/calendar", icon: "calendar", title: "Calendar" },
    ],
  },
  // {
  //   title: "OPTIONS",
  //   items: [
  //     { href: "/", icon: "home", title: "Homepage" },
  //   ],
  // },
];