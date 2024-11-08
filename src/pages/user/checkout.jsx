// src/pages/user/checkout-page2.jsx

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, ShoppingCart, Trash2, AlertTriangle, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import UserLayout from '@/layouts/user-layout';
import SelectState from '@/components/select-state';
import SelectCity from '@/components/select-city';
import { sendRequest } from '@/services/requests/request-service';
import RequestMethods from '@/enums/request-methods';
import AuthGuard from '@/components/auth-guard';

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog'; // Ensure this path is correct

function Logo() {
    return (
        <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="white" />
            <path
                d="M10 15H30M10 20H30M10 25H30"
                stroke="#F97316"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round" />
            <path
                d="M15 10L13 30M20 10L22 30M25 10L27 30"
                stroke="#F97316"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round" />
        </svg>
    )
}

function CheckoutPage() {
    const [step, setStep] = useState(0);
    const [cartData, setCartData] = useState(null); // Initialize as null
    const [shippingAddress, setShippingAddress] = useState({
        city: '',
        state: '',
        address: '',
        phone: '',
        zipcode: '',
        lat: 3.1390,
        lng: 101.6869,
    });

    const fetchCartData = async () => {
        try {
            // Append a cache-busting query parameter
            const response = await sendRequest(RequestMethods.GET, `/shoppingcart?_=${Date.now()}`, null, true);

            console.log("Response from fetchCartData:", response); // Debugging Log
            if (response.success) {
                const updatedData = {
                    ...response.data,
                    shoppingCartItems: response.data.shoppingCartItems || [],
                };
                setCartData(updatedData);
                console.log("Cart Data Updated:", updatedData); // Debugging Log
            } else {
                toast.error(response.message || "Failed to fetch cart data.");
                setCartData(null); // Optionally handle empty or error state
            }
        } catch (error) {
            console.error("Fetch Cart Data Error:", error);
            toast.error("An error occurred while fetching cart data.");
            setCartData(null); // Optionally handle error state
        }
    }

    useEffect(() => {
        fetchCartData();
    }, []);

    useEffect(() => {
        // Fetch cart data on step change to ensure real-time updates
        fetchCartData();
    }, [step]);

    const updateItemStatus = async (itemId, newStatus) => {
        console.log(`Updating item ${itemId} to status: ${newStatus}`);

        try {
            const response = await sendRequest(
                RequestMethods.PUT,
                `/cartitems/${itemId}`,
                { status: newStatus },
                true
            );

            console.log("Update response:", response);

            if (response.success) {
                setCartData(prevData => ({
                    ...prevData,
                    shoppingCartItems: prevData.shoppingCartItems.map(item =>
                        item.id === itemId ? { ...item, status: newStatus } : item
                    )
                }));
                console.log("Updated cartData after status change:", {
                    ...cartData,
                    shoppingCartItems: cartData.shoppingCartItems.map(item =>
                        item.id === itemId ? { ...item, status: newStatus } : item
                    )
                });

                if (newStatus === 'Disabled') {
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
    }

    const steps = [
        { title: 'Cart', component: <CartStep cartData={cartData} updateItemStatus={updateItemStatus} fetchCartData={fetchCartData} /> },
        { title: 'Shipping', component: <ShippingStep shippingAddress={shippingAddress} setShippingAddress={setShippingAddress} /> },
        { title: 'Review', component: <ReviewStep cartData={cartData} shippingAddress={shippingAddress} /> },
    ]

    // Compute if there's at least one available item
    const hasAvailableItems = cartData && cartData.shoppingCartItems.some(item =>
        item.status === 'Selected' && item.product.status.toLowerCase() === 'available'
    );

    const nextStep = async () => {
        // Fetch fresh data to ensure product statuses are up-to-date
        await fetchCartData();

        // Recompute hasAvailableItems after fetching fresh data
        const updatedHasAvailableItems = cartData && cartData.shoppingCartItems.some(item =>
            item.status === 'Selected' && item.product.status.toLowerCase() === 'available'
        );

        if (updatedHasAvailableItems) {
            setStep(prevStep => Math.min(prevStep + 1, steps.length - 1));
        } else {
            toast.error("You must have at least one available item in your cart to proceed.");
        }
    };

    const prevStepHandler = () => {
        setStep(prevStep => Math.max(prevStep - 1, 0));
    };

    return (
        <div className="container mx-auto p-4 bg-gray-50 pb-10">
            <Card className="w-full  mx-auto shadow-lg">
                <CardHeader
                    className="flex flex-row w-full items-center justify-between bg-orange-500 text-white">
                    <div className="flex items-center space-x-2">
                        <ShoppingBag className="h-10 bold w-10" />
                        <CardTitle className="text-2xl font-bold">Potato-Trade
                        </CardTitle>
                    </div>
                    <ShoppingCart className="h-6 w-6" />
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex justify-between mb-6">
                        {steps.map((s, index) => (
                            <div
                                key={index}
                                className={`flex items-center ${index <= step ? 'text-orange-500' : 'text-gray-400'}`}>
                                <div
                                    className={`w-8 h-8 rounded-full ${index <= step ? 'bg-orange-500' : 'bg-gray-200'} flex items-center justify-center text-white mr-2`}>
                                    {index + 1}
                                </div>
                                {s.title}
                            </div>
                        ))}
                    </div>
                    {cartData ? (
                        cartData.shoppingCartItems.length > 0 ? (
                            steps[step].component
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
                <CardFooter className="flex justify-between bg-gray-100 p-4">
                    <Button onClick={prevStepHandler} disabled={step === 0} variant="outline">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    {step === steps.length - 1 ? (
                        <Button
                            disabled
                            className="bg-green-500 hover:bg-green-600 text-white cursor-not-allowed">
                            Place Order <ShoppingCart className="ml-2 h-4 w-4" />
                            {/* TODO: Implement handlePlaceOrder function */}
                        </Button>
                    ) : (
                        <Button
                            onClick={nextStep}
                            className={`bg-orange-500 hover:bg-orange-600 text-white ${!hasAvailableItems ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!hasAvailableItems}>
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
            {/* Display a message if there are no available items */}
            {/* {!hasAvailableItems && cartData && cartData.shoppingCartItems.length > 0 && (
               toast.error("You must have at least one available item in your cart to proceed to Shipping.")
            )} */}
        </div>
    )
}

function CartStep({
    cartData,
    updateItemStatus,
    fetchCartData
}) {
    console.log("Cart Data in CartStep:", cartData);

    const [deleteItemId, setDeleteItemId] = useState(null);

    const confirmDelete = async () => {
        if (deleteItemId === null) return;

        try {
            console.log(`Confirming deletion of item ID: ${deleteItemId}`);
            const response = await sendRequest(
                RequestMethods.DELETE,
                `/cartitems/${deleteItemId}`,
                null,
                true
            );

            console.log("Delete response:", response);

            if (response.success) {
                toast.success("Item removed successfully!");
            } else {
                // Display the backend's error message if available
                toast.error(response.message || "Failed to delete the item.");
            }

            // Always refresh cart data to reflect the current state
            await fetchCartData();
        } catch (error) {
            console.error("Delete Item Error:", error);
            toast.error("An error occurred while deleting the item.");
        } finally {
            // Close the dialog
            setDeleteItemId(null);
        }
    };

    const handleDelete = (itemId) => {
        setDeleteItemId(itemId);
    };

    if (!cartData || !cartData.shoppingCartItems) {
        return <p>Loading cart items...</p>;
    }

    if (cartData.shoppingCartItems.length === 0) {
        return <p>Your cart is empty.</p>;
    }

    const total = cartData.shoppingCartItems
        .filter(item => item.status === 'Selected' && item.product.status.toLowerCase() === 'available')
        .reduce((sum, item) => sum + item.product.price, 0);

    console.log("Total Price in CartStep:", total);

    return (
        <div className="space-y-4">
            {cartData.shoppingCartItems.map(item => (
                <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg bg-white">
                    <Checkbox
                        checked={item.status === 'Selected'}
                        onCheckedChange={(checked) => {
                            console.log(`Checkbox for item ${item.id} changed to:`, checked);
                            if (item.product.status.toLowerCase() === 'unavailable') {
                                updateItemStatus(item.id, 'Disabled')
                            } else {
                                updateItemStatus(item.id, checked ? 'Selected' : 'Unselected')
                            }
                        }}
                        disabled={item.product.status.toLowerCase() === 'unavailable'} />
                    <Image
                        src={item.product.image || '/placeholder.png'} // Ensure /public/placeholder.png exists
                        alt={item.product.title}
                        width={80}
                        height={80}
                        className="object-cover rounded" />
                    <div className="flex-grow">
                        <h3 className="font-semibold">{item.product.title}</h3>
                        <p className={`text-sm ${item.product.status.toLowerCase() === 'available' ? 'text-green-500' : 'text-red-500'}`}>
                            {item.product.status.toLowerCase() === 'available' ? 'Available' : 'Unavailable'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold">${item.product.price.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Delete Item">
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            ))}
            <div className="flex justify-end">
                <p className="font-bold">Total: ${total.toFixed(2)}</p>
            </div>

            {/* Delete Confirmation AlertDialog */}
            <AlertDialog open={deleteItemId !== null} onOpenChange={() => setDeleteItemId(null)}>
                <AlertDialogContent className="bg-white text-center space-y-4">
                    <AlertDialogHeader className="flex flex-col items-center gap-2">
                        <AlertDialogTitle className="text-center">Delete Item</AlertDialogTitle>
                        <AlertTriangle className="h-10 w-10 text-red-500" />
                        <AlertDialogDescription className="text-center text-sm">
                            This action cannot be undone. This will permanently delete the item from your cart.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:flex-col space-y-2">
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 w-full"
                            onClick={confirmDelete}>
                            Delete
                        </AlertDialogAction>
                        <AlertDialogCancel className="w-full mt-2">Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function ShippingStep({
    shippingAddress,
    setShippingAddress
}) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="state">State</Label>
                    <SelectState
                        value={shippingAddress.state}
                        onChange={(value) => setShippingAddress(prev => ({ ...prev, state: value, city: '' }))}
                    />
                </div>
                <div>
                    <Label htmlFor="city">City</Label>
                    <SelectCity
                        state={shippingAddress.state}
                        value={shippingAddress.city}
                        onChange={(value) => setShippingAddress(prev => ({ ...prev, city: value }))}
                    />
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                        id="address"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter your street address"
                    />
                </div>
                {/* New Phone Number Field */}
                <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                    />
                </div>
                {/* New Zipcode Field */}
                <div>
                    <Label htmlFor="zipcode">Zipcode</Label>
                    <Input
                        id="zipcode"
                        type="text"
                        value={shippingAddress.zipcode}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, zipcode: e.target.value }))}
                        placeholder="Enter your zipcode"
                    />
                </div>
            </div>
            {/* Place Order functionality should be implemented here */}
        </div>
    )
}

function ReviewStep({
    cartData,
    shippingAddress
}) {
    if (!cartData) {
        return <p>Loading...</p>;
    }

    const selectedItems = cartData.shoppingCartItems.filter(item => item.status === 'Selected' && item.product.status.toLowerCase() === 'available');
    const totalPrice = selectedItems.reduce((sum, item) => sum + item.product.price, 0);

    console.log("ReviewStep - Selected Items:", selectedItems);
    console.log("ReviewStep - Total Price:", totalPrice);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <ul className="space-y-2">
                {selectedItems.map(item => (
                    <li key={item.id} className="flex justify-between">
                        <span>{item.product.title}</span>
                        <span>${item.product.price.toFixed(2)}</span>
                    </li>
                ))}
            </ul>
            <Separator />
            <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
            </div>
            <Separator />
            <div>
                <h3 className="text-lg font-semibold">Shipping Address</h3>
                <p>{shippingAddress.address}</p>
                <p>{shippingAddress.city}, {shippingAddress.state}</p>
                <p>Phone: {shippingAddress.phone}</p>
                <p>Zipcode: {shippingAddress.zipcode}</p>
            </div>
        </div>
    )

}

CheckoutPage.getLayout = function getLayout(page) {
    return <UserLayout>{page}</UserLayout>;
};

// Wrap CheckoutPage with AuthGuard
const WrappedCheckoutPage = AuthGuard(CheckoutPage, { allowedRoles: ['user'] });

// Ensure `getLayout` is passed along to the wrapped component
WrappedCheckoutPage.getLayout = CheckoutPage.getLayout;

export default WrappedCheckoutPage;