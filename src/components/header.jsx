import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import NavbarCartComponent from "@/components/navbar-cart";
import NotificationsDropdown from "@/components/navbar-notification";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import ProfileMenu from "@/components/profile-menu";
import LoginForm from "@/components/login-form";
import RegisterForm from "@/components/register-form";
import { useAuth } from "@/contexts/auth-context"; // Import useAuth

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [loginDialogOpen, setLoginDialogOpen] = React.useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = React.useState(false);

  const router = useRouter();

  const { isAuthenticated, user, loading, logout } = useAuth(); // Access AuthContext

  // Function to open the login dialog and close the register dialog
  const openLoginDialog = () => {
    setLoginDialogOpen(true); // Open the login dialog
    setRegisterDialogOpen(false); // Close the register dialog
  };

  // Function to open the register dialog and close the login dialog
  const openRegisterDialog = () => {
    setLoginDialogOpen(false); // Close the login dialog
    setRegisterDialogOpen(true); // Open the register dialog
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
          {isAuthenticated ? (
            <>
              <NavbarCartComponent />
              <NotificationsDropdown isAuthenticated={isAuthenticated} />
              <ProfileMenu profileLink={"/user/profile"} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* Elements Visible Only When Not Authenticated */}
              {!isAuthenticated && (
                <>
                  {/* Login Dialog */}
                  <Dialog
                    open={loginDialogOpen}
                    onOpenChange={setLoginDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost">Login</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md p-0 bg-transparent shadow-none border-none">
                      <LoginForm
                        onClose={() => setLoginDialogOpen(false)} // Function to close login dialog
                        openRegisterDialog={openRegisterDialog} // Function to open register dialog
                      />
                    </DialogContent>
                  </Dialog>

                  {/* Register Dialog */}
                  <Dialog
                    open={registerDialogOpen}
                    onOpenChange={setRegisterDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost">Register</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md p-0 bg-transparent shadow-none border-none">
                      <RegisterForm
                        onClose={() => setRegisterDialogOpen(false)} // Function to close register dialog
                        openLoginDialog={openLoginDialog} // Function to open login dialog
                      />
                    </DialogContent>
                  </Dialog>

                  {/* Trade Now Button */}
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Trade Now
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="w-full text-center p-2 bg-gray-100">Loading...</div>
      )}
    </header>
  );
}
