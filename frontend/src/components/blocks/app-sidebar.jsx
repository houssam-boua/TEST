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
          title: "New",
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
          title: "New",
          url: "/a/creer-workflow",
        },
        {
          title: "Consulter",
          url: "/a/consulter-workflow",
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
          url: "/a/activity-history",
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
        {
          title: "Permissions",
          url: "/a/permissions",
        },
        {
          title: "Permission Groups",
          url: "/a/permission-groups",
        },
      ],
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
  return (
    <Sidebar collapsible="icon" {...props} className="bg-sidebar-primary">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-2">
        <img src="/full-logo-primary.svg" alt="Docarea Logo" className=""/>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
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
