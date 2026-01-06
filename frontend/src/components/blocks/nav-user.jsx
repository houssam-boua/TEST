"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useContext } from "react";
import { AuthContext } from "@/Context/AuthContextDefinition";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({ user: userProp }) {
  const { isMobile } = useSidebar();
  const auth = useContext(AuthContext);

  // 1. Keep your existing User Logic
  const user =
    userProp ||
    (auth?.user
      ? {
          name: auth.getUserDisplayName
            ? auth.getUserDisplayName()
            : auth.username || auth.user.username,
          email: auth.email || auth.user.email,
          avatar: auth.user?.avatar || undefined,
          initials: auth.getUserInitials ? auth.getUserInitials() : undefined,
        }
      : { name: "Unknown", email: "", avatar: undefined, initials: "U" });

  const handleLogout = async () => {
    try {
      if (auth?.logout) {
        await auth.logout();
      } else {
        localStorage.removeItem("authToken");
        window.location.reload();
      }
    } catch (err) {
      console.error("Logout failed", err);
      window.location.reload();
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              // ✨ UPDATED: The Blue/Tech Theme Styles
              className="data-[state=open]:bg-blue-900/20 data-[state=open]:text-white hover:bg-blue-900/10 text-slate-300"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-blue-800/50">
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback className="rounded-lg bg-blue-950 text-blue-200 font-bold">
                    {user?.initials ??
                      (user?.name ? user.name.charAt(0).toUpperCase() : "U")}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white">{user.name}</span>
                <span className="truncate text-xs text-blue-300/70">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-blue-400/70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {/* ✨ UPDATED: The Dropdown Content Styles (Dark Mode / Blue Border) */}
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-slate-900 border border-blue-900/50 text-white shadow-xl shadow-blue-950/50"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg border border-blue-800/50">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback className="rounded-lg bg-blue-950 text-blue-200">
                      {user?.initials ??
                        (user?.name ? user.name.charAt(0).toUpperCase() : "U")}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-blue-300/70">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-blue-900/30" />
            
            <DropdownMenuGroup>
              <DropdownMenuItem className="focus:bg-blue-900/30 focus:text-white cursor-pointer hover:bg-blue-900/20 text-slate-300">
                <User className="mr-2 h-4 w-4 text-blue-400" />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="bg-blue-900/30" />
            
            <DropdownMenuGroup>
              <DropdownMenuItem className="focus:bg-blue-900/30 focus:text-white cursor-pointer hover:bg-blue-900/20 text-slate-300">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-blue-900/30 focus:text-white cursor-pointer hover:bg-blue-900/20 text-slate-300">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="bg-blue-900/30" />
            
            <DropdownMenuItem 
              onClick={handleLogout}
              className="focus:bg-red-900/30 focus:text-red-300 text-red-400 cursor-pointer hover:bg-red-900/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}