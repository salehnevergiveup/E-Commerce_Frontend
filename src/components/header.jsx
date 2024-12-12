import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import NavbarCartComponent from "@/components/navbar-cart";
import ProfileMenu from "@/components/profile-menu";
import { LogOut, Bell, User } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
import sendRequest from "@/services/requests/request-service"; // Adjust the import path as needed
import RequestMethods from "@/enums/request-methods";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [loginDialogOpen, setLoginDialogOpen] = React.useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = React.useState(false);
  const [notifications, setNotifications] = useState([]); // State to store notifications
  const [connection, setConnection] = useState(null); // State for the SignalR connection
  const router = useRouter();

  const { isAuthenticated, user, loading, logout } = useAuth(); // Access AuthContext

  // Establish the SignalR connection
  useEffect(() => {
    if (isAuthenticated) {
      // Start connection to the notification hub
      const connection = startConnection("notificationHub");

      if (connection) {
        // Subscribe to the "ReceiveListofLatestNotification" event
        console.log("SignalR connection established.");
        subscribeToEvent(
          "notificationHub",
          "ReceiveListofLatestNotification",
          (lastestNotifications) => {
            console.log("Event triggered: ReceiveListofLatestNotification");
            console.log("Latest notifications received:", lastestNotifications);
            // Filter out null or undefined notifications
            const validNotifications = lastestNotifications.filter(
              (notification) =>
                notification !== null && notification !== undefined
            );

            validNotifications.forEach((notification, index) => {
              console.log(`Notification ${index + 1}:`, notification);
            });

            const processedNotifications = validNotifications.map(
              (notification) => ({
                id: notification.notificationId,
                title: notification.title,
                messageText: notification.messageText,
                updatedAt: notification.updatedAt,
                isRead: notification.isRead,
              })
            );

            setNotifications(
              () => processedNotifications.slice(0, 5) // Ensure only 5 latest notifications
            );
            console.log(
              "Updated notifications state:",
              processedNotifications.slice(0, 5)
            );
          }
        );

        // Subscribe to the "ReceiveNotification" event for individual notifications
        subscribeToEvent(
          "notificationHub",
          "ReceiveNotification",
          (notification) => {
            if (notification) {
              // Ensure notification is valid
              const newNotification = {
                id: notification.notificationId,
                title: notification.title,
                messageText: notification.messageText,
                updatedAt: notification.updatedAt,
                isRead: notification.isRead,
              };
              console.log("New notification received:", notification);

              // Add the new notification and trim the list to 5
              setNotifications((prevNotifications) => {
                const updatedNotifications = [
                  newNotification,
                  ...prevNotifications,
                ];
                return updatedNotifications.slice(0, 5); // Ensure only 5 latest notifications
              });
            }
          }
        );
      }

      // Cleanup function to stop the connection when the component is unmounted or user logs out
      return () => {
        stopConnection("notificationHub");
      };
    }
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      const response = await sendRequest(
        RequestMethods.PUT,
        `/notifications/users/update_notifications`,
        null,
        true
      );
      console.log(JSON.stringify(response));
      if (response.success) {
        console.log("marked as read successfully");
      } else {
        console.error("Failed to mark as read:", JSON.stringify(response));
      }
    } catch (error) {
      console.error("Error, Failed to mark as read:", error);
    }
  };

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
              {/* Navbar Cart Component */}
              <NavbarCartComponent />

              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={markAllAsRead}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-600 text-[10px] font-medium text-white flex items-center justify-center">
                        {unreadCount}
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
                          className={`text-gray-700 dark:text-gray-200 ${
                            notification.isRead ? "bg-white" : "bg-orange-100"
                          } hover:bg-gray-100`}
                          onClick={() => {
                            // Handle individual notification click
                            router.push(`/user/profile?tab=notifications`);
                          }}
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
                                  notification.updatedAt
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

              {/* User Profile Dropdown */}
              <ProfileMenu profileLink={"/user/profile"} />
            </>
          )}
        </div>
      </div>

      {/* Optional: Show a loading indicator while authentication state is being determined */}
      {loading && (
        <div className="w-full text-center p-2 bg-gray-100">Loading...</div>
      )}
    </header>
  );
}
