"use client";

import {
  AudioWaveform,
  Book,
  BookOpen,
  Bot,
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
import { TeamSwitcher } from "@/components/blocks/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
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
      title: "Accueill",
      url: "#",
      icon: House,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/a/acceuil",
        },
      ],
    },
    {
      title: "Documents",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Créer",
          url: "/a/creer-documents",
        },
        {
          title: "Consulter",
          url: "/a/consulter",
        },
      ],
    },
    {
      title: "Workflow",
      url: "#",
      icon: Workflow,
      items: [
        {
          title: "Créer",
          url: "/a/creer-workflow",
        },
        {
          title: "Consulter",
          url: "/a/consulter-workflow",
        },
      ],
    },
    {
      title: "OCR",
      url: "#",
      icon: ScanEye,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "History",
      url: "#",
      icon: History,
      items: [
        {
          title: "Acitivity Log",
          url: "/a/activity-history",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Cog,
      items: [
        {
          title: "Users",
          url: "/a/users",
        },

        {
          title: "Departments",
          url: "/a/departments",
        },
        {
          title: "Roles",
          url: "/a/roles",
        },
      ],
    },
    {
      title: "Permissions",
      url: "#",
      icon: Lock,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
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
  return (
    <Sidebar collapsible="icon" {...props} className="bg-sidebar-primary">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
