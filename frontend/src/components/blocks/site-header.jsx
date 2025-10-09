import React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useLocation } from "react-router-dom";

// Map URL prefixes to sidebar section titles based on your navigation
const sectionMap = [
  { prefix: "/a/acceuil", title: "Accueil" },

  // Documents section
  { prefix: "/a/documents", title: "Documents" },
  { prefix: "/a/genesis", title: "Documents" },
  { prefix: "/a/explorer", title: "Documents" },
  { prefix: "/a/quantum", title: "Documents" },

  // Workflow section
  { prefix: "/a/workflow", title: "Workflow" },
  { prefix: "/a/introduction", title: "Workflow" },
  { prefix: "/a/get-started", title: "Workflow" },
  { prefix: "/a/tutorials", title: "Workflow" },
  { prefix: "/a/changelog", title: "Workflow" },

  // OCR section
  { prefix: "/a/ocr", title: "OCR" },
  { prefix: "/a/scan", title: "OCR" },

  // History section
  { prefix: "/a/history", title: "History" },
  { prefix: "/a/general", title: "History" },
  { prefix: "/a/team", title: "History" },

  // User management section
  { prefix: "/a/users", title: "User Management" },
  { prefix: "/a/user-management", title: "User Management" },

  // Permissions section
  { prefix: "/a/permissions", title: "Permissions" },
  { prefix: "/a/roles", title: "Permissions" },
];

function getSectionForPath(pathname) {
  if (!pathname?.startsWith("/a")) return null;
  // Choose the longest matching prefix for specificity
  const match = sectionMap
    .filter((s) => pathname.startsWith(s.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return match || null;
}

function getAdminBreadcrumbs(pathname) {
  if (!pathname) return [];

  // Only handle /a/* routes
  if (!pathname.startsWith("/a")) return [];

  const crumbs = [
    {
      label: "Dashboard",
      to: "/a/acceuil",
    },
  ];

  // Get the section for this path
  const section = getSectionForPath(pathname);
  if (section) {
    crumbs.push({
      label: section.title,
      to: section.prefix,
      isCurrent: pathname === section.prefix,
    });
  }

  // If we have a specific page that's not the section root, add it
  if (section && pathname !== section.prefix) {
    // Extract the page name from the URL
    const pathSegments = pathname.split("/");
    const pageName = pathSegments[pathSegments.length - 1];

    // Capitalize and format the page name
    const formattedPageName = pageName
      .replace(/([A-Z])/g, " $1") // Add space before capitals
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();

    crumbs.push({
      label: formattedPageName,
      to: pathname,
      isCurrent: true,
    });
  }

  return crumbs;
}

export function SiteHeader() {
  const location = useLocation();
  const breadcrumbs = getAdminBreadcrumbs(location.pathname);
  return (
    <header className="dark:bg- bg-white border-border flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.to}>
                <BreadcrumbItem>
                  {crumb.isCurrent ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.to}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          {/* <LanguageToggler />
          <ModeToggle /> */}
        </div>
      </div>
    </header>
  );
}
