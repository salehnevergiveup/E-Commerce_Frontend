// NotificationsDropdown.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { useRouter } from "next/router";
import {
  getOrCreateConnection,
  subscribeToEvent,
  stopConnection,
} from "@/services/websocket/websocket-service";
import sendRequest from "@/services/requests/request-service"; // Adjust the import path as needed
import RequestMethods from "@/enums/request-methods";

export default function NotificationsDropdown({ isAuthenticated }) {
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      const connection = getOrCreateConnection("notificationHub");

      if (connection) {
        // Subscribe to batch notifications
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
                sender: notification.senderUsername,
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
                sender: notification.senderUsername,
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

      return () => {
        if (connection) {
          stopConnection("notificationHub");
        }
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

      if (response.success) {
        console.log("Marked as read successfully");
      } else {
        console.error("Failed to mark as read:", response);
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
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
                  router.push("/user/profile?tab=notifications");
                }}
              >
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-start w-full">
                    {/* Title on the left */}
                    <strong className="text-base truncate mr-10">
                      {notification.title}
                    </strong>

                    {/* UpdatedAt and Sent By on the right */}
                    <div className="flex flex-col items-end ml-auto text-xs text-gray-500">
                      <span className="whitespace-nowrap">
                        {new Date(notification.updatedAt).toLocaleString()}
                      </span>
                      <span className="text-[10px] italic">
                        Sent By: {notification.sender}
                      </span>
                    </div>
                  </div>
                  {/* Message Text Aligned Left */}
                  <span className="text-sm text-gray-600 dark:text-gray-300 mt-2 text-left">
                    {notification.messageText.length > 55
                      ? `${notification.messageText.slice(0, 55)}...`
                      : notification.messageText}
                  </span>
                </div>
              </DropdownMenuItem>
              {index !== notifications.length - 1 && <DropdownMenuSeparator />}
            </React.Fragment>
          ))
        ) : (
          <DropdownMenuItem className="text-gray-700 dark:text-gray-200">
            No new notifications
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
