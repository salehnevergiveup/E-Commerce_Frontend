// src/pages/admin/notifications/index.jsx

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/layouts/admin-layout";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "react-toastify";
import { sendRequest } from "@/services/requests/request-service";
import RequestMethods from "@/enums/request-methods";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Search } from "lucide-react";

const NotificationsDashboard = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]); // Notifications fetched from backend
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsername, setselectedUsername] = useState(null);
  const [dateRange, setDateRange] = useState({ from: "", to: "" }); // Date range filter

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await sendRequest(
          RequestMethods.GET,
          "notifications/all",
          null,
          true
        );
        if (response.success) {
          setNotifications(response.data);
          console.log(response.data);
        } else {
          setError(response.message || "Failed to fetch notifications.");
        }
      } catch (err) {
        toast.error(err.message || "Failed to fetch notifications.");
        setError(err.message || "Failed to fetch notifications.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  // Filtered notifications based on search term, role, and date range
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.messageText.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUsername =
      selectedUsername === null || notification.senderUsername === selectedRole;

    const matchesDate =
      (!dateRange.from ||
        new Date(notification.createdAt) >= new Date(dateRange.from)) &&
      (!dateRange.to ||
        new Date(notification.createdAt) <= new Date(dateRange.to));

    return matchesSearch && matchesUsername && matchesDate;
  });

  /**
   * Handles the delete button click by deleting a notification.
   * @param {number} notificationId - The ID of the notification to delete.
   */
  const handleDelete = async (notificationId) => {
    try {
      const response = await sendRequest(
        RequestMethods.DELETE,
        `notifications/${notificationId}`,
        null,
        true
      );
      if (response.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success("Notification deleted successfully.");
      } else {
        toast.error(response.message || "Failed to delete notification.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete notification.");
    }
  };

  const getViewedPercentageStyle = (readCount, totalCount) => {
    if (totalCount === 0) return "bg-gray-300 text-gray-800"; // For N/A

    const percentage = (readCount / totalCount) * 100;
    if (percentage <= 50) {
      return "bg-yellow-500 text-white";
    } else {
      return "bg-green-500 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Search Filters</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                placeholder="Search Notifications"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* <Select
                value={selectedUsername}
                onValueChange={setselectedUsername}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="User">System</SelectItem>
                </SelectContent>
              </Select> */}

              <div className="flex items-center space-x-2">
                <Input
                  type="date"
                  placeholder="From"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, from: e.target.value }))
                  }
                />
                <Input
                  type="date"
                  placeholder="To"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, to: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        {/* Header and Broadcast Button */}
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Notifications</h3>
            <Link href="notifications/broadcast">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                Broadcast Message To All Users
              </Button>
            </Link>
          </div>
        </CardContent>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <span className="text-muted-foreground">
                Loading notifications...
              </span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-10">
              <span className="text-red-500">{error}</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Sent By</TableHead>
                    <TableHead>Viewed Percentage</TableHead>
                    <TableHead>Time Sent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>{notification.title}</TableCell>
                        <TableCell>{notification.messageText}</TableCell>
                        <TableCell>{notification.senderUsername}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded ${getViewedPercentageStyle(
                              notification.readCount,
                              notification.totalCount
                            )}`}
                          >
                            {notification.totalCount === 0
                              ? "N/A"
                              : `${notification.readCount}/${
                                  notification.totalCount
                                } (${Math.round(
                                  (notification.readCount /
                                    notification.totalCount) *
                                    100
                                )}%)`}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(notification.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No notifications found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

NotificationsDashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default NotificationsDashboard;
