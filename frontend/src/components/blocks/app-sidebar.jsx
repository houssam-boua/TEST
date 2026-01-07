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
  ListTodo, // ✅ Icon for My Tasks
} from "lucide-react";

import { NavMain } from "@/components/blocks/nav-main";
import { NavProjects } from "@/components/blocks/nav-projects";
import { NavUser } from "@/components/blocks/nav-user";
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
          // Visible to everyone
        },
        {
          title: "Consulter",
          url: "/consulter",
          // Visible to everyone
        },
        {
          title: "Metadata",
          url: "/metadata",
          requiredRoles: ["admin"], // ✅ Only Admin
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
          requiredRoles: ["admin"], // ✅ Only Admin
        },
        {
          title: "All Workflows",
          url: "/consulter-workflow",
          requiredRoles: ["admin"], // ✅ Only Admin
        },
        {
          title: "My Tasks", // ✅ Personal task view
          url: "/my-tasks",
          // Visible to everyone
        },
      ],
    },
    {
      title: "History",
      url: "#",
      icon: History,
      requiredRoles: ["admin"], // ✅ Only Admin can see History
      items: [
        {
          title: "Activity Log",
          url: "/activity-history",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Cog,
      requiredRoles: ["admin"], // ✅ Only Admin can see Settings
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
        // ❌ REMOVED: Permissions
        // ❌ REMOVED: Permission Groups
      ],
    },
    {
      title: "Visual Standard",
      url: "https://mps-partners.mlean.com/visual-standards/overview",
      icon: CircleDotDashed,
    },
  ],
};

const AppSidebar = ({ ...props }) => {
  // runtime role/permission filtering
  const auth = useContext(AuthContext) || {};

  const { hasRole, hasPermission } = auth;

  // helper to check requiredRoles/requiredPermissions
  const allowed = (entry) => {
    if (!entry) return false;
    
    // Check Roles
    if (entry.requiredRoles && typeof hasRole === "function") {
      const req = Array.isArray(entry.requiredRoles)
        ? entry.requiredRoles
        : [entry.requiredRoles];
      // allow if any role matches
      if (!req.some((r) => hasRole(r))) return false;
    }
    
    // Check Permissions
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
        {/* <NavProjects projects={data.teams} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;