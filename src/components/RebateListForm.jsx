import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { makePayment } from '@/services/buyer-item/buyer-item-service';
import { toast } from 'react-hot-toast';

const RebateListForm = ({ isOpen, onClose, onPaymentSuccess, rebateData }) => {
  if (!rebateData) return null;

  const handleProceedPayment = async () => {
    if (!rebateData) return;

    const paymentData = {
      purchaseOrderId: rebateData.purchaseOrderId,
      finalPrice: rebateData.finalPrice,
      rebateItems: rebateData.items.map(item => ({
        productName: item.productName,
        productId: item.productId,
        rebateRate: item.rebateRate,
        finalPrice: item.finalPrice,
        deliveryFee: item.deliveryFee
      }))
    };

    await onPaymentSuccess(paymentData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-orange-600">Rebate Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Button variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-50">           
            Change Address Details
          </Button>
          <div className="bg-orange-100 p-4 rounded-md sticky top-0 z-10 shadow-md">
            <p className="font-bold text-lg text-orange-800">Order ID: {rebateData.purchaseOrderId}</p>
            <p className="font-bold text-xl text-orange-600">Total Price: ${rebateData.finalPrice.toFixed(2)}</p>
          </div>
          <ScrollArea className="h-[300px] rounded-md border border-orange-200 p-4">
            {rebateData.items.map((item, index) => (
              <div key={index} className="mb-4 pb-4 border-b border-orange-200 last:border-b-0">
                <h3 className="font-bold text-lg text-orange-800">{item.productName}</h3>
                <p className="text-gray-600">Product ID: {item.productId}</p>
                <p className="text-orange-600 font-semibold">Rebate Rate: {item.rebateRate}%</p>
                <p className="text-gray-600">Delivery Fee: ${item.deliveryFee.toFixed(2)}</p>
                <p className="font-bold">Final Price: ${item.finalPrice.toFixed(2)}</p>
                
              </div>
            ))}
          </ScrollArea>
        </div>
        <DialogFooter className="mt-6 space-x-2">
          <Button variant="outline" onClick={onClose} className="border-orange-600 text-orange-600 hover:bg-orange-50">
            Close
          </Button>
          <Button onClick={handleProceedPayment} className="bg-orange-600 text-white hover:bg-orange-700">
            Proceed to Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RebateListForm;

