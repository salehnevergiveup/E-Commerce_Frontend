// src/pages/admin/users/view/[id].js

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link"; // Import Link for navigation
import Image from "next/image";
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

import {
  Pencil,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Flag,
  Search,
  ArrowLeft,
  Telescope,
  Shield,
  Key,
  UserCog,
  Activity,
} from "lucide-react";

import AdminLayout from "@/layouts/admin-layout";

// Import your sendRequest method and RequestMethods enum
import sendRequest from "@/services/requests/request-service"; // Adjust the import path as needed
import RequestMethods from "@/enums/request-methods"; // Adjust the import path as needed

// Import ReviewCard component
import { ReviewCard } from "@/components/review-card"; // Ensure this path is correct

export default function ViewUser() {
  const router = useRouter();
  const { id } = router.query;

  // State variables
  const [user, setUser] = useState(null); // To store user data
  const [loading, setLoading] = useState(true); // To handle loading state
  const [error, setError] = useState(null); // To handle errors

  // **Added state for search query**
  const [searchQuery, setSearchQuery] = useState(""); // To store the search input

  // **Added states for reviews**
  const [reviews, setReviews] = useState([]); // To store reviews
  const [reviewsLoading, setReviewsLoading] = useState(true); // To manage loading state for reviews
  const [reviewsError, setReviewsError] = useState(null); // To handle errors while fetching reviews

  useEffect(() => {
    if (!id) {
      // If ID is not available, navigate back
      router.back();
      return;
    }

    const fetchUserData = async () => {
      try {
        // Make the request using sendRequest
        const response = await sendRequest(
          RequestMethods.GET,
          `users/${id}`,
          null,
          true // requireAuth
        );

        if (response.success) {
          console.log(response.data)
          setUser(response.data);
        } else {
          toast.error(response.message || "Failed to fetch user.");
        }
      } catch (err) {
        toast.error(err.message || "Error fetching user data.");
        setError(err.message || "Error fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await sendRequest(
          RequestMethods.GET,
          `/review/${id}?Type=saler`, // Adjust the endpoint as per your backend API
          null,
          true // requireAuth
        );
        if (response.success) {
          setReviews(response.data); // Assuming response.data is an array of ReviewDTO
        }
      } catch (err) {
        toast.error(err.message || "Error fetching reviews.");
        setReviewsError(err.message || "Error fetching reviews.");
      } finally {
        setReviewsLoading(false);
      }
    };

    const initialize = async () => {
      await fetchUserData();
      // Optionally, load reviews here
      await fetchReviews();
    };

    if (id) {
      initialize();
    }
  }, [id, router]);

  // Function to load reviews when Reviews tab is selected
  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await sendRequest(
        RequestMethods.GET,
        `/admin/reviews/${id}`, // Adjust the endpoint for admin
        null,
        true
      );
      if (response.success) {
        setReviews(response.data); // Assuming response.data is an array of ReviewDTO
      } else {
        toast.error(response.message || "Failed to fetch reviews.");
        setReviewsError(response.message || "Failed to fetch reviews.");
      }
    } catch (err) {
      toast.error(err.message || "Error fetching reviews.");
      setReviewsError(err.message || "Error fetching reviews.");
    } finally {
      setReviewsLoading(false);
    }
  };

  // Handler functions
  const handleEdit = () => {
    router.push(`/admin/users/edit/${id}`);
  };

  const handleReport = () => {
    // Implement report functionality (e.g., open report modal)
    console.log("Report user:", id);
    // Example: router.push(`/admin/users/report/${id}`);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500 hover:bg-green-600";
      case "pending":
        return "bg-orange-500 hover:bg-orange-600";
      case "inactive":
        return "bg-gray-500 hover:bg-gray-600";
      case "suspended":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Conditional rendering based on state
  if (loading) {
    return (
      <div className="container mx-auto px-4">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <p className="text-red-500">Error: {error}</p>
        <Button variant="ghost" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4">
        <p>User not found.</p>
        <Button variant="ghost" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    );
  }

  // **Extract avatar and cover media objects**
  const avatarMedia = user.medias.find((media) => media.type === "User_Profile");
  const coverMedia = user.medias.find((media) => media.type === "User_Cover");

  // **Filter the product list based on search query (Removed since Listings Tab is removed)**
  // const filteredProductList = user.productList
  //   ? user.productList.filter((product) =>
  //     product.title.toLowerCase().includes(searchQuery.toLowerCase())
  //   )
  //   : [];

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
          {/* Cover Image Display */}
          {coverMedia && coverMedia.mediaUrl ? (
            <Image
              src={coverMedia.mediaUrl}
              alt="Cover"
              layout="fill"
              className="w-full h-full object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-full bg-orange-600 rounded-t-lg"></div>
          )}
        </div>
        <div className="absolute top-4 right-4">
          {user.roleType.toLowerCase() === "user" ? (
            <Button variant="secondary" onClick={handleReport}>
              <Flag className="mr-2 h-4 w-4" />
              Report user
            </Button>
          ) : null}
        </div>
      </div>

      {/* Profile Section */}
      <Card className="border-0 shadow-lg -mt-16">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white">
              {/* Avatar Image Display */}
              {avatarMedia && avatarMedia.mediaUrl ? (
                <AvatarImage
                  src={avatarMedia.mediaUrl}
                  alt={user.name || "User Avatar"}
                />
              ) : (
                <AvatarFallback>
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{user.name || "No Name"}</h2>
                  <p className="text-muted-foreground">
                    @{user.name ? user.name.toLowerCase().replace(/\s+/g, "") : "user"}
                  </p>
                </div>
                <Button
                  onClick={handleEdit}
                  className="bg-orange-600 hover:bg-orange-700 flex items-center"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit User
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(user.status)} text-white`}>
                  {user.status || "N/A"}
                </Badge>
                <Badge variant="outline">{user.roleType || "N/A"}</Badge>
                <Badge variant="outline">{user.roleName || "N/A"}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin View Section */}
      {(user.roleType.toLowerCase() === "admin" || user.roleType.toLowerCase() === "superadmin") && (
        <Card className="mb-6 mt-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <Shield className="mr-2 h-6 w-6 text-orange-600" />
              Admin View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Key className="mr-2 h-4 w-4 text-orange-600" />
                    Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add permissions management UI here */}
                  <p>Manage user permissions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <UserCog className="mr-2 h-4 w-4 text-orange-600" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add account settings management UI here */}
                  <p>Manage account settings</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Activity className="mr-2 h-4 w-4 text-orange-600" />
                    Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add activity log UI here */}
                  <p>View user activity log</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs Section - Removed Listings Tab and Added Reviews Tab */}
      {(user.roleType.toLowerCase() === "user") && (
        <Tabs
          defaultValue="reviews"
          className="mt-6"
          onValueChange={(value) => {
            if (value === "reviews") loadReviews();
            // Handle other tabs if necessary
          }}
        >
          <TabsList>
            <TabsTrigger value="reviews">Reviews</TabsTrigger> {/* Added Reviews Tab */}
            {/* Removed Listings Tab */}
          </TabsList>

          <TabsContent value="reviews" className="mt-4">
            {/* Reviews Tab Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <p>Loading reviews...</p>
                ) : reviewsError ? (
                  <p className="text-red-500">Error: {reviewsError}</p>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                      <div className="flex justify-center mb-4">
                        <Telescope className="h-12 w-12 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        No Reviews Found
                      </h3>
                      <p className="text-muted-foreground">
                        This user has not received any reviews yet.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      {/* User Details Cards */}

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-600" />
              <span>{user.email || "No Email"}</span>
            </div>
            {user.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-600" />
                <span>{user.phoneNumber}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.billingAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-600" />
                <span>{user.billingAddress}</span>
              </div>
            )}
            {user.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Define the layout for this page
ViewUser.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
