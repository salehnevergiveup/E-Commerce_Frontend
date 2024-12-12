"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WalletService from "@/services/wallet/wallet-service";

export default function WalletTopUp() {
  const router = useRouter();
  const [currentBalance, setBalance] = useState({
    availableBalance: 0,
  });
  const [amount, setAmount] = useState("");
  const topUpAmount = parseFloat(amount) || 0;
  const totalBalance = currentBalance.availableBalance + topUpAmount;

  const MIN_AMOUNT = 1;
  const MAX_AMOUNT = 100000;

  const handleCancel = () => {
    router.back();
  };

  const loadBalance = async () => {
    try {
      const balanceData = await WalletService.fetchBalance();
      if (balanceData.success) {
        setBalance({
          availableBalance: balanceData.data?.availableBalance || 0,
        });
      } else {
        console.error("Failed to fetch balance data:", balanceData.message);
      }
    } catch (error) {
      console.error("Failed to load balance:", error);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (
      value === "" ||
      (parseFloat(value) > 0 && parseFloat(value) <= MAX_AMOUNT)
    ) {
      setAmount(value);
    }
  };

  const handleTopUp = async (amount, currency = "MYR") => {
    console.log("handleTopUp called with amount:", amount);
    try {
      const response = await WalletService.createTopUpSession(amount, currency);

      if (response.success && response.data) {
        // Redirect user to Stripe Checkout page
        window.location.href = response.data;
      } else {
        console.error("Failed to create Stripe session:", response.message);
        alert(
          response.message || "Failed to initiate top-up. Please try again."
        );
      }
    } catch (error) {
      console.error("Error during top-up:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  };

  const isAmountValid = topUpAmount >= MIN_AMOUNT && topUpAmount <= MAX_AMOUNT;

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
      <Card className="mx-auto max-w-md border-orange-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            Top Up Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Enter Amount (MYR)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                MYR
              </span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                className="pl-12 border-orange-200 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0.00"
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                step="1"
              />
            </div>
            <p className="text-sm text-gray-600">
              Minimum top-up: MYR {MIN_AMOUNT.toFixed(2)} | Maximum top-up: MYR{" "}
              {MAX_AMOUNT.toFixed(2)}
            </p>
            {!isAmountValid && amount !== "" && (
              <p className="text-red-500 text-sm mt-1">
                Please enter an amount between MYR {MIN_AMOUNT.toFixed(2)} and
                MYR {MAX_AMOUNT.toFixed(2)}.
              </p>
            )}
          </div>
          <div className="space-y-3 rounded-lg bg-orange-50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Balance</span>
              <span className="font-medium">
                MYR {currentBalance.availableBalance.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Top Up Amount</span>
              <span className="font-medium">MYR {topUpAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-orange-100 pt-2">
              <div className="flex justify-between font-medium">
                <span className="text-gray-900">
                  Total Balance After Top Up
                </span>
                <span className="text-orange-600">MYR {totalBalance}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={() => handleTopUp(amount, "MYR")}
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={!isAmountValid}
          >
            Confirm Top Up
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
