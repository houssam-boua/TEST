"use client";

import React, { useContext } from "react";
import { AuthContext } from "@/Context/AuthContextDefinition";

import {
  AudioWaveform,
  Book,
  BookOpen,
  Bot,
  CircleDotDashed,
  Cog,
  Command,
  FileClock,
  FileText,
  Frame,
  GalleryVerticalEnd,
  History,
  House,
  Lock,
  Map,
  PieChart,
  ScanEye,
  Settings2,
  SquareTerminal,
  UserRoundCog,
  Workflow,
} from "lucide-react";

import { NavMain } from "@/components/blocks/nav-main";
import { NavProjects } from "@/components/blocks/nav-projects";
import { NavUser } from "@/components/blocks/nav-user";
// logo/header will use Avatarr component instead of the TeamSwitcher
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatarr } from "./avatarr";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: <Avatarr name="shadcn" size={32} />,
  },
  teams: [
    {
      name: "Manager Area",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "#",
      icon: House,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/acceuil",
        },
      ],
    },
    {
      title: "Documents",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "New",
          url: "/creer-documents",
        },
        {
          title: "Consulter",
          url: "/consulter",
        },
      ],
    },
    {
      title: "Workflow",
      url: "#",
      icon: Workflow,
      items: [
        {
          title: "New",
          url: "/creer-workflow",
        },
        {
          title: "Consulter",
          url: "/consulter-workflow",
        },
      ],
    },
    // {
    //   title: "OCR",
    //   url: "#",
    //   icon: ScanEye,
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
    {
      title: "History",
      url: "#",
      icon: History,
      items: [
        {
          title: "Acitivity Log",
          url: "/activity-history",
        },
        // {
        //   title: "Team",
        //   url: "#",
        // },
        // {
        //   title: "Billing",
        //   url: "#",
        // },
        // {
        //   title: "Limits",
        //   url: "#",
        // },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Cog,
      // show settings only to admins by default
      requiredRoles: ["admin"],
      items: [
        {
          title: "Users",
          url: "/users",
          requiredRoles: ["admin"],
        },

        {
          title: "Departments",
          url: "/departments",
          requiredRoles: ["admin"],
        },
        {
          title: "Roles",
          url: "/roles",
          requiredRoles: ["admin"],
        },
        {
          title: "Permissions",
          url: "/permissions",
          requiredRoles: ["admin"],
        },
        {
          title: "Permission Groups",
          url: "/permission-groups",
          requiredRoles: ["admin"],
        },
      ],
    },
    {
      title: "Visual Standard",
      url: 'https://mps-partners.mlean.com/visual-standards/overview',
      icon: CircleDotDashed,
      
      // show admin only to admins by default
    },
    // {
    //   title: "Permissions",
    //   url: "#",
    //   icon: Lock,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#",
    //     },
    //     {
    //       title: "Team",
    //       url: "#",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
};

const AppSidebar = ({ ...props }) => {
  // runtime role/permission filtering
  const auth = useContext(AuthContext) || {};

  const { hasRole, hasPermission } = auth;

  // helper to check requiredRoles/requiredPermissions
  const allowed = (entry) => {
    if (!entry) return false;
    if (entry.requiredRoles && typeof hasRole === "function") {
      const req = Array.isArray(entry.requiredRoles)
        ? entry.requiredRoles
        : [entry.requiredRoles];
      // allow if any role matches
      if (!req.some((r) => hasRole(r))) return false;
    }
    if (entry.requiredPermissions && typeof hasPermission === "function") {
      const req = Array.isArray(entry.requiredPermissions)
        ? entry.requiredPermissions
        : [entry.requiredPermissions];
      if (!req.some((p) => hasPermission(p))) return false;
    }
    return true;
  };

  // walk and filter nav items and their children
  const filteredNav = data.navMain
    .map((n) => {
      if (!allowed(n)) return null;
      if (Array.isArray(n.items)) {
        const items = n.items.filter((it) => allowed(it));
        // if parent had items filtered out completely and no url, drop parent
        if (!items.length && !n.url) return null;
        return { ...n, items };
      }
      return n;
    })
    .filter(Boolean);

  return (
    <Sidebar collapsible="icon" {...props} className="bg-sidebar-primary">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-2">
          <img src="/full-logo-primary.svg" alt="Docarea Logo" className="" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNav} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
