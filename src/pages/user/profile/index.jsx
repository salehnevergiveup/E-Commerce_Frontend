import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context"; // Import useAuth
import UserLayout from "@/layouts/user-layout";
import AuthGuard from "@/components/auth-guard";
import WalletService from "@/services/wallet/wallet-service";

import {
  Pencil,
  Phone,
  MapPin,
  Telescope,
  Wallet,
  DollarSignIcon,
  DollarSign,
  Banknote,
} from "lucide-react";
import {
  EnvelopeClosedIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from "@radix-ui/react-icons";
import sendRequest from "@/services/requests/request-service"; // Adjust the import path as needed
import RequestMethods from "@/enums/request-methods";

function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "listings"; // Default to "listings" if no 'tab' query parameter
  console.log("Active tab from URL:", tab);

  const [userDetails, setUserDetails] = useState(null);
  const [balance, setBalance] = useState({
    availableBalance: 0,
    onHoldBalance: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const notificationsPerPage = 10;

  //const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // Added state for search query

  const loadBalance = async () => {
    try {
      const balanceData = await WalletService.fetchBalance();
      if (balanceData.success) {
        setBalance({
          availableBalance: balanceData.data?.availableBalance || 0,
          onHoldBalance: balanceData.data?.onHoldBalance || 0,
        });
      } else {
        console.error("Failed to fetch balance data:", balanceData.message);
      }
    } catch (error) {
      console.error("Failed to load balance:", error);
    }
  };

  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const response = await sendRequest(
        RequestMethods.GET,
        "notifications/users/all",
        null,
        true
      );
      if (response.success) {
        setNotifications(response.data); // Update the notifications state
        console.log("test test test" + response);
      } else {
        console.error("Failed to fetch notifications:", response.message);
        console.log("test test test" + JSON.stringify(response));
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await sendRequest(
        RequestMethods.GET,
        `/review/${user.id}?type=saler`, // Adjust the endpoint as per your backend API
        // Adjust the endpoint as per your backend API
        null,
        true
      );
      if (response.success) {
        setReviews(response.data); // Assuming response.data is an array of ReviewDTO
      } else {
        console.error("Failed to fetch reviews:", response.message);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await sendRequest(
        RequestMethods.POST,
        `/notifications/users/update_notifications`,
        null,
        true
      );
      if (response.success) {
        console.log("marked as read successfully");
      } else {
        console.error("Failed to mark as read:", response.message);
      }
    } catch (error) {
      console.error("Error, Failed to mark as read:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await sendRequest(
          RequestMethods.GET,
          `users/${user.id}`,
          null,
          true
        );
        if (response.success) {
          setUserDetails(response.data);
        } else {
          console.error("Failed to fetch user data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    const initialize = async () => {
      await fetchUser(); // Fetch user details first
      await loadBalance(); // Then fetch balance if user is defined
      await loadNotifications();
    };

    initialize(); // Call initialize function when component is mounted
  }, []);

  const handleNavigateToTopUp = async () => {
    try {
      await WalletService.navigateToTopUp(router);
    } catch (error) {
      console.error("Error navigating to top-up page:", error);
    }
  };

  const handleEdit = () => {
    router.push(`/user/profile/edit`);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-orange-500";
      case "inactive":
        return "bg-gray-500";
      case "suspended":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const totalPages = Math.ceil(notifications.length / notificationsPerPage);
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification =
    indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => {
      if (direction === "next" && prevPage < totalPages) {
        return prevPage + 1;
      } else if (direction === "prev" && prevPage > 1) {
        return prevPage - 1;
      }
      return prevPage;
    });
  };

  if (loading) {
    return <div className="container mx-auto px-4">Loading...</div>;
  }

  if (!userDetails) {
    return (
      <div className="container mx-auto px-4">
        <p>User details not found.</p>
      </div>
    );
  }

  // Extract avatar and cover media from userDetails.medias
  const avatarMedia = userDetails.medias
    ? userDetails.medias.find((media) => media.type === "User_Profile")
    : null;
  const coverMedia = userDetails.medias
    ? userDetails.medias.find((media) => media.type === "User_Cover")
    : null;

  // Determine the cover image source
  const coverSrc =
    coverMedia && coverMedia.mediaUrl
      ? coverMedia.mediaUrl
      : "/placeholder.svg";

  // Determine the avatar image source
  const avatarSrc =
    avatarMedia && avatarMedia.mediaUrl
      ? avatarMedia.mediaUrl
      : "/placeholder.svg";

  return (
    <div className="container mx-auto px-4 py-3">
      <div className="relative h-48 bg-orange-600 rounded-t-lg mb-16">
        <Image
          src={userDetails.userCover ?? "/placeholder.svg"}
          alt="Cover"
          layout="fill"
          className="object-cover rounded-t-lg"
        />
      </div>
      <Card className="border-0 shadow-lg -mt-16">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white">
              <AvatarImage
                src={avatarSrc}
                alt={userDetails.name || "User Avatar"}
              />
              <AvatarFallback>
                {userDetails.name
                  ? userDetails.name.charAt(0).toUpperCase()
                  : "U"}
              </AvatarFallback>
              <AvatarImage
                src={avatarSrc}
                alt={userDetails.name || "User Avatar"}
              />
              <AvatarFallback>
                {userDetails.name
                  ? userDetails.name.charAt(0).toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {userDetails.name || "No Name"}
                  </h2>
                  <h2 className="text-2xl font-bold">
                    {userDetails.name || "No Name"}
                  </h2>
                  <p className="text-muted-foreground">
                    @{userDetails.userName}
                  </p>
                </div>
                <Button
                  onClick={handleEdit}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit User
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${getStatusColor(userDetails.status)} text-white`}
                >
                  {userDetails.status}
                </Badge>
                <Badge variant="outline">{userDetails.roleType}</Badge>
                <Badge variant="outline">{userDetails.roleName}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6">
        <Tabs
          value={tab} // Bind Tabs' value to the tab from URL
          onValueChange={(value) => {
            router.push(
              {
                pathname: router.pathname, // Keep the current path
                query: { ...Object.fromEntries(searchParams), tab: value }, // Update the 'tab' query parameter
              },
              undefined,
              { shallow: true } // Prevent full page reload
            );

            if (value === "balance") loadBalance();
            if (value === "notifications") loadNotifications();
          }}
        >
          <TabsList>
            {/* Removed Listings Tab */}
            {userDetails.roleType &&
              userDetails.roleType.toLowerCase() === "user" && (
                <TabsTrigger value="balance">Balance</TabsTrigger>
              )}
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>{" "}
            {/* Added Reviews Tab */}
          </TabsList>

          {/* Balance Tab Content */}
          {userDetails.roleType &&
            userDetails.roleType.toLowerCase() === "user" && (
              <TabsContent value="balance" className="mt-4">
                {/* Balance content remains unchanged */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Wallet className="mr-2 h-5 w-5 text-orange-600" />
                        My Balance
                      </div>
                      <Button
                        onClick={handleNavigateToTopUp}
                        className="bg-orange-600 hover:bg-orange-700 flex items-center"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Top Up Wallet
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mt-1" />
                          <div>
                            <h4 className="font-semibold">
                              Verify your identity to cash out
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              To transfer money into your bank account, you'll
                              need to verify your identity as required by
                              Malaysian government regulations
                            </p>
                            <Button
                              variant="link"
                              className="text-orange-600 px-0 mt-2"
                            >
                              Verify now
                              <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {balance ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Available Balance Card */}
                        <Card
                          className={`${
                            balance.availableBalance > 0
                              ? "bg-green-50 border-green-500"
                              : "bg-red-50 border-red-500"
                          } border`}
                        >
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>Available Balance</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold text-black">
                              RM{balance.availableBalance.toFixed(2)}
                            </p>
                            {balance.availableBalance <= 0 && (
                              <p className="text-sm text-red-600 mt-2">
                                Please remember to top up your wallet before
                                purchasing items
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        {/* On Hold Balance Card */}
                        <Card className="bg-yellow-50 border-yellow-500 border">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>On Hold Balance</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold text-black">
                              RM{balance.onHoldBalance.toFixed(2)}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <p>Loading balance information...</p>
                    )}

                    <div>
                      <h4 className="font-semibold mb-4">
                        Transaction History
                      </h4>
                      <div className="text-center py-8">
                        <Image
                          src="/placeholder.svg"
                          alt="Empty transactions"
                          width={120}
                          height={120}
                          className="mx-auto mb-4"
                        />
                        <p className="text-sm text-muted-foreground">
                          Start selling with Carousell Protection and get money
                          in your Balance!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

          {/* Notifications Tab Content */}
          <TabsContent value="notifications" className="mt-4">
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold">
                    Notifications
                  </CardTitle>
                  <Button
                    onClick={markAllAsRead}
                    className="bg-orange-600 hover:bg-orange-700 flex items-center"
                  >
                    Mark All as Read
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {currentNotifications.map((notification) => (
                      <Card
                        key={notification.notificationId}
                        className={`border ${
                          notification.isRead ? "bg-gray-50" : "bg-orange-50"
                        }`}
                      >
                        <CardHeader>
                          <CardTitle className="font-bold">
                            {notification.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>{notification.messageText}</p>
                          <p className="text-sm text-muted-foreground">
                            Sent by: {notification.senderUsername} on{" "}
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                      <div className="flex justify-center mb-4">
                        <Telescope className="h-12 w-12 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        No Notifications Found
                      </h3>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab Content */}
          <TabsContent value="reviews" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
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
                        You have not written any reviews yet.
                      </h3>
                      <p className="text-muted-foreground">
                        Once you purchase and use products, you can leave
                        reviews here.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab Content */}
          <TabsContent value="reviews" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
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
                        You have not written any reviews yet.
                      </h3>
                      <p className="text-muted-foreground">
                        Once you purchase and use products, you can leave
                        reviews here.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <EnvelopeClosedIcon className="h-4 w-4 text-orange-600" />
              <span>{userDetails.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-orange-600" />
              <span>{userDetails.phoneNumber}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-600" />
              <span>{userDetails.billingAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-orange-600" />
              <span>
                {userDetails.createdAt
                  ? `Joined ${new Date(
                      userDetails.createdAt
                    ).toLocaleDateString()}`
                  : "No Join Date"}
                {userDetails.createdAt
                  ? `Joined ${new Date(
                      userDetails.createdAt
                    ).toLocaleDateString()}`
                  : "No Join Date"}
              </span>
            </div>
          </CardContent>
        </Card>

        <button>Transfer</button>
      </div>
    </div>
  );
}

ProfilePage.getLayout = function getLayout(page) {
  return <UserLayout>{page}</UserLayout>;
};

// Wrap CheckoutPage with AuthGuard
const WrappedCheckoutPage = AuthGuard(ProfilePage, { allowedRoles: ["user"] });

// Ensure `getLayout` is passed along to the wrapped component
WrappedCheckoutPage.getLayout = ProfilePage.getLayout;

export default WrappedCheckoutPage;
