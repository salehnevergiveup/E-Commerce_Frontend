// components/Sidebar.js

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/contexts/auth-context';
import Roles from "@/enums/users";
import Permissions from "@/enums/permission";

import {
  ChevronRight,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Package,
  DollarSign,
  LogOut,
  ShoppingBag,
  ShoppingCart,
  File,
} from "lucide-react";


// Updated navItems with roles and permissions
const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: [Roles.SUPER_ADMIN, Roles.ADMIN, Roles.USER],
    permissions: [Permissions.CAN_VIEW],
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
    roles: [Roles.SUPER_ADMIN],
    permissions: [Permissions.CAN_VIEW],
  },
  {
    title: "Roles",
    href: "/admin/roles",
    icon: <ShieldCheck className="h-5 w-5" />,
    roles: [Roles.SUPER_ADMIN],
    permissions: [Permissions.CAN_VIEW, Permissions.CAN_EDIT, Permissions.CAN_DELETE, Permissions.CAN_CREATE],
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: <Package className="h-5 w-5" />,
    roles: [Roles.SUPER_ADMIN, Roles.ADMIN],
    permissions: [Permissions.CAN_VIEW],
  },
  {
    title: "Sales",
    href: "/admin/sales",
    icon: <DollarSign className="h-5 w-5" />,
    roles: [Roles.SUPER_ADMIN, Roles.ADMIN, Roles.USER],
    permissions: [Permissions.CAN_VIEW],
  },
  {
    title: "Shopping Cart",
    href: "/admin/carts",
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: [Roles.SUPER_ADMIN, Roles.ADMIN, Roles.USER],
    permissions: [Permissions.CAN_VIEW],
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: <File className="h-5 w-5" />,
    roles: [Roles.SUPER_ADMIN, Roles.ADMIN, Roles.USER],
    permissions: [Permissions.CAN_VIEW],
  },
];

/**
 * Checks if the user's role is included in the required roles for a nav item.
 * @param {string} userRole - The role of the current user.
 * @param {Array<string>} requiredRoles - The roles required to access the nav item.
 * @returns {boolean}
 */
const hasRequiredRole = (userRole, requiredRoles) => {
  if (!requiredRoles || requiredRoles.length === 0) return true; // If no roles specified, allow access
  return requiredRoles.includes(userRole);
};

/**
 * Checks if the user has all the required permissions for a nav item.
 * @param {Object} userPermissions - The permissions of the current user.
 * @param {Array<string>} requiredPermissions - The permissions required to access the nav item.
 * @returns {boolean}
 */
const hasRequiredPermissions = (userPermissions, requiredPermissions) => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true; // If no permissions specified, allow access
  return requiredPermissions.every(permission => userPermissions[permission]);
};

const Sidebar = ({ isCollapsed, setIsCollapsed, pathname }) => {
  const { user, isAuthenticated, logout } = useAuth();

  // Destructure role and permissions from user object
  const userRole = user?.role;
  const userPermissions = user?.permissions;

  // Filter navItems based on user role and permissions
  const filteredNavItems = navItems.filter(item => {
    return hasRequiredRole(userRole, item.roles) && hasRequiredPermissions(userPermissions, item.permissions);
  });

  return (
    <div className={cn("relative hidden h-screen transition-all duration-300 lg:flex", isCollapsed ? "w-16" : "w-64")}>
      <aside className={cn("fixed hidden h-screen overflow-hidden border-r bg-white dark:bg-gray-900 transition-all duration-300 lg:flex", isCollapsed ? "w-16" : "w-64")}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn("flex h-16 items-center border-b px-4", isCollapsed ? "justify-center" : "justify-between")}>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-orange-600" />
              {!isCollapsed && <span className="font-bold text-xl text-orange-600">Potato-Trade</span>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className={cn("h-8 w-8", isCollapsed && "hidden")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="grid gap-1 px-2">
              {filteredNavItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground",
                    pathname === item.href ? "bg-orange-600 text-white dark:bg-orange-600 dark:text-white" : "",
                    isCollapsed ? "justify-center" : ""
                  )}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              ))}
            </nav>
          </ScrollArea>

          {/* Logout Button */}
          <div className="border-t p-4">
            <Button
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-4 py-2 text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 transition-colors duration-200",
                isCollapsed ? "justify-center" : ""
              )}
              onClick={logout} // Call the handleLogout function
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
