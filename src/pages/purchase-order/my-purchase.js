import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import UserLayout from "@/layouts/user-layout";
import AuthGuard from "@/components/auth-guard";
import { sendRequest } from "@/services/requests/request-service";
import RequestMethods from "@/enums/request-methods";
import { Toaster, toast } from "react-hot-toast";
import { getPendingOrder, cancelBuyerItem, getToReceiveItems, getReceivedItems, getRefundItems, fetchRebateAmountList, makePayment, requestRefund,cancelRefundRequest } from "@/services/buyer-item/buyer-item-service";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RebateListForm from '@/components/RebateListForm';
import RefundConfirmationDialog from '@/components/RefundConfirmationDialog';
import CancelRefundConfirmationDialog from '@/components/CancelRefundConfirmationDialog';

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error) => {
      console.error('Caught an error:', error);
      setHasError(true);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return <h1>Something went wrong. Please try again later.</h1>;
  }

  return children;
}

function MyPurchasePage() {
  const [purchases, setPurchases] = useState({
    toPay: [],
    toReceive: [],
    received: [],
    refund: []
  });
  const [pendingOrderDetails, setPendingOrderDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('toPay');
  const [isLoading, setIsLoading] = useState(true);
  const [isRebateFormOpen, setIsRebateFormOpen] = useState(false);
  const [rebateData, setRebateData] = useState(null);
  const [refundConfirmation, setRefundConfirmation] = useState({ isOpen: false, itemId: null, itemName: '' });
  const scrollRef = useRef(null);
  const [cancelRefundConfirmation, setCancelRefundConfirmation] = useState({ isOpen: false, itemId: null, itemName: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'toPay':
          await fetchPurchaseHistory();
          await fetchPendingOrder();
          break;
        case 'toReceive':
          const toReceiveItems = await getToReceiveItems();
          setPurchases(prev => ({ ...prev, toReceive: toReceiveItems }));
          break;
        case 'received':
          const receivedItems = await getReceivedItems();
          setPurchases(prev => ({ ...prev, received: receivedItems }));
          break;
        case 'refund':
          const refundItems = await getRefundItems();
          setPurchases(prev => ({ ...prev, refund: refundItems }));
          break;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPurchaseHistory = async () => {
    setIsLoading(true);
    try {
      const response = await sendRequest(
        RequestMethods.GET,
        '/purchase-order/history',
        null,
        true
      );

      if (response.success) {
        const categorizedPurchases = {
          toPay: [],
          toReceive: [],
          toRefund: []
        };

        response.data.forEach(purchase => {
          if (purchase.status === 'PENDING_PAYMENT') {
            categorizedPurchases.toPay.push(purchase);
          } else if (purchase.status === 'SHIPPED') {
            categorizedPurchases.toReceive.push(purchase);
          } else if (purchase.status === 'REFUND_REQUESTED') {
            categorizedPurchases.toRefund.push(purchase);
          }
        });

        setPurchases(prev => ({ ...prev, ...categorizedPurchases }));
      } else {
        toast.error(response.message || "Failed to fetch purchase history.");
      }
    } catch (error) {
      console.error("Fetch Purchase History Error:", error);
      toast.error("An error occurred while fetching purchase history.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingOrder = async () => {
    try {
      const order = await getPendingOrder();
      console.log('Fetched pending order:', order);
      setPendingOrderDetails(order || null);
    } catch (error) {
      console.error("Error fetching pending order:", error);
      toast.error("Failed to fetch pending order. Please try again later.");
      setPendingOrderDetails(null);
    }
  };

  const handleCancelItem = async (purchaseOrderId, productId) => {
    console.log('Canceling item with purchaseOrderId:', purchaseOrderId, 'and productId:', productId);
    try {
      const result = await cancelBuyerItem(purchaseOrderId, productId);
      if (result.success) {
        toast.success(result.message);
        await fetchPendingOrder(); // Refresh the pending order
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error canceling item:", error);
      toast.error("An unexpected error occurred while canceling the item.");
    }
  };

  const handleRefundItem = (buyerItemId, itemName) => {
    setRefundConfirmation({ isOpen: true, itemId: buyerItemId, itemName });
  };

  const handleCancelRefund = (buyerItemId, itemName) => {
    setCancelRefundConfirmation({ isOpen: true, itemId: buyerItemId, itemName });
  };

  const handleMakePayment = async () => {
    if (pendingOrderDetails) {
      try {
        const rebateList = await fetchRebateAmountList(pendingOrderDetails.purchaseOrderId);
        setRebateData(rebateList);
        setIsRebateFormOpen(true);
      } catch (error) {
        console.error("Error fetching rebate list:", error);
        toast.error("Failed to fetch rebate details. Please try again.");
      }
    }
  };

  const handleProceedPayment = async (paymentData) => {
    try {
      const result = await makePayment(paymentData);
      if (result.success) {
        toast.success(result.message);
        setIsRebateFormOpen(false);
        setActiveTab('toPay');
        await fetchData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('An unexpected error occurred while processing the payment');
    }
  };

  const confirmRefund = async () => {
    const { itemId } = refundConfirmation;
    setRefundConfirmation({ isOpen: false, itemId: null, itemName: '' });

    try {
      const result = await requestRefund(itemId);
      if (result.success) {
        toast.success(result.message);
        await fetchData(); // Refresh the data after refund request
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error requesting refund:", error);
      toast.error("An unexpected error occurred while requesting the refund.");
    }
  };

  const confirmCancelRefund = async () => {
    const { itemId } = cancelRefundConfirmation;
    setCancelRefundConfirmation({ isOpen: false, itemId: null, itemName: '' });

    try {
      const result = await cancelRefundRequest(itemId);
      if (result.success) {
        toast.success(result.message);
        await fetchData(); // Refresh the data after canceling refund request
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error canceling refund request:", error);
      toast.error("An unexpected error occurred while canceling the refund request.");
    }
  };

  const renderPendingOrder = () => {
    if (!pendingOrderDetails) return null;

    return (
      <div className="mb-8 sticky top-0 bg-white z-10 p-4 shadow-md rounded-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold mb-2">Purchase Order</h3>
          <Button variant="default" onClick={handleMakePayment}>
            Make Payment
          </Button>
        </div>
        <p>Order ID: {pendingOrderDetails.purchaseOrderId ?? 'N/A'}</p>
        <p>Total Amount: ${pendingOrderDetails.totalAmount?.toFixed(2) ?? 'N/A'}</p>
        <p>Created At: {pendingOrderDetails.orderCreatedAt ? new Date(pendingOrderDetails.orderCreatedAt).toLocaleString() : 'N/A'}</p>
      </div>
    );
  };

  const renderBuyerItems = () => {
    if (!pendingOrderDetails?.buyerItems?.length) return null;

    return (
      <div className="mt-4">
        <div className="space-y-4">
          {pendingOrderDetails.buyerItems.map((item, index) => (
            <BuyerItemCard 
              key={index} 
              item={item} 
              purchaseOrderId={pendingOrderDetails.purchaseOrderId}
              onCancelItem={handleCancelItem}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderBuyerItemDetails = (items) => {
    if (items.length === 0) {
      return <p className="text-center py-4">No items found</p>;
    }

    return (
      <div className="space-y-4">
        {items.map((item) => (
          <BuyerItemDetailsCard 
            key={item.buyerItemId} 
            item={item} 
            activeTab={activeTab}
            onRefundItem={handleRefundItem}
            onCancelRefund={handleCancelRefund}
          />
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'toPay':
        return (
          <>
            {renderPendingOrder()}
            {renderBuyerItems()}
            {purchases.toPay.length === 0 && !pendingOrderDetails && (
              <p className="text-center py-4">No purchase order found</p>
            )}
          </>
        );
      case 'toReceive':
        return renderBuyerItemDetails(purchases.toReceive);
      case 'received':
        return renderBuyerItemDetails(purchases.received);
      case 'refund':
        return renderBuyerItemDetails(purchases.refund);
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">My Purchase History</CardTitle>
            <div className="flex space-x-2 mt-4">
              <Button 
                variant={activeTab === 'toPay' ? 'default' : 'outline'}
                onClick={() => setActiveTab('toPay')}
              >
                To Pay
              </Button>
              <Button 
                variant={activeTab === 'toReceive' ? 'default' : 'outline'}
                onClick={() => setActiveTab('toReceive')}
              >
                To Receive
              </Button>
              <Button 
                variant={activeTab === 'received' ? 'default' : 'outline'}
                onClick={() => setActiveTab('received')}
              >
                Completed
              </Button>
              <Button 
                variant={activeTab === 'refund' ? 'default' : 'outline'}
                onClick={() => setActiveTab('refund')}
              >
                Refund
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4">Loading data...</p>
            ) : (
              <div ref={scrollRef} className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {renderContent()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster position="top-right" />
      <RebateListForm
        isOpen={isRebateFormOpen}
        onClose={() => setIsRebateFormOpen(false)}
        onPaymentSuccess={handleProceedPayment}
        rebateData={rebateData}
      />
      <RefundConfirmationDialog
        isOpen={refundConfirmation.isOpen}
        onClose={() => setRefundConfirmation({ isOpen: false, itemId: null, itemName: '' })}
        onConfirm={confirmRefund}
        itemName={refundConfirmation.itemName}
      />
      <CancelRefundConfirmationDialog
        isOpen={cancelRefundConfirmation.isOpen}
        onClose={() => setCancelRefundConfirmation({ isOpen: false, itemId: null, itemName: '' })}
        onConfirm={confirmCancelRefund}
        itemName={cancelRefundConfirmation.itemName}
      />
    </ErrorBoundary>
  );
}

const BuyerItemCard = ({ item, purchaseOrderId, onCancelItem }) => (
  <Card>
    <CardContent className="p-4 flex items-start space-x-4">
      <Image
        src={item.productUrl ?? '/placeholder.svg'}
        alt={item.productName ?? 'Product Image'}
        width={100}
        height={100}
        className="object-cover rounded-md"
      />
      <div className="flex-grow">
        <h4 className="font-bold">{item.productName ?? 'Unnamed Product'}</h4>
        <p>Price: ${item.productPrice?.toFixed(2) ?? 'N/A'}</p>
        <Button 
          variant="destructive" 
          size="sm" 
          className="mt-2"
          onClick={() => onCancelItem(purchaseOrderId, item.productId)}
        >
          Cancel Item
        </Button>
      </div>
    </CardContent>
  </Card>
);

const BuyerItemDetailsCard = ({ item, activeTab, onRefundItem, onCancelRefund }) => (
  <Card>
    <CardContent className="p-4 flex items-start space-x-4">
      <Image
        src={item.productUrl ?? '/placeholder.svg'}
        alt={item.productName ?? 'Product Image'}
        width={100}
        height={100}
        className="object-cover rounded-md"
      />
      <div className="flex-grow">
        <h4 className="font-bold">{item.productName}</h4>
        <p>Status: {item.buyerItemStatus}</p>
        <p>Seller: {item.productOwner}</p>
        {activeTab === 'received' && item.refundableBoolean && item.remainingRefundDays > 0 && (
          <p>Refundable for next {item.remainingRefundDays} days</p>
        )}
        <div className="flex space-x-2 mt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                View Delivery Details
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="text-orange-600">Delivery Details</DialogTitle>
              </DialogHeader>
              <DeliveryDetails deliveryStages={item.buyerItemDelivery} />
            </DialogContent>
          </Dialog>
          {activeTab === 'received' && item.refundableBoolean && item.remainingRefundDays > 0 && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onRefundItem(item.buyerItemId, item.productName)}
            >
              Refund Item
            </Button>
          )}
          {activeTab === 'refund' && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onCancelRefund(item.buyerItemId, item.productName)}
            >
              Cancel Refund
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const DeliveryDetails = ({ deliveryStages }) => (
  <div className="space-y-4 bg-white p-4 rounded-lg">
    {deliveryStages.map((stage, index) => (
      <div key={index} className="border-l-2 border-orange-500 pl-4">
        <h5 className="font-semibold text-orange-600">{stage.stage}</h5>
        <p className="text-gray-700">{stage.stageDescription}</p>
        <p className="text-sm text-gray-500">{new Date(stage.stageDate).toLocaleString()}</p>
      </div>
    ))}
  </div>
);

MyPurchasePage.getLayout = function getLayout(page) {
  return <UserLayout>{page}</UserLayout>;
};

export default MyPurchasePage;

