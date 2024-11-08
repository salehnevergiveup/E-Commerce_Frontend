// src/pages/admin/users/create.js

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PermissionsDisplay from "@/components/permissions-display"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Pencil, ArrowLeft, Upload } from "lucide-react";

import AdminLayout from "@/layouts/admin-layout";

import { sendRequest, testRequest } from "@/services/requests/request-service"; // Ensure correct path
import RequestMethods from "@/enums/request-methods"; // Ensure correct path

export default function CreateUser() {
  const router = useRouter();

  // State variables
  const [user, setUser] = useState({
    userName: "",
    name: "",
    email: "",
    gender: "",
    age: "",
    status: "Active",
    roleId: "",
    phoneNumber: "",
    billingAddress: "",
    avatar: "",
    userCover: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [roles, setRoles] = useState([]); // To store fetched roles
  const [permissions, setPermissions] = useState(null); // To store permissions of selected role

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [coverDialogOpen, setCoverDialogOpen] = useState(false);

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await sendRequest(
          RequestMethods.GET,
          `roles?includeUsers=false`,
          null,
          true 
        );
        if (response.success) {
          // Filter roles to include only "Admin" and "User"
          const filteredRoles = response.data.filter(
            (item) =>
              item.roleType.toLowerCase() === "admin" || item.roleType.toLowerCase() === "user"
          );
          console.log("filteredRoles this is:", filteredRoles);
          setRoles(filteredRoles);
        } else {
          setError(response.message || "Failed to fetch roles.");
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError("Failed to fetch roles.");
      }
    };

    fetchRoles();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setUser({ ...user, [name]: value });

    if (name === "roleId") {
      // Find the selected role to display permissions
      const selectedRole = roles.find(
        (roleItem) => roleItem.id.toString() === value
      );
      if (selectedRole) {
        setPermissions(selectedRole.permission);
      } else {
        setPermissions(null);
      }
    }
  };

  // Handle image uploads
  const handleImageUpload = (type, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUser({ ...user, [type]: e.target.result });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleCreate = async () => {
    // Validate required fields

    if (
      !user.userName ||
      !user.name ||
      !user.email ||
      !user.gender ||
      !user.age ||
      !user.roleId ||
      !user.status
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare the payload
      const payload = {
        userName: user.userName,
        name: user.name,
        email: user.email,
        gender: user.gender, // "M" or "F"
        age: parseInt(user.age),
        status: user.status,
        roleId: parseInt(user.roleId),
        phoneNumber: user.phoneNumber,
        billingAddress: user.billingAddress,
        avatar: user.avatar, // URL or Base64 string
        userCover: user.userCover, // URL or Base64 string
      };

      // Make the POST request to create the user
      const createResponse = await sendRequest(
        RequestMethods.POST,
        `/users`, // Ensure this matches your backend route
        payload,
        true // requireAuth
      );

      if (createResponse.success) {
        // Optionally, you can redirect to the newly created user's detail page
        toast.success("User created successfully.");
        router.back();
      } else {
        toast.error(createResponse.message || "Failed to create user.");
        setError(createResponse.message || "Failed to create user.");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.message || "Failed to create user.");
      toast.error(err.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  // Function to get badge color based on status
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


  return (
    <div className="container mx-auto px-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/users")}
        className="mb-4 flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Users
      </Button>

      {/* Banner */}
      <div className="relative h-48 bg-orange-600 rounded-t-lg mb-16">
        <div className="absolute inset-0">
          {user.userCover ? (
            <Image
              src={user.userCover}
              alt="Cover"
              layout="fill"
              className="w-full h-full object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-full bg-orange-600 rounded-t-lg"></div>
          )}
        </div>
        <Dialog open={coverDialogOpen} onOpenChange={setCoverDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="icon" className="absolute bottom-2 right-2">
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-center">Upload Cover Image</DialogTitle>
            </DialogHeader>
            <div
              className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <label htmlFor="cover-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-orange-400" />
                  <span className="mt-2 text-sm text-gray-500">Choose a cover image to upload</span>
                </div>
                <input
                  id="cover-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('userCover', file);
                    setCoverDialogOpen(false);
                  }}
                />
              </label>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Profile Section */}
      <Card className="border-0 shadow-lg -mt-16">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white">
                {user.avatar ? (
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                ) : (
                  <AvatarFallback>{user.userName ? user.userName.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                )}
              </Avatar>
              <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="icon" className="absolute bottom-0 right-0">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Upload Avatar</DialogTitle>
                  </DialogHeader>
                  <div
                    className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <Upload className="h-12 w-12 text-orange-400" />
                        <span className="mt-2 text-sm text-gray-500">Upload avatar</span>
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('avatar', file);
                          setAvatarDialogOpen(false);
                        }}
                      />
                    </label>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{user.name || "New User"}</h2>
                  <p className="text-muted-foreground">
                    @{user.userName.toLowerCase().replace(/\s+/g, '') || "newuser"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(user.status)} text-white`}>
                  {user.status}
                </Badge>
                {user.roleId && (
                  <Badge className={`${getStatusColor(user.status)} text-white`} variant="outline">
                    {roles.find((roleItem) => roleItem.id.toString() === user.roleId)?.roleType || "N/A"}
                  </Badge>
                )}
              </div>
              {/* Display Permissions */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create User Form */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={user.name}
                onChange={handleInputChange}
                placeholder="Enter user's name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userName">Username <span className="text-red-500">*</span></Label>
              <Input
                id="userName"
                name="userName"
                value={user.userName}
                onChange={handleInputChange}
                placeholder="Enter username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={user.email}
                onChange={handleInputChange}
                placeholder="Enter user's email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={user.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter user's phone number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingAddress">Billing Address</Label>
              <Input
                id="billingAddress"
                name="billingAddress"
                value={user.billingAddress}
                onChange={handleInputChange}
                placeholder="Enter billing address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
              <Select
                value={user.gender === "M" ? "Male" : user.gender === "F" ? "Female" : ""}
                onValueChange={(value) => handleSelectChange('gender', value === "Male" ? "M" : "F")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age <span className="text-red-500">*</span></Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={user.age}
                onChange={handleInputChange}
                placeholder="Enter user's age" />
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleId">Role <span className="text-red-500">*</span></Label>
              <Select
                value={user.roleId}
                onValueChange={(value) => handleSelectChange('roleId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((roleItem) => (
                    <SelectItem key={roleItem.id} value={roleItem.id.toString()}>
                      {roleItem.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {permissions && <PermissionsDisplay permissions={permissions} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
              <Select
                value={user.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button
          className="bg-orange-600 hover:bg-orange-700"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create User"}
        </Button>
      </div>

      {/* Display Error Message */}
      {error && (
        <div className="mt-4 text-red-500">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

// Define the layout for this page
CreateUser.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
