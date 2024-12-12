// components/Layout.js
"use client"; // Ensure this is a Client Component

import * as React from "react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar-dashboard";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import AuthGuard from '@/components/auth-guard'; // Import AdminGuard

const AdminLayoutComponent = ({ children }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-800">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} pathname={pathname} />
      <main className={cn("flex-1 transition-all duration-300 bg-gray-100 dark:bg-gray-800", "lg:ml-64", isCollapsed && "lg:ml-16")}>
        <Navbar setIsCollapsed={setIsCollapsed} isCollapsed={isCollapsed} />
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
};

// Wrap the Layout component with AdminGuard
const Layout = AuthGuard(AdminLayoutComponent,  { allowedRoles: [ 'admin','superadmin'] });

export default Layout;
