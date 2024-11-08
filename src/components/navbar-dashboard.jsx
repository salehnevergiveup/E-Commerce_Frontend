// components/Layout.js

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context"; // Import useAuth
import ProfileMenu from "@/components/profile-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import {
  LogOut,
  Menu,
  Bell,
  User,
} from "lucide-react";

const Navbar = ({ setIsCollapsed, isCollapsed }) => {

  const {logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex">
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-600 text-[10px] font-medium text-white flex items-center justify-center">3</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px] bg-white dark:bg-gray-900">
            <DropdownMenuLabel className="text-gray-900 dark:text-white">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-gray-700 dark:text-gray-200">New user registration</DropdownMenuItem>
            <DropdownMenuItem className="text-gray-700 dark:text-gray-200">New order received</DropdownMenuItem>
            <DropdownMenuItem className="text-gray-700 dark:text-gray-200">System update available</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <ProfileMenu profileLink={'/admin/profile'} />
      </div>
    </header>
  );
};

export default Navbar;