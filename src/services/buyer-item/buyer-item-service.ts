import sendRequest from '../requests/request-service';
import RequestMethod from '../../enums/request-methods';
import Routes from "../../enums/routes";
import EndPointBuilder from "../routing/routingService";

export interface BuyerItem {
    productName: string;
    productPrice: number;
    productUrl: string;
    productOwner: string;
    buyerItemStatus: string;
  }
  
  export interface PendingOrder {
    purchaseOrderId: number;
    totalAmount: number;
    orderCreatedAt: string;
    buyerItems: BuyerItem[];
  }
  
  export interface BuyerItemDelivery {
    stage: string;
    stageDescription: string;
    stageDate: string;
  }
  
  export interface BuyerItemDetails {
    buyerItemId: number;
    productId: number;
    productName: string;
    productUrl: string;
    productOwner: string;
    buyerItemStatus: string;
    purchaseOrderId: number;
    refundableBoolean: boolean;
    remainingRefundDays: number;
    buyerItemDelivery: BuyerItemDelivery[];
  }

export async function getPendingOrder(): Promise<PendingOrder | null> {
  try {
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.ORDER)
      .addRoute('view-pending-order')
      .build();

    const response = await sendRequest(
      RequestMethod.GET,
      endpoint,
      null,
      true // This request requires authentication
    );

    if (response.success) {
      return response.data;
    } else {
      console.error('Failed to fetch pending order:', response.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching pending order:', error);
    return null;
  }
}

export async function cancelBuyerItem(purchaseOrderId: number, productId: number): Promise<{ success: boolean; message: string }> {
    try {
        console.log('Canceling item with purchaseOrderId:', purchaseOrderId, 'and productId:', productId);
      const endpoint = new EndPointBuilder()
        .addRoute(Routes.PRODUCT)
        .addRoute('cancel-item')
        .build();
  
      const response = await sendRequest(
        RequestMethod.DELETE,
        endpoint,
        { purchaseOrderId, productId },
        true // This request requires authentication
      );
  
      if (response.success) {
        return { success: true, message: response.message || "Item successfully canceled from the order." };
      } else {
        return { success: false, message: response.message || "Failed to cancel the item." };
      }
    } catch (error) {
      console.error('Error canceling buyer item:', error);
      return { success: false, message: "An unexpected error occurred while canceling the item." };
    }
  }

  export async function getToReceiveItems(): Promise<BuyerItemDetails[]> {
    try {
      const endpoint = new EndPointBuilder()
        .addRoute('buyer-item')
        .addRoute('to-receive')
        .build();
  
      const response = await sendRequest(
        RequestMethod.GET,
        endpoint,
        null,
        true
      );
  
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Failed to fetch to-receive items:', response.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching to-receive items:', error);
      return [];
    }
  }
  
  export async function getReceivedItems(): Promise<BuyerItemDetails[]> {
    try {
      const endpoint = new EndPointBuilder()
        .addRoute('buyer-item')
        .addRoute('received')
        .build();
  
      const response = await sendRequest(
        RequestMethod.GET,
        endpoint,
        null,
        true
      );
  
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Failed to fetch received items:', response.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching received items:', error);
      return [];
    }
  }
  
  export async function getRefundItems(): Promise<BuyerItemDetails[]> {
    try {
      const endpoint = new EndPointBuilder()
        .addRoute('buyer-item')
        .addRoute('refund')
        .build();
  
      const response = await sendRequest(
        RequestMethod.GET,
        endpoint,
        null,
        true
      );
  
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Failed to fetch refund items:', response.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching refund items:', error);
      return [];
    }
  }

  export interface RebateAmountDTO {
    productName: string;
    productId: number;
    rebateRate: number;
    finalPrice: number;
    deliveryFee: number;
  }
  
  export interface RebateAmountListDTO {
    purchaseOrderId: number;
    finalPrice: number;
    items: RebateAmountDTO[];
  }
  
  export async function fetchRebateAmountList(orderId: number): Promise<RebateAmountListDTO | null> {
    try {
      const endpoint = new EndPointBuilder()
        .addRoute(Routes.PRODUCT)
        .addRoute(`fetch-rebate-amount-list/${orderId}`)
        .build();
  
      const response = await sendRequest(
        RequestMethod.GET,
        endpoint,
        null,
        true // This request requires authentication
      );
  
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error('Failed to fetch rebate amount list:', response.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching rebate amount list:', error);
      return null;
    }
  }

  interface MakePaymentDTO {
    purchaseOrderId: number;
    finalPrice: number;
    rebateItems: {
      productName: string;
      productId: number;
      rebateRate: number;
      finalPrice: number;
      deliveryFee: number;
    }[];
  }
  
  export async function makePayment(paymentData: MakePaymentDTO): Promise<{ success: boolean; message: string }> {
    try {
      const endpoint = new EndPointBuilder()
        .addRoute(Routes.ORDER)
        .addRoute('make-payment')
        .build();
  
      const response = await sendRequest(
        RequestMethod.POST,
        endpoint,
        paymentData,
        true // This request requires authentication
      );
  
      if (response.success) {
        return { success: true, message: response.message || "Payment successful" };
      } else {
        return { success: false, message: response.message || "Payment failed" };
      }
    } catch (error) {
      console.error('Error making payment:', error);
      return { success: false, message: "An unexpected error occurred while processing the payment" };
    }
  }

  export async function requestRefund(buyerItemId: number): Promise<{ success: boolean; message: string }> {
    try {
      const endpoint = new EndPointBuilder()
        .addRoute(Routes.BuyerItem)
        .addRoute(`request-refund`)
        .addQuery(`BuyerItemId=${buyerItemId}`)
        .build();
  
      const response = await sendRequest(
        RequestMethod.POST,
        endpoint,
        null,
        true // This request requires authentication
      );
  
      if (response.success) {
        return { success: true, message: response.message || "Refund request submitted successfully" };
      } else {
        return { success: false, message: response.message || "Failed to submit refund request" };
      }
    } catch (error) {
      console.error('Error requesting refund:', error);
      return { success: false, message: "An unexpected error occurred while requesting the refund" };
    }
  }

  export async function cancelRefundRequest(buyerItemId: number): Promise<{ success: boolean; message: string }> {
    try {
      const endpoint = new EndPointBuilder()
        .addRoute(Routes.PRODUCT)
        .addRoute('rejectcancel-refund')
        .build();
  
      const response = await sendRequest(
        RequestMethod.POST,
        endpoint,
        { BuyerItemId: buyerItemId },
        true // This request requires authentication
      );
  
      if (response.success) {
        return { success: true, message: response.message || "Refund request has been successfully rejected." };
      } else {
        return { success: false, message: response.message || "Failed to reject refund request" };
      }
    } catch (error) {
      console.error('Error canceling refund request:', error);
      return { success: false, message: "An unexpected error occurred while canceling the refund request" };
    }
  }

  export async function getAllBuyerItems(): Promise<BuyerItem[]> {
    try {
      const endpoint = new EndPointBuilder()
        .addRoute('buyer-item')
        .addRoute('get-all')
        .build();
  
      const response = await sendRequest(
        RequestMethod.GET,
        endpoint,
        null,
        true // This request requires authentication
      );
  
      if (response && response.success && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Failed to fetch buyer items:',  response?.message  || "Failed to fetch buyer items");
        return [];
      }
    } catch (error) {
      console.error('Error fetching buyer items:', error);
      return [];
    }
  }
  
  export async function updateDeliveryStageArrivedSortingFacility(buyerItemId: number): Promise<{ success: boolean; message: string; data?: { message: string } }> {
    try {
      const endpoint = new EndPointBuilder()
        .addRoute('buyer-item')
        .addRoute('create-stage')
        .addRoute('arrived-sorting-facility')
        .addQuery(`buyerItemId=${buyerItemId}`)
        .build();
  
      const response = await sendRequest(
        RequestMethod.POST,
        endpoint,
        null,
        true
      );
  
      if (response.success) {
        return { 
          success: true, 
          message: response?.message || "Delivery stage 'Arrived in Sorting Facility' created successfully.",
          data: response?.data
        };
      } else {
        return { success: false, message: response.message || "Failed to update delivery stage." };
      }
    } catch (error) {
      console.error('Error updating delivery stage:', error);
      return { success: false, message: "An unexpected error occurred while updating the delivery stage." };
    }
  }
  
  export async function updateDeliveryStageArrivedDeliveryHub(buyerItemId: number): Promise<{ success: boolean; message: string; data?: { message: string } }> {
    try {
      const endpoint = new EndPointBuilder()
        .addRoute('buyer-item')
        .addRoute('create-stage')
        .addRoute('arrived-delivery-hub')
        .addQuery(`buyerItemId=${buyerItemId}`)
        .build();
  
      const response = await sendRequest(
        RequestMethod.POST,
        endpoint,
        null,
        true
      );
  
      if (response.success) {
        return { 
          success: true, 
          message: response?.message || "Delivery stage 'Arrived in Sorting Delivery Hub' created successfully.",
          data: response?.data
        };
      } else {
        return { success: false, message: response.message || "Failed to update delivery stage." };
      }
    } catch (error) {
      console.error('Error updating delivery stage:', error);
      return { success: false, message: "An unexpected error occurred while updating the delivery stage." };
    }
  }
  
  export async function updateDeliveryStageOutForDelivery(buyerItemId: number): Promise<{ success: boolean; message: string; data?: { message: string } }> {
    try {
      const endpoint = new EndPointBuilder()
        .addRoute('buyer-item')
        .addRoute('create-stage')
        .addRoute('out-for-delivery')
        .addQuery(`buyerItemId=${buyerItemId}`)
        .build();
  
      const response = await sendRequest(
        RequestMethod.POST,
        endpoint,
        null,
        true
      );
  
      if (response.success) {
        return { 
          success: true, 
          message: response?.message || "Delivery stage 'Out for Delivery' created successfully.",
          data: response?.data
        };
      } else {
        return { success: false, message: response.message || "Failed to update delivery stage." };
      }
    } catch (error) {
      console.error('Error updating delivery stage:', error);
      return { success: false, message: "An unexpected error occurred while updating the delivery stage." };
    }
  }

  export async function updateDeliveryStageItemDelivered(buyerItemId: number): Promise<{ success: boolean; message: string; data?: { message: string } }> {
    try {
      const endpoint = new EndPointBuilder()
        .addRoute('buyer-item')
        .addRoute('create-stage')
        .addRoute('item-delivered')
        .addQuery(`buyerItemId=${buyerItemId}`)
        .build();
  
      const response = await sendRequest(
        RequestMethod.POST,
        endpoint,
        null,
        true
      );
  
      if (response.success) {
        return { 
          success: true, 
          message: response?.message || "Delivery stage 'Item Delivered' created successfully.",
          data: response?.data
        };
      } else {
        return { success: false, message: response.message || "Failed to update delivery stage." };
      }
    } catch (error) {
      console.error('Error updating delivery stage:', error);
      return { success: false, message: "An unexpected error occurred while updating the delivery stage." };
    }
  }
  
  export async function acceptRefundRequest(buyerItemId: number): Promise<{ success: boolean; message: string }> {
    try {
      const endpoint = new EndPointBuilder()
        .addRoute(Routes.PRODUCT)
        .addRoute('accept-refund')
        .build();
  
      const response = await sendRequest(
        RequestMethod.POST,
        endpoint,
        { BuyerItemId: buyerItemId },
        true // This request requires authentication
      );
  
      if (response?.success) {
        return { success: true, message: response?.message || "Refund request has been successfully accepted." };
      } else {
        return { success: false, message: response.message || "Failed to accept refund request" };
      }
    } catch (error) {
      console.error('Error accepting refund request:', error);
      return { success: false, message: "An unexpected error occurred while accepting the refund request" };
    }
  }

  interface RefundBuyerItemResponse {
    BuyerItemId: number;
  }
  
  export async function getRefundBuyerItemId(productId: number): Promise<{ success: boolean; message: string; data?: RefundBuyerItemResponse }> {
    try {
      const endpoint = new EndPointBuilder()
        .addRoute(Routes.PRODUCT)
        .addRoute('get-refund-product-buyer-item-id')
        .addQuery(`productId=${productId}`)
        .build();
  
      const response = await sendRequest(
        RequestMethod.GET,
        endpoint,
        null,
        true // This request requires authentication
      );
  
      if (response.success) {
        return {
          success: true,
          message: response?.message || "Successfully retrieved refund buyer item ID.",
          data: response?.data
        };
      } else {
        return {
          success: false,
          message: response.message || "Failed to retrieve refund buyer item ID.",
        };
      }
    } catch (error) {
      console.error('Error getting refund buyer item ID:', error);
      return {
        success: false,
        message: "An unexpected error occurred while retrieving the refund buyer item ID.",
      };
    }
  }
  
