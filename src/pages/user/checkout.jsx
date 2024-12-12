import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Trash2, AlertTriangle, ShoppingBag } from 'lucide-react';
import { toast } from "react-hot-toast";
import UserLayout from "@/layouts/user-layout";
import { sendRequest } from "@/services/requests/request-service";
import RequestMethods from "@/enums/request-methods";
import AuthGuard from "@/components/auth-guard";
import { placeOrder } from '@/services/product/product-service';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

function CheckoutPage() {
  const [cartData, setCartData] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const fetchCartData = async () => {
    try {
      const response = await sendRequest(
        RequestMethods.GET,
        `/shoppingcart?_=${Date.now()}`,
        null,
        true
      );

      if (response.success) {
        const updatedData = {
          ...response.data,
          shoppingCartItems: response.data.shoppingCartItems || [],
        };
        setCartData(updatedData);
      } else {
        toast.error(response.message || "Failed to fetch cart data.");
        setCartData(null);
      }
    } catch (error) {
      console.error("Fetch Cart Data Error:", error);
      toast.error("An error occurred while fetching cart data.");
      setCartData(null);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const updateItemStatus = async (itemId, newStatus) => {
    try {
      const response = await sendRequest(
        RequestMethods.PUT,
        `/cartitems/${itemId}`,
        { status: newStatus },
        true
      );

      if (response.success) {
        setCartData((prevData) => ({
          ...prevData,
          shoppingCartItems: prevData.shoppingCartItems.map((item) =>
            item.id === itemId ? { ...item, status: newStatus } : item
          ),
        }));

        if (newStatus === "Disabled") {
          toast.error("This product is no longer available.");
        } else {
          toast.success("Cart updated successfully!");
        }
      } else {
        toast.error(response.message || "Failed to update cart.");
      }
    } catch (error) {
      console.error("Update Item Status Error:", error);
      toast.error("An error occurred while updating the cart.");
    }
  };

  const confirmDelete = async () => {
    if (deleteItemId === null) return;

    try {
      const response = await sendRequest(
        RequestMethods.DELETE,
        `/cartitems/${deleteItemId}`,
        null,
        true
      );

      if (response.success) {
        toast.success("Item removed successfully!");
      } else {
        toast.error(response.message || "Failed to delete the item.");
      }

      await fetchCartData();
    } catch (error) {
      console.error("Delete Item Error:", error);
      toast.error("An error occurred while deleting the item.");
    } finally {
      setDeleteItemId(null);
    }
  };

  const handleDelete = (itemId) => {
    setDeleteItemId(itemId);
  };

  const handlePlaceOrder = async () => {
    try {
      const result = await placeOrder();
      if (result.success) {
        toast.success(result.message);
        await fetchCartData(); // Refresh the cart
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('An unexpected error occurred while placing the order');
    }
  };

  const total = cartData
    ? cartData.shoppingCartItems
        .filter(
          (item) =>
            item.status === "Selected" &&
            item.product.status.toLowerCase() === "available"
        )
        .reduce((sum, item) => sum + item.product.price, 0)
    : 0;

  return (
    <div className="container mx-auto p-4 bg-gray-50 pb-10">
      <Card className="w-full mx-auto shadow-lg">
        <CardHeader className="flex flex-row w-full items-center justify-between bg-orange-500 text-white">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-10 bold w-10" />
            <CardTitle className="text-2xl font-bold">Potato-Trade</CardTitle>
          </div>
          <ShoppingCart className="h-6 w-6" />
        </CardHeader>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
          {cartData ? (
            cartData.shoppingCartItems.length > 0 ? (
              <CartItems
                cartData={cartData}
                updateItemStatus={updateItemStatus}
                handleDelete={handleDelete}
                total={total}
              />
            ) : (
              <div className="flex justify-center items-center p-6">
                <p>Your cart is empty.</p>
              </div>
            )
          ) : (
            <div className="flex justify-center items-center p-6">
              <p>Loading cart data...</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end bg-gray-100 p-4">
          <Button
            onClick={handlePlaceOrder}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Place Order <ShoppingCart className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog
        open={deleteItemId !== null}
        onOpenChange={() => setDeleteItemId(null)}
      >
        <AlertDialogContent className="bg-white text-center space-y-4">
          <AlertDialogHeader className="flex flex-col items-center gap-2">
            <AlertDialogTitle className="text-center">
              Delete Item
            </AlertDialogTitle>
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <AlertDialogDescription className="text-center text-sm">
              This action cannot be undone. This will permanently delete the
              item from your cart.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col space-y-2">
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 w-full"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
            <AlertDialogCancel className="w-full mt-2">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CartItems({ cartData, updateItemStatus, handleDelete, total }) {
  return (
    <div className="space-y-4">
      {cartData.shoppingCartItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center space-x-4 p-4 border rounded-lg bg-white"
        >
          <Checkbox
            checked={item.status === "Selected"}
            onCheckedChange={(checked) => {
              if (item.product.status.toLowerCase() === "unavailable") {
                updateItemStatus(item.id, "Disabled");
              } else {
                updateItemStatus(item.id, checked ? "Selected" : "Unselected");
              }
            }}
            disabled={item.product.status.toLowerCase() === "unavailable"}
          />
          <Image
            src={item.product.image || "/placeholder.png"}
            alt={item.product.title}
            width={80}
            height={80}
            className="object-cover rounded"
          />
          <div className="flex-grow">
            <h3 className="font-semibold">{item.product.title}</h3>
            <p
              className={`text-sm ${
                item.product.status.toLowerCase() === "available"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {item.product.status.toLowerCase() === "available"
                ? "Available"
                : "Unavailable"}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold">${item.product.price.toFixed(2)}</p>
          </div>
          <button
            onClick={() => handleDelete(item.id)}
            className="text-red-500 hover:text-red-700"
            aria-label="Delete Item"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ))}
      <div className="flex justify-end">
        <p className="font-bold">Total: ${total.toFixed(2)}</p>
      </div>
    </div>
  );
}

CheckoutPage.getLayout = function getLayout(page) {
  return <UserLayout>{page}</UserLayout>;
};

const WrappedCheckoutPage = AuthGuard(CheckoutPage, { allowedRoles: ["user"] });
WrappedCheckoutPage.getLayout = CheckoutPage.getLayout;

export default WrappedCheckoutPage;

