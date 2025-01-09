// src/pages/admin/users/edit/[id].js

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { toast } from "react-toastify"; // Ensure you have react-toastify installed

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PermissionsDisplay from "@/components/permissions-display";

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

import { Pencil, ArrowLeft, Upload, Trash2 } from "lucide-react"; // Import Trash2 for delete icons

import { sendRequest } from "@/services/requests/request-service"; // Ensure correct path
import RequestMethods from "@/enums/request-methods"; // Ensure correct path
import AdminLayout from "@/layouts/admin-layout";

import S3MediaFacade from "@/services/mediaService/handle-media";

export default function EditUser() {
  const router = useRouter();
  const { id } = router.query; // Extract user ID from URL

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
    medias: [], // Each media: { id, type, mediaUrl }
  });
  const [originalMedias, setOriginalMedias] = useState([]); // Track original medias for deletions
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [roles, setRoles] = useState([]); // To store fetched roles
  const [permissions, setPermissions] = useState(null); // To store permissions of selected role

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [coverDialogOpen, setCoverDialogOpen] = useState(false);

  // State to determine if role is editable
  const [isRoleEditable, setIsRoleEditable] = useState(false);

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await sendRequest(
          RequestMethods.GET,
          `roles?includeUsers=false`,
          null,
          true // requireAuth
        );

        if (response.success) {
          // Filter roles to include only "Admin" and "User"
          const filteredRoles = response.data.filter(
            (item) =>
              item.roleType.toLowerCase() === "admin" ||
              item.roleType.toLowerCase() === "user"
          );
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

  // Fetch user data when ID is available and roles are fetched
  useEffect(() => {
    if (!id) return; // Wait until ID is available

    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await sendRequest(
          RequestMethods.GET,
          `users/${id}`,
          null,
          true // requireAuth
        );

        if (response.success && response.data) {
          const fetchedUser = response.data;
          setUser({
            userName: fetchedUser.userName || "",
            name: fetchedUser.name || "",
            email: fetchedUser.email || "",
            gender: fetchedUser.gender || "",
            age: fetchedUser.age || "",
            status: fetchedUser.status || "Active",
            roleId: fetchedUser.roleId ? fetchedUser.roleId.toString() : "",
            phoneNumber: fetchedUser.phoneNumber || "",
            billingAddress: fetchedUser.billingAddress || "",
            medias: fetchedUser.medias || [], // Set medias array
          });

          // Set originalMedias for tracking deletions
          setOriginalMedias(fetchedUser.medias || []);

          const selectedRole = roles.find(
            (roleItem) =>
              roleItem.id.toString() === fetchedUser.roleId.toString()
          );
          if (selectedRole) {
            setPermissions(selectedRole.permission);

            setIsRoleEditable(selectedRole.roleType.toLowerCase() === "admin");
          } else {
            setPermissions(null);
            setIsRoleEditable(false);
          }
        } else {
          setError(response.message || "Failed to fetch user data.");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, roles]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setUser((prevUser) => ({ ...prevUser, [name]: value }));

    if (name === "roleId") {
      // Find the selected role to display permissions
      const selectedRole = roles.find(
        (roleItem) => roleItem.id.toString() === value
      );
      if (selectedRole) {
        setPermissions(selectedRole.permission);
        // Update isRoleEditable based on the new roleType
        setIsRoleEditable(selectedRole.roleType.toLowerCase() === "admin");
      } else {
        setPermissions(null);
        setIsRoleEditable(false);
      }
    }
  };

  /**
   * Centralized method to send a PUT request with all user data to update the backend.
   */
  const sendUserUpdate = async (updatedMedias) => {
    setLoading(true);
    setError(null);
    try {
      // Prepare the payload including medias
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
        medias: updatedMedias
          ? updatedMedias
          : user.medias.map((media) => ({
              id: media.id,
              type: media.type,
              mediaUrl: media.mediaUrl,
            })),
      };

      // Make the PUT request to update the user information
      const updateResponse = await sendRequest(
        RequestMethods.PUT,
        `/users/${id}`,
        payload,
        true // requireAuth
      );

      if (updateResponse.success) {
        toast.success("User information updated successfully.");
      } else {
        setError(
          updateResponse.message || "Failed to update user information."
        );
        toast.error(
          updateResponse.message || "Failed to update user information."
        );
      }
    } catch (err) {
      console.error("Error updating user information:", err);
      setError(err.message || "Failed to update user information.");
      toast.error(err.message || "Failed to update user information.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle uploading or updating media.
   * Updates the user state and sends the comprehensive PUT request to the backend.
   * @param {string} url - Current media URL (for existing media)
   * @param {string} type - Type of media ('User_Profile' or 'User_Cover')
   * @param {File} file - The file to upload
   */
  const handleUploadOrUpdateMedia = async (url, type, file) => {
    if (!file) return;

    try {
      let updatedMedias = user.medias;

      // Check if media of this type already exists based on mediaUrl
      const existingMediaIndex = updatedMedias.findIndex(
        (media) => media.mediaUrl === url && url != ""
      );
      if (existingMediaIndex !== -1) {
        // Media exists, perform update
        const existingMedia = updatedMedias[existingMediaIndex];

        // Upload new media to S3 and get the new URL
        const updateMediaArray = [
          {
            id: existingMedia.id,
            type: existingMedia.type,
            file: file,
            url: existingMedia.mediaUrl,
          },
        ];

        const updateResponse = await S3MediaFacade.updateMedias(
          user.medias,
          updateMediaArray
        );

        if (updateResponse && updateResponse.updatedMediaArray) {
          // Update the media in the state
          setUser((prevUser) => ({
            ...prevUser,
            medias: updateResponse.updatedMediaArray,
          }));

          await sendUserUpdate(updateResponse.updatedMediaArray);
        }
      } else {
        const uploadedMedias = await S3MediaFacade.uploadMedias([
          { file, type },
        ]);

        if (uploadedMedias.length > 0) {
          const uploadedMedia = uploadedMedias[0];

          updatedMedias.push(uploadedMedia);

          setUser((prevUser) => ({
            ...prevUser,
            medias: updatedMedias,
          }));

          await sendUserUpdate();
        }
      }
    } catch (error) {
      console.error(`Error handling ${type}:`, error);
      toast.error(`Error handling ${type}.`);
    }
  };

  /**
   * Handle deleting media.
   * Updates the user state and sends the comprehensive PUT request to the backend.
   * @param {string} type - Type of media ('User_Profile' or 'User_Cover')
   */
  const handleDeleteMedia = async (type) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the ${type.replace("_", " ")}?`
    );
    if (!confirmDelete) return;

    try {
      const mediaToDelete = user.medias.find((media) => media.type === type);
      if (!mediaToDelete || !mediaToDelete.mediaUrl) {
        toast.error(`No ${type.replace("_", " ")} found to delete.`);
        return;
      }

      await S3MediaFacade.deleteMedias([mediaToDelete.mediaUrl]);

      let updatedMedias = user.medias.forEach((media) => {
        if (media.type == type) {
          media.mediaUrl = "";
          media.type = type;
        }
      });

      await sendUserUpdate(updatedMedias);

      updatedMedias = user.medias.filter((media) => media.type !== type);

      setUser((prevUser) => ({
        ...prevUser,
        medias: updatedMedias,
      }));

      toast.success(`${type.replace("_", " ")} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Error deleting ${type}.`);
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

  // Extract avatar and cover from medias array
  const avatar =
    user.medias.find((media) => media.type === "User_Profile")?.mediaUrl || "";
  const userCover =
    user.medias.find((media) => media.type === "User_Cover")?.mediaUrl || "";

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
          {userCover ? (
            <Image
              src={userCover}
              alt="Cover"
              layout="fill"
              className="w-full h-full object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-full bg-orange-600 rounded-t-lg"></div>
          )}
        </div>
        {/* Upload Cover Image */}
        <Dialog open={coverDialogOpen} onOpenChange={setCoverDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-2 right-2"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-center">
                Upload Cover Image
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <label htmlFor="cover-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-orange-400" />
                  <span className="mt-2 text-sm text-gray-500">
                    Choose a file to upload
                  </span>
                </div>
                <input
                  id="cover-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      handleUploadOrUpdateMedia(userCover, "User_Cover", file);
                    setCoverDialogOpen(false);
                  }}
                />
              </label>
            </div>
          </DialogContent>
        </Dialog>
        {/* Delete Cover Image */}
        {userCover && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            onClick={() => handleDeleteMedia("User_Cover")}
            title="Delete Cover Image"
            aria-label="Delete Cover Image"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Profile Section */}
      <Card className="border-0 shadow-lg -mt-16">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white">
                {avatar ? (
                  <AvatarImage
                    src={avatar || "/placeholder.svg"}
                    alt={user.name}
                  />
                ) : (
                  <AvatarFallback>
                    {user.userName
                      ? user.userName.charAt(0).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              {/* Delete Button for Avatar */}
              {avatar && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  onClick={() => handleDeleteMedia("User_Profile")}
                  title="Delete Avatar"
                  aria-label="Delete Avatar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {/* Upload Avatar */}
              <Dialog
                open={avatarDialogOpen}
                onOpenChange={setAvatarDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Upload Avatar</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <Upload className="h-12 w-12 text-orange-400" />
                        <span className="mt-2 text-sm text-gray-500">
                          Choose a file to upload
                        </span>
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            handleUploadOrUpdateMedia(
                              avatar,
                              "User_Profile",
                              file
                            );
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
                  <h2 className="text-2xl font-bold">
                    {user.name || "User Name"}
                  </h2>
                  <p className="text-muted-foreground">
                    @
                    {user.userName.toLowerCase().replace(/\s+/g, "") ||
                      "username"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(user.status)} text-white`}>
                  {user.status}
                </Badge>
                {user.roleId && (
                  <Badge
                    className={`${getStatusColor(user.status)} text-white`}
                    variant="outline"
                  >
                    {roles.find(
                      (roleItem) => roleItem.id.toString() === user.roleId
                    )?.roleType || "N/A"}
                  </Badge>
                )}
              </div>
              {/* PermissionsDisplay Component */}
              {permissions && <PermissionsDisplay permissions={permissions} />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Form */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={user.name}
                onChange={handleInputChange}
                placeholder="Enter user's name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userName">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="userName"
                name="userName"
                value={user.userName}
                onChange={handleInputChange}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={user.email}
                onChange={handleInputChange}
                placeholder="Enter user's email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={user.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter user's phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingAddress">Billing Address</Label>
              <Input
                id="billingAddress"
                name="billingAddress"
                value={user.billingAddress}
                onChange={handleInputChange}
                placeholder="Enter billing address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select
                value={
                  user.gender === "M"
                    ? "Male"
                    : user.gender === "F"
                    ? "Female"
                    : ""
                }
                onValueChange={(value) =>
                  handleSelectChange("gender", value === "Male" ? "M" : "F")
                }
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
              <Label htmlFor="age">
                Age <span className="text-red-500">*</span>
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={user.age}
                onChange={handleInputChange}
                placeholder="Enter user's age"
              />
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
              <Label htmlFor="roleId">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={user.roleId}
                onValueChange={(value) => handleSelectChange("roleId", value)}
                disabled={!isRoleEditable} // Disable if not editable
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {isRoleEditable
                    ? roles
                        .filter(
                          (roleItem) =>
                            roleItem.roleType.toLowerCase() === "admin"
                        )
                        .map((roleItem) => (
                          <SelectItem
                            key={roleItem.id}
                            value={roleItem.id.toString()}
                          >
                            {roleItem.roleName}
                          </SelectItem>
                        ))
                    : roles
                        .filter(
                          (roleItem) =>
                            roleItem.roleType.toLowerCase() === "user"
                        )
                        .map((roleItem) => (
                          <SelectItem
                            key={roleItem.id}
                            value={roleItem.id.toString()}
                          >
                            {roleItem.roleName}
                          </SelectItem>
                        ))}
                </SelectContent>
              </Select>
              {/* PermissionsDisplay Component */}
              {permissions && <PermissionsDisplay permissions={permissions} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={user.status}
                onValueChange={(value) => handleSelectChange("status", value)}
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
          onClick={() => sendUserUpdate()}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update User"}
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
EditUser.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
