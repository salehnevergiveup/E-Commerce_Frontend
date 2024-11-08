import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import NavbarCartComponent from "@/components/navbar-cart";
import ProfileMenu from "@/components/profile-menu";
import {
  LogOut,
  Bell,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoginForm from "@/components/login-form";
import RegisterForm from "@/components/register-form";
import { useAuth } from "@/contexts/auth-context"; // Import useAuth

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [loginDialogOpen, setLoginDialogOpen] = React.useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = React.useState(false);
  
  const { isAuthenticated, user, loading, logout } = useAuth(); // Access AuthContext

  // Function to open the login dialog and close the register dialog
  const openLoginDialog = () => {
    setLoginDialogOpen(true);     // Open the login dialog
    setRegisterDialogOpen(false); // Close the register dialog
  };

  // Function to open the register dialog and close the login dialog
  const openRegisterDialog = () => {
    setLoginDialogOpen(false);    // Close the login dialog
    setRegisterDialogOpen(true);  // Open the register dialog
  };

  // Function to handle logout
  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
  };

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left Side */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            Potato-Trade
          </Link>
          <div className="hidden lg:block">
            <Button variant="ghost" size="sm">
              All Categories
            </Button>
          </div>
        </div>
        
        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Elements Visible Only When Not Authenticated */}
          {!isAuthenticated && (
            <>
              {/* Login Dialog */}
              <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost">Login</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md p-0 bg-transparent shadow-none border-none">
                  <LoginForm
                    onClose={() => setLoginDialogOpen(false)}         // Function to close login dialog
                    openRegisterDialog={openRegisterDialog}           // Function to open register dialog
                  />
                </DialogContent>
              </Dialog>
    
              {/* Register Dialog */}
              <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost">Register</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md p-0 bg-transparent shadow-none border-none">
                  <RegisterForm
                    onClose={() => setRegisterDialogOpen(false)}      // Function to close register dialog
                    openLoginDialog={openLoginDialog}                 // Function to open login dialog
                  />
                </DialogContent>
              </Dialog>
    
              {/* Trade Now Button */}
              <Button className="bg-orange-600 hover:bg-orange-700">
                Trade Now
              </Button>
            </>
          )}
          
          {/* Elements Visible Only When Authenticated */}
          {isAuthenticated && (
            <>
              {/* Navbar Cart Component */}
              <NavbarCartComponent />
    
              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {/* Example: Displaying the number of notifications */}
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
    
              {/* User Profile Dropdown */}
              <ProfileMenu profileLink={'/user/profile'} />

             
            </>
          )}
        </div>
      </div>
      
      {/* Optional: Show a loading indicator while authentication state is being determined */}
      {loading && (
        <div className="w-full text-center p-2 bg-gray-100">
          Loading...
        </div>
      )}
    </header>
  );
}
