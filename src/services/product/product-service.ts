import sendRequest from '../requests/request-service';
import RequestMethod from '../../enums/request-methods';
import Routes from "../../enums/routes";
import EndPointBuilder from "../routing/routingService";

export interface Media {
  Id: number;
  MediaUrl: string;
  CreatedAt: string;
  UpdatedAt: string | null;
}

export interface Product {
  ProductId: number;
  Title: string;
  Description: string;
  Price: number;
  RefundGuaranteedDuration: number;
  ProductCategoryName: string;
  CreatedAt: string;
  UserId: number;
  UserName: string;
  Media: Media[];
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.PRODUCT)
      .addRoute('public')
      .addRoute('view-all-available-products')
      .build();

    const response = await sendRequest(
      RequestMethod.GET,
      endpoint,
      null,
      false
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  try {
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.PRODUCT)
      .addRoute('public')
      .addRoute('view-available-products-by-category')
      .build();

    const response = await sendRequest(
      RequestMethod.POST,
      endpoint,
      { productCategoryId: categoryId },
      false
    );

   
      return response.data;

  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}


export async function placeOrder(): Promise<{ success: boolean; message: string; orderId?: number }> {
  try {
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.PRODUCT)
      .addRoute('place-order')
      .build();

    const response = await sendRequest(
      RequestMethod.POST,
      endpoint,
      null,
      true // This request requires authentication
    );

    if (response.success) {
      const randomNumber = Math.floor(Math.random() * 10000);
      const orderId = response.data.purchaseOrderId;
      return {
        success: true,
        message: `Order Placed, view your order ${randomNumber}${orderId}`,
        orderId: orderId
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to place order"
      };
    }
  } catch (error) {
    console.error('Error placing order:', error);
    return {
      success: false,
      message: "An unexpected error occurred while placing the order"
    };
  }
}