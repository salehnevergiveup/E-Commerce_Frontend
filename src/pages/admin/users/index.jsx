// src/pages/admin/users/index.jsx

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/layouts/admin-layout";
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'react-toastify';
import sendRequest from '@/services/requests/request-service';
import Roles from "@/enums/users";
import RequestMethods from "@/enums/request-methods";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Badge
} from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trash2, Eye, Edit, Search, Download, UserPlus, Users, AlertTriangle
} from "lucide-react";

const getStatusColor = (status) => {
  switch (status) {
    case "Active":
      return "bg-green-500 hover:bg-green-600";
    case "Pending":
      return "bg-orange-500 hover:bg-orange-600";
    case "Inactive":
      return "bg-gray-500 hover:bg-gray-600";
    case "Suspended":
      return "bg-red-500 hover:bg-red-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

export default function UsersDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [users, setUsers] = useState([]); // Fetched users from backend
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1); // Current active page
  const [itemsPerPage, setItemsPerPage] = useState(10); // Number of users per page

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await sendRequest(RequestMethods.GET, "users", null, true);
        if (response.success) {
          const mappedUsers = response.data.map((userObj) => ({
            id: userObj.id,
            name: userObj.name,
            username: userObj.username,
            email: userObj.email,
            roleName: userObj.roleName,
            roleType: userObj.roleType,
            status: userObj.status,
            createdAt: userObj.createdAt,
            avatar: userObj.avatar || "/placeholder.svg", // Fallback to placeholder if avatar is empty
          }));
          setUsers(mappedUsers);
        } else {
          setError(response.message || "Failed to fetch users.");
        }
      } catch (err) {
        toast.error(err.message || "Failed to fetch users.");
        setError(err.message || "Failed to fetch users.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const handleDelete = (userId) => {
    setDeleteUserId(userId);
  };

  const confirmDelete = async () => {
    if (!deleteUserId) return;
    try {
      const endpoint = `users/${deleteUserId}`; // e.g., '/api/User/1'
      const response = await sendRequest(RequestMethods.DELETE, endpoint, null, true);
      if (response.success) {
        setUsers(users.filter((user) => user.id !== deleteUserId));
        toast.success("User deleted successfully.");
      } else {
        toast.error(response.message || "Failed to delete user.");
      }
      setDeleteUserId(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete user.");
      setDeleteUserId(null);
    }
  };

  // Determine the role of the logged-in user
  const currentUserRole = user?.roleType; // Adjusted to match backend field 'roleType'

  // Filter users based on current user's role and search criteria
  const filteredUsers = users
    .filter(user => {
      if (currentUserRole === Roles.ADMIN) {
        return user.roleType === Roles.USER;
      }
      // If SuperAdmin or other roles, show all users
      return true;
    })
    .filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        selectedRole === "all" || selectedRole === "" || user.roleType === selectedRole;
      const matchesStatus =
        selectedStatus === "all" || selectedStatus === "" || user.status === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });

  // Calculate total pages
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Get current users for the page
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Reset to first page when filters or items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedStatus, itemsPerPage]);

  // Dynamically Calculate Statistics Based on Fetched Users
  const stats = [
    {
      title: "Total Users",
      value: users.length,
      change: "+0%", // Placeholder since it's dynamic
      icon: <Users className="h-4 w-4" />,
      subtitle: "Total registered users",
    },
    {
      title: "Active Users",
      value: users.filter(user => user.status === "Active").length,
      change: "+0%", // Placeholder
      icon: <Users className="h-4 w-4" />,
      subtitle: "Users currently active",
    },
    {
      title: "Admin",
      value: users.filter(user => user.roleType === Roles.ADMIN).length,
      change: "+0%", // Placeholder
      icon: <Users className="h-4 w-4" />,
      subtitle: "Total Super Admins",
    },
    {
      title: "Users",
      value: users.filter(user => user.roleType === Roles.USER).length,
      change: "+0%", // Placeholder
      icon: <Users className="h-4 w-4" />,
      subtitle: "Total Regular Users",
    },
  ];

  // Pagination Component
  const Pagination = () => {
    const pageNumbers = [];

    // Generate page numbers
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    // Handle edge case when totalPages is 0
    if (totalPages === 0) return null;

    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          aria-label="Previous Page"
        >
          Previous
        </Button>
        {pageNumbers.map(number => (
          <Button
            key={number}
            variant={number === currentPage ? "solid" : "outline"}
            className={number === currentPage ? "bg-orange-600 text-white" : ""}
            onClick={() => setCurrentPage(number)}
            aria-label={`Go to page ${number}`}
          >
            {number}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="flex flex-row items-center justify-between p-6">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className={`text-xs text-green-500`}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">{stat.subtitle}</span>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Search Filters</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={Roles.SUPER_ADMIN}>Super Admin</SelectItem>
                  <SelectItem value={Roles.ADMIN}>Admin</SelectItem>
                  <SelectItem value={Roles.USER}>User</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <CardTitle>Users List</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search User"
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              {/* Add New User Button */}
              <Link href={`users/create`}>
                <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
                  <UserPlus className="h-4 w-4" />
                  Add New User
                </Button>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <span className="text-muted-foreground">Loading users...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-10">
              <span className="text-red-500">{error}</span>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>UserName</TableHead>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Avatar className="h-9 w-9 mr-2">
                                <AvatarImage src={user.avatar} alt={user.name || "User Avatar"} />
                                <AvatarFallback>{user.name ? user.name.charAt(0) : "U"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name || "No Name"}</div>
                                <div className="text-sm text-muted-foreground">{user.email || "No Email"}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.roleName}</TableCell>
                          <TableCell>{user.roleType}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(user.status)} text-white`}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              {/* Conditionally render Edit and Delete buttons */}
                              {user.roleType !== Roles.SUPER_ADMIN && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDelete(user.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <Link href={`users/edit/${user.id}`}>
                                    <Button variant="ghost" size="icon">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </>
                              )}
                              {/* Always show View button */}
                              <Link href={`users/view/${user.id}`}>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                {/* Items Per Page Select Box */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Show</span>
                  <Select value={itemsPerPage} onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1); // Reset to first page when items per page changes
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">entries</span>
                </div>

                {/* Pagination Buttons */}
                <Pagination />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent className="bg-white text-center space-y-4">
          <AlertDialogHeader className="flex flex-col items-center gap-2">
            <AlertDialogTitle className="text-center">Delete User</AlertDialogTitle>
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <AlertDialogDescription className="text-center text-sm">
              This action cannot be undone. This will permanently delete the user account
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col space-y-2">
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 w-full" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
            <AlertDialogCancel className="w-full mt-2">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

UsersDashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
