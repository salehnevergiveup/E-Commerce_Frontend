"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WalletService from "@/services/wallet/wallet-service";
import { useSearchParams } from "next/navigation";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function TopUpSuccessful() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [balance, setBalance] = useState({ availableBalance: 0 });
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load wallet balance
  const loadBalance = async () => {
    try {
      const balanceData = await WalletService.fetchBalance();
      if (balanceData.success) {
        setBalance({
          availableBalance: balanceData.data?.availableBalance || 0,
        });
        setUpdatedAt(balanceData.data?.updated_at || new Date().toISOString());
      } else {
        console.error("Failed to fetch balance data:", balanceData.message);
      }
    } catch (error) {
      console.error("Failed to load balance:", error);
    }
  };

  // Verify payment session
  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      fetch(`stripe/public/verify-session?session_id=${sessionId}`) //
        .then((res) => {
          console.log("Verify session response:", res.status, res.statusText);

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Verify session response:", data);
          if (data.status === "success") {
            setTopUpAmount(data.amount || 0);
            setPaymentStatus("successful");
            loadBalance(); // Load balance after verification
          } else {
            setPaymentStatus("failed");
            setError(data.message || "Failed to verify payment session.");
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error verifying session:", error);
          setPaymentStatus("failed");
          setError("An unexpected error occurred during session verification.");
          setLoading(false);
        });
    } else {
      setPaymentStatus("failed");
      setError("Session ID is missing. Please try again.");
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) return <p>Loading...</p>;

  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
        <Card className="mx-auto max-w-md border-red-100">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-red-600">
              Top-Up Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-lg text-gray-600">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => router.push("/user/profile?tab=balance")}
              className="bg-red-500 hover:bg-red-600 text-white w-full max-w-xs"
            >
              Return to Wallet
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleConfirm = () => {
    router.push("/user/profile?tab=balance");
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
      <Card className="mx-auto max-w-md border-orange-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-orange-600">
            Top-Up Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg text-gray-600">
              Your wallet has been successfully topped up.
            </p>
            <Badge className="bg-green-100 text-green-700 text-sm">
              Top-Up Amount: MYR {topUpAmount.toFixed(2)}
            </Badge>
            <Badge className="bg-green-100 text-green-700 text-sm">
              Available Balance: MYR {balance.availableBalance.toFixed(2)}
            </Badge>
            <div className="w-full border-t border-orange-200" />
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Top Up Time:</span>
                <span className="font-medium text-gray-900">
                  {updatedAt
                    ? new Date(updatedAt).toLocaleString()
                    : "Loading..."}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={handleConfirm}
            className="bg-orange-500 hover:bg-orange-600 text-white w-full max-w-xs"
          >
            Confirm
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default TopUpSuccessful;