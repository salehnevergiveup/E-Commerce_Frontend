import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/contexts/auth-context";
import sendRequest from "@/services/requests/request-service";
import RequestMethods from "@/enums/request-methods";

const ProfileMenu = ({ profileLink }) => {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("auth user data", authUser); 
        const response = await sendRequest(
          RequestMethods.GET,
          `/users/profile/${authUser.id}`,
          null,
          true 
        );
       console.log("data fetched from the profile", response);

        if (response.success) {
          setUser(response.data); 
        } else {
          setError(response.message || "Failed to fetch user data.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching user data.");
      } finally {
        setLoading(false); 
      }
    };

    if (authUser) {
      fetchUserProfile();
    } else {
      setLoading(false); 
    }
  }, [authUser]);

  const handleLogout = () => {
    logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          {/* Display user avatar or initials */}
          {user && user.avatar ? (
            <Image 
            src={user.avatar}
            alt="User"
            layout="fill"
            objectFit="cover"
            className="rounded-full" />
          ) : (
            <span className="inline-block h-8 w-8 rounded-full bg-gray-300 text-center text-white leading-8">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900">
        <DropdownMenuLabel className="text-gray-900 dark:text-white">
          {user?.name || "My Account"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-200">
          <Link href={profileLink} className="flex items-center w-full">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
