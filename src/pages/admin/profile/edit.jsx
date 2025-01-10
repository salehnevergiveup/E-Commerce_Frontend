// src/pages/profile/edit.js

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Pencil, Upload, Eye, EyeOff, ArrowLeft, Trash2 } from "lucide-react";

import { sendRequest } from "@/services/requests/request-service"; // Ensure correct path
import RequestMethods from "@/enums/request-methods"; // Ensure correct path

import { useAuth } from "@/contexts/auth-context"; // Import useAuth for authentication context

import AdminLayout from "@/layouts/admin-layout";

import S3MediaFacade from '@/services/mediaService/handle-media'; // Import S3MediaFacade

export default function EditProfilePage() {
  const router = useRouter();
  const { user: authUser } = useAuth();

  const [user, setUser] = useState({
    userName: "",
    name: "",
    email: "",
    gender: "",
    age: "",
    phoneNumber: "",
    billingAddress: "",
    medias: [], // Unified medias array
  });
  const [originalMedias, setOriginalMedias] = useState([]); // Track original medias for deletions

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [coverDialogOpen, setCoverDialogOpen] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // States to handle password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!authUser?.id) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await sendRequest(
          RequestMethods.GET,
          `users/${authUser.id}`, // Fetch the profile of the authenticated user
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
            age: fetchedUser.age ? fetchedUser.age.toString() : "",
            phoneNumber: fetchedUser.phoneNumber || "",
            billingAddress: fetchedUser.billingAddress || "",
            medias: fetchedUser.medias || [], // Unified medias array
          });

          // Set originalMedias for tracking deletions
          setOriginalMedias(fetchedUser.medias || []);
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
  }, [authUser?.id]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({ ...prevUser, [name]: value }));
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prevForm => ({ ...prevForm, [name]: value }));
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
        status: "", // Assuming status is not editable in profile
        roleId: 0, // Assuming role is not editable in profile
        phoneNumber: user.phoneNumber,
        billingAddress: user.billingAddress,
        medias: updatedMedias ? updatedMedias : user.medias.map(media => ({
          id: media.id,
          type: media.type,
          mediaUrl: media.mediaUrl,
        })),
      };

      // Make the PUT request to update the user information
      const updateResponse = await sendRequest(
        RequestMethods.PUT,
        `/users/${authUser.id}`,
        payload,
        true // requireAuth
      );

      if (updateResponse.success) {
        toast.success("Profile updated successfully.");
      } else {
        setError(updateResponse.message || "Failed to update profile.");
        toast.error(updateResponse.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile.");
      toast.error(err.message || "Failed to update profile.");
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
      let updatedMedias = [...user.medias];

      // Check if media of this type already exists
      const existingMediaIndex = updatedMedias.findIndex(media => media.type === type);
      if (existingMediaIndex !== -1) {
        // Media exists, perform update
        const existingMedia = updatedMedias[existingMediaIndex];

        // Upload new media to S3 and get the new URL
        const updateMediaArray = [{
          id: existingMedia.id,
          type: existingMedia.type,
          file: file,
          url: existingMedia.mediaUrl,
        }];

        const updateResponse = await S3MediaFacade.updateMedias(user.medias, updateMediaArray);

        if (updateResponse && updateResponse.updatedMediaArray) {
          // Update the media in the state
          setUser(prevUser => ({
            ...prevUser,
            medias: updateResponse.updatedMediaArray,
          }));

          await sendUserUpdate(updateResponse.updatedMediaArray);
        }

      } else {
        // Media does not exist, perform upload
        const uploadedMedias = await S3MediaFacade.uploadMedias([{ file, type }]);

        if (uploadedMedias.length > 0) {
          const uploadedMedia = uploadedMedias[0];
          updatedMedias.push(uploadedMedia);

          setUser(prevUser => ({
            ...prevUser,
            medias: updatedMedias,
          }));

          await sendUserUpdate(updatedMedias);
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
    const confirmDelete = window.confirm(`Are you sure you want to delete the ${type.replace('_', ' ')}?`);
    if (!confirmDelete) return;

    try {
      const mediaToDelete = user.medias.find(media => media.type === type);
      if (!mediaToDelete || !mediaToDelete.mediaUrl) {
        toast.error(`No ${type.replace('_', ' ')} found to delete.`);
        return;
      }

      await S3MediaFacade.deleteMedias([mediaToDelete.mediaUrl]);

      let updatedMedias  = user.medias.forEach(media =>  {  
        if(media.type == type) {  
          media.mediaUrl = "";  
          media.type = type; 
        }
      }); 

      await sendUserUpdate(updatedMedias);

      updatedMedias = user.medias.filter(media => media.type !== type);

      setUser(prevUser => ({
        ...prevUser,
        medias: updatedMedias,
      }));

      toast.success(`${type.replace('_', ' ')} deleted successfully.`);

    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Error deleting ${type}.`);
    }
  };

  // Function to get media URL based on type
  const getMediaUrl = (type) => {
    const media = user.medias.find(media => media.type === type);
    return media ? media.mediaUrl : "";
  };

  // Extract avatar and cover from medias array
  const avatar = getMediaUrl("User_Profile");
  const userCover = getMediaUrl("User_Cover");

  // Handle profile update submission
  const handleUpdate = async () => {
    // Validate required fields
    if (
      !user.userName ||
      !user.name ||
      !user.email ||
      !user.gender ||
      !user.age
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    await sendUserUpdate();
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    // Check if newPassword is different from currentPassword
    if (currentPassword === newPassword) {
      toast.error("New password must be different from the current password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        currentPassword: currentPassword,
        newPassword: newPassword,
      };

      // Make the POST request to change the password
      const passwordResponse = await sendRequest(
        RequestMethods.POST,
        `/authentication/change-password`, // Correct Endpoint
        payload,
        true // requireAuth
      );

      if (passwordResponse.success) {
        toast.success("Password updated successfully.");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(passwordResponse.message || "Failed to update password.");
        toast.error(passwordResponse.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setError(err.message || "Failed to update password.");
      toast.error(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user.name) {
    return <div className="container mx-auto px-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/profile")}
        className="mb-4 flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Profile
      </Button>

      {/* Cover Image */}
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
            <Button variant="secondary" size="icon" className="absolute bottom-2 right-2">
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-center">Upload Cover Image</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
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
                    if (file) handleUploadOrUpdateMedia(userCover, "User_Cover", file);
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
            onClick={() => handleDeleteMedia('User_Cover')}
            title="Delete Cover Image"
            aria-label="Delete Cover Image"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card className="border-0 shadow-lg -mt-16">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white">
                {avatar ? (
                  <AvatarImage src={avatar || "/placeholder.svg"} alt={user.name} />
                ) : (
                  <AvatarFallback>{user.userName ? user.userName.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                )}
              </Avatar>
              {/* Delete Button for Avatar */}
              {avatar && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  onClick={() => handleDeleteMedia('User_Profile')}
                  title="Delete Avatar"
                  aria-label="Delete Avatar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {/* Upload Avatar */}
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
                  <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
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
                          if (file) handleUploadOrUpdateMedia(avatar, 'User_Profile', file);
                          setAvatarDialogOpen(false);
                        }}
                      />
                    </label>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.name || "User Name"}</h2>
              <p className="text-muted-foreground">
                @{user.userName.toLowerCase().replace(/\s+/g, "") || "username"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Profile and Change Password */}
      <Tabs defaultValue="profile" className="mt-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="flex justify-center">
            <div className="w-full mb-3 max-w-4xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Form Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={user.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
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
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={user.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
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
                        handleInputChange({
                          target: { name: "gender", value: value === "Male" ? "M" : "F" },
                        })
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
                      placeholder="Enter your age"
                    />
                  </div>
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={handleUpdate}
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </Button>
                </CardContent>
              </Card>

              {error && (
                <div className="text-red-500">
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Change Password Tab */}
        <TabsContent value="password">
          <div className="flex justify-center">
            <div className="w-full mb-3 max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        className="pr-10" // Added padding to the right
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() =>
                          setShowCurrentPassword((prev) => !prev)
                        }
                        type="button"
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password"
                        className="pr-10" // Added padding to the right
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        type="button"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm your new password"
                        className="pr-10" // Added padding to the right
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() =>
                          setShowConfirmPassword((prev) => !prev)
                        }
                        type="button"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={handlePasswordUpdate}
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Save Changes"}
                  </Button>

                  {error && (
                    <div className="text-red-500 mt-2">
                      <p>{error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

EditProfilePage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
