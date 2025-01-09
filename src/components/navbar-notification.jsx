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
    console.log("Component mounted. Is authenticated:", isAuthenticated);
    if (isAuthenticated) {
      const connection = getOrCreateConnection("notificationHub");

      if (connection) {
        console.log("WebSocket connection established.");

        // Subscribe to batch notifications
        subscribeToEvent(
          "notificationHub",
          "ReceiveListofLatestNotification",
          (latestNotifications) => {
            console.log("Received batch notifications:", latestNotifications);
            const processedNotifications = latestNotifications
              .filter((notification) => notification)
              .map((notification) => ({
                id: notification.notificationId,
                title: notification.title,
                messageText: notification.messageText,
                createdAt: notification.createdAt,
                updatedAt: notification.updatedAt,
                isRead:
                  notification.isRead ??
                  (notification.status === "notRead" ? false : true),
                sender: notification.senderUsername,
                status: notification.status,
                type: notification.type,
              }));

            setNotifications(() => {
              console.log(
                "Setting notifications (batch):",
                processedNotifications
              );
              return processedNotifications.slice(0, 5);
            });
          }
        );

        // Subscribe to individual notifications
        const handleNewNotificationBatch = (newNotifications) => {
          console.log(
            "Debug: Raw new notifications received:",
            newNotifications
          );

          if (newNotifications && newNotifications.length > 0) {
            console.log("Received new notifications:", newNotifications);

            const processedNewNotifications = newNotifications
              .filter((notification) => notification)
              .map((notification) => {
                console.log("Debug: Processing notification:", {
                  notificationId: notification.notificationId,
                  title: notification.title,
                  messageText: notification.messageText,
                  createdAt: notification.createdAt,
                  updatedAt: notification.updatedAt,
                  senderUsername: notification.senderUsername,
                });

                return {
                  id: notification.notificationId || 0,
                  title: notification.title || notification.type || "No Title",
                  messageText: notification.messageText || "No Content",
                  createdAt: notification.createdAt || new Date().toISOString(),
                  updatedAt: notification.updatedAt || null,
                  isRead:
                    notification.isRead ??
                    (notification.status === "notRead" ? false : true),
                  sender: notification.senderUsername || "Unknown Sender",
                  status: notification.status || "unknown",
                  type: notification.type || "unknown",
                };
              });

            console.log(
              "Debug: Processed new notifications:",
              processedNewNotifications
            );

            setNotifications((prevNotifications) => {
              const updatedNotifications = [
                ...processedNewNotifications,
                ...prevNotifications.filter(
                  (prevNotification) =>
                    !processedNewNotifications.some(
                      (newNotification) =>
                        newNotification.id === prevNotification.id
                    )
                ),
              ];
              console.log(
                "Setting notifications (individual):",
                updatedNotifications
              );
              return updatedNotifications.slice(0, 5);
            });
          }
        };

        subscribeToEvent(
          "notificationHub",
          "ReceiveNotification",
          (notifications) => handleNewNotificationBatch([notifications])
        );

        subscribeToEvent(
          "notificationHub",
          "ReceivePurchasedNotification",
          (notifications) => handleNewNotificationBatch([notifications])
        );
      }

      return () => {
        if (connection) {
          console.log("Stopping WebSocket connection.");
          stopConnection("notificationHub");
        }
      };
    }
  }, [isAuthenticated]);

  console.log("Calculating unreadCount. Notifications state:", notifications);
  const unreadCount = notifications.filter((n) => {
    console.log(
      `Notification ID ${n.id}: isRead = ${n.isRead}, status = ${n.status}`
    );
    return !n.isRead || n.status === "notRead";
  }).length;
  console.log("Updated unreadCount:", unreadCount);

  useEffect(() => {
    console.log("Notifications state updated:", notifications);
    console.log("Unread count recalculated:", unreadCount);
  }, [notifications]);

  console.log("Rendering NotificationsDropdown. Unread count:", unreadCount);

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
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900">
        <DropdownMenuLabel className="text-gray-900 dark:text-white">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <React.Fragment key={index}>
              <DropdownMenuItem
                className={`text-gray-700 dark:text-gray-200 ${
                  notification.isRead || notification.status === "Read"
                    ? "bg-white"
                    : "bg-orange-100"
                } hover:bg-gray-100`}
                onClick={() => {
                  router.push("/user/profile?tab=notifications");
                }}
              >
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-start w-full">
                    <strong className="text-base truncate mr-10">
                      {notification.title}
                    </strong>
                    <div className="flex flex-col items-end ml-auto text-xs text-gray-500">
                      <span className="whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      <span className="text-[10px] italic">
                        Sent By: {notification.sender}
                      </span>
                    </div>
                  </div>
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
