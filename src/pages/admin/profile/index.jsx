import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import AdminLayout from "@/layouts/admin-layout";

import {
  Pencil,
  Phone,
  MapPin,
  Shield,
  Key,
  UserCog,
  Activity,
} from "lucide-react";
import { EnvelopeClosedIcon, CalendarIcon } from "@radix-ui/react-icons";
import sendRequest from "@/services/requests/request-service"; // Adjust the import path as needed
import RequestMethods from "@/enums/request-methods";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

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
    if (user) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleEdit = () => {
    router.push(`/admin/profile/edit`);
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
  const coverSrc = coverMedia && coverMedia.mediaUrl ? coverMedia.mediaUrl : "/placeholder.svg";

  // Determine the avatar image source
  const avatarSrc = avatarMedia && avatarMedia.mediaUrl ? avatarMedia.mediaUrl : "/placeholder.svg";

  return (
    <div className="container mx-auto px-4">
      <div className="relative h-48 bg-orange-600 rounded-t-lg mb-16">
        <Image
          src={coverSrc}
          alt="Cover"
          layout="fill"
          className="object-cover rounded-t-lg"
        />
      </div>
      <Card className="border-0 shadow-lg -mt-16">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white">
              <AvatarImage src={avatarSrc} alt={userDetails.name || "User Avatar"} />
              <AvatarFallback>
                {userDetails.name ? userDetails.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{userDetails.name || "No Name"}</h2>
                  <p className="text-muted-foreground">@{userDetails.userName}</p>
                </div>
                <Button
                  onClick={handleEdit}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(userDetails.status)} text-white`}>
                  {userDetails.status}
                </Badge>
                <Badge variant="outline">{userDetails.roleType}</Badge>
                <Badge variant="outline">{userDetails.roleName}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin View Section */}
      {(userDetails.roleType.toLowerCase() === "admin" ||
        userDetails.roleType.toLowerCase() === "superadmin") && (
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
                  <p>View user activity log</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Details Cards */}
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <EnvelopeClosedIcon className="h-4 w-4 text-orange-600" />
              <span>{userDetails.email || "No Email"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-orange-600" />
              <span>{userDetails.phoneNumber || "No Phone Number"}</span>
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
              <span>{userDetails.billingAddress || "No Billing Address"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-orange-600" />
              <span>
                {userDetails.createdAt
                  ? `Joined ${new Date(userDetails.createdAt).toLocaleDateString()}`
                  : "No Join Date"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

ProfilePage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
