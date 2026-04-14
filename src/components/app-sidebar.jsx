"use client";

import * as React from "react";
import {
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMessageCircle,
  IconSearch,
  IconSettings,
  IconUsers,
  IconFileText,
} from "@tabler/icons-react";
import { Folder } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { USER_ROLES } from "@/lib/access";

const navSecondary = [
  { title: "Settings", url: "#", icon: IconSettings },
  { title: "Get Help", url: "#", icon: IconHelp },
  { title: "Search", url: "#", icon: IconSearch },
];

export function AppSidebar({ ...props }) {
  const isAdmin = props?.session?.user?.role === USER_ROLES.ADMIN;

  const navMain = [
    {
      title: "Blog",
      url: "/dashboard/blog",
      icon: IconListDetails,
    },
    {
      title: "Category",
      url: "/dashboard/add-category",
      icon: Folder,
    },
    {
      title: "Add-Blog",
      url: "/dashboard/blog/add",
      icon: IconFileText,
    },
    {
      title: "Comments",
      url: "/dashboard/comments",
      icon: IconMessageCircle,
    },
  ];

  if (isAdmin) {
    navMain.push({
      title: "Users",
      url: "/dashboard/users",
      icon: IconUsers,
    });
  }

  return (
    <Sidebar className="text-gray-950" collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Oyolloo</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={props?.session?.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
