// src/components/NavbarCartComponent.jsx
import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  startConnection, 
  subscribeToEvent, 
  stopConnection 
} from '@/services/websocket/websocket-service';

export default function NavbarCartComponent() {
  const [cart, setCart] = useState({ numberOfItems: 0, totalPrice: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hubName = 'cartHub';
    const connection = startConnection(hubName);

    if (connection) {
      subscribeToEvent(hubName, 'ReceiveCartUpdate', (cartInfo) => {
        setCart({
          numberOfItems: cartInfo.numberOfItems,
          totalPrice: cartInfo.totalPrice,
        });
        setIsLoading(false);
      });
    }

    // Cleanup on unmount
    return () => {
      stopConnection(hubName);
    };
  }, []);

  const totalItems = cart.numberOfItems;
  const totalPrice = cart.totalPrice;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 px-2 py-1 text-xs">
              {totalItems}
            </Badge>
          )}
          <span className="sr-only">Shopping cart</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Your Cart</h4>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${totalItems} items in your cart`}
            </p>
          </div>
          {!isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                {/* Optionally, render detailed cart items here */}
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center font-medium">
                  <span>Total:</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            </div>
          )}
          <Link href="/user/checkout">
            <Button className="w-full bg-orange-500 hover:bg-orange-600">View Cart</Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
