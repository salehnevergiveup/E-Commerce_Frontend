import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import NavbarCartComponent from "@/components/navbar-cart";
import {Logout, Bell, User, ListIcon, ShoppingBag, Wallet, History } from 'lucide-react';
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
import * as signalR from "@microsoft/signalr";
import { useState, useEffect } from "react";
import {
  startConnection,
  subscribeToEvent,
  stopConnection,
} from "@/services/websocket/websocket-service";
import ProfileMenu from "@/components/profile-menu";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [loginDialogOpen, setLoginDialogOpen] = React.useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = React.useState(false);
  const [notifications, setNotifications] = useState([]); // State to store notifications
  const [connection, setConnection] = useState(null); // State for the SignalR connection

  const { isAuthenticated, user, loading, logout } = useAuth(); // Access AuthContext

  // Establish the SignalR connection
  useEffect(() => {
    if (isAuthenticated) {
      // Start connection to the notification hub
      const connection = startConnection("notificationHub");

      if (connection) {
        // Subscribe to the "ReceiveListofLatestNotification" event
        subscribeToEvent(
          "notificationHub",
          "ReceiveListofLatestNotification",
          (unreadNotifications) => {
            // Debugging: Print each notification object line by line
            unreadNotifications.forEach((notification, index) => {
              console.log(`Notification ${index + 1}:`, notification);
            });

            const processedNotifications = unreadNotifications.map(
              (notification) => ({
                id: notification.notificationId || 0,
                title: notification.title || "No title",
                messageText: notification.messageText || "No message",
                createdAt: notification.createdAt || new Date(),
              })
            );

            // Set new notifications, ensuring no duplicates
            setNotifications((prevNotifications) => {
              const uniqueNotifications = [
                ...prevNotifications.reverse(),
                ...processedNotifications.filter(
                  (newNotification) =>
                    !prevNotifications.some(
                      (existingNotification) =>
                        existingNotification.id === newNotification.id
                    )
                ),
              ];
              return uniqueNotifications;
            });
          }
        );

        // Subscribe to the "ReceiveNotification" event for individual notifications
        subscribeToEvent(
          "notificationHub",
          "ReceiveNotification",
          (notification) => {
            setNotifications((prevNotifications) => [
              notification,
              ...prevNotifications,
            ]);
          }
        );
      }

      // Cleanup function to stop the connection when the component is unmounted or user logs out
      return () => {
        stopConnection("notificationHub");
      };
    }
  }, [isAuthenticated]);

  const openLoginDialog = () => {
    setLoginDialogOpen(true); // Open the login dialog
    setRegisterDialogOpen(false); // Close the register dialog
  };

  const openRegisterDialog = () => {
    setLoginDialogOpen(false); // Close the login dialog
    setRegisterDialogOpen(true); // Open the register dialog
  };

  const handleNotificationClick = (notificationId) => {
    // Redirect to the notification detail page
    router.push(`/notifications/${notificationId}`);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            Potato-Trade
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <>
              <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
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

          {/* Elements Visible Only When Authenticated */}
          {isAuthenticated && (
            <>
              <NavbarCartComponent />

              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-600 text-[10px] font-medium text-white flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white dark:bg-gray-900"
                  style={{ minWidth: "auto", maxWidth: "none", width: "auto" }}
                >
                  <DropdownMenuLabel className="text-gray-900 dark:text-white">
                    Notifications
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <React.Fragment key={index}>
                        <DropdownMenuItem
                          className="text-gray-700 dark:text-gray-200"
                          onClick={() =>
                            handleNotificationClick(notification.id)
                          }
                        >
                          <div className="flex flex-col w-full truncate">
                            {/* Title and Timestamp Container */}
                            <div className="flex justify-between items-center w-full truncate">
                              {/* Title */}
                              <strong className="text-base truncate">
                                {notification.title}
                              </strong>
                              {/* Timestamp */}
                              <small className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </small>
                            </div>
                            {/* Message Content */}
                            <span className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {notification.messageText.length > 55
                                ? `${notification.messageText.slice(0, 55)}...`
                                : notification.messageText}
                            </span>
                          </div>
                        </DropdownMenuItem>

                        {/* Divider between notifications */}
                        {index !== notifications.length - 1 && (
                          <DropdownMenuSeparator />
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <DropdownMenuItem className="text-gray-700 dark:text-gray-200">
                      No new notifications
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
    
              <DropdownMenu>
              <ProfileMenu profileLink={"/user/profile"} />
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                  <ListIcon className="mr-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Action Bar</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                  <Link href="/listing/my-listing" className="flex items-center">
                    <User className="h-5 w-5" />
                    <span>My Listings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/all-product" className="flex items-center">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>All Product</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/purchase-order/my-purchase" className="flex items-center">
                      <History className="mr-2 h-4 w-4" />
                      <span>My Purchases</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {loading && (
        <div className="w-full text-center p-2 bg-gray-100">Loading...</div>
      )}
    </header>
  );
}

