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
export interface ListingItem {
  productId: number;
  categoryId: number;
  productTitle: string;
  productPrice: number;
  productStatus: string;
  productPaymentStatus: string;
  mediaUrl: string | null;
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

    return response?.data;
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

export async function getAvailableProducts(): Promise<ListingItem[]> {
  try {
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.PRODUCT)
      .addRoute('get-available-product')
      .build();

    const response = await sendRequest(
      RequestMethod.GET,
      endpoint,
      null,
      true // This request requires authentication
    );

    if (response.error) {
      throw new Error(response.message);
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching available products:', error);
    return [];
  }
}

export async function getNotAvailableProducts(): Promise<ListingItem[]> {
  try {
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.PRODUCT)
      .addRoute('get-not-available-product')
      .build();

    const response = await sendRequest(
      RequestMethod.GET,
      endpoint,
      null,
      true
    );

    if (response.error) {
      throw new Error(response.message);
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching not available products:', error);
    return [];
  }
}

export async function getSoldOutProducts(): Promise<ListingItem[]> {
  try {
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.PRODUCT)
      .addRoute('get-sold-out-product')
      .build();

    const response = await sendRequest(
      RequestMethod.GET,
      endpoint,
      null,
      true
    );

    if (response.error) {
      throw new Error(response.message);
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching sold out products:', error);
    return [];
  }
}

export async function getRequestRefundProducts(): Promise<ListingItem[]> {
  try {
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.PRODUCT)
      .addRoute('get-request-refund-product')
      .build();

    const response = await sendRequest(
      RequestMethod.GET,
      endpoint,
      null,
      true
    );

    if (response.error) {
      throw new Error(response.message);
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching refund request products:', error);
    return [];
  }
}
export interface CreateProductDTO {
  categoryId: number;
  mediaBoolean: boolean;
  title: string;
  description: string;
  price: number;
  refundGuaranteedDuration: number;
  media: {
    id: number;
    mediaUrl: string;
    createdAt: string;
    updatedAt: string | null;
  }[];
}

export interface SingleProductDetails {
  productId: number;
  title: string;
  description: string;
  price: number;
  refundGuaranteedDuration: number;
  productCategoryName: string;
  createdAt: string;
  userId: number;
  userName: string;
  media: Media[];
  categoryId: number;
}

export async function createProduct(productData: CreateProductDTO): Promise<{ success: boolean; message: string }> {
  try {
    console.log("the new create product : productData",productData)
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.PRODUCT)
      .addRoute('create-product')
      .build();

    const response = await sendRequest(
      RequestMethod.POST,
      endpoint,
      productData,
      true // This request requires authentication
    );

    if (response?.success) {
      return { success: true, message: response?.data?.message || "Product created successfully" };
    } else {
      return { success: false, message: response?.message || "Failed to create product" };
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, message: "An unexpected error occurred while creating the product" };
  }
}

export async function getSingleProductDetails(productId: number): Promise<SingleProductDetails | null> {
  try {
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.PRODUCT)
      .addRoute('get-singleproduct-details')
      .addQuery(`productId=${productId}`)
      .build();

    const response = await sendRequest(
      RequestMethod.GET,
      endpoint,
      null,
      true
    );

    if (response.success) {
      return response.data;
    } else {
      console.error('Failed to fetch product details:', response.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
}

export async function deleteProduct(productId: number): Promise<{ success: boolean; message: string }> {
  try {
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.PRODUCT)
      .addRoute('delete-product')
      .addQuery(`productId=${productId}`)
      .build();

    const response = await sendRequest(
      RequestMethod.DELETE,
      endpoint,
      null,
      true
    );

    if (response.success) {
      return { success: true, message: response.data?.message || "Product Update Successfully"};
    } else {
      return { success: false, message: response.message || "Failed to delete product" };
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, message: "An unexpected error occurred while deleting the product" };
  }
}

export interface EditProductDTO {
  productId: number;
  categoryId: number;
  mediaBoolean: boolean;
  title: string;
  description: string;
  price: number;
  refundGuaranteedDuration: number;
  productStatus: 'available' | 'not available';
  updateMediaBoolean: boolean;
  media: {
    id: number;
    mediaUrl: string;
    createdAt: string;
    updatedAt: string | null;
  }[];
}

export async function editProduct(productData: EditProductDTO): Promise<{ success: boolean; message: string }> {
  try {
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.PRODUCT)
      .addRoute('edit-product')
      .build();

    const response = await sendRequest(
      RequestMethod.PUT,
      endpoint,
      productData,
      true
    );

    if (response.success) {
      return { success: true, message: response.data?.message || "Product Update Successfully"};
    } else {
      return { success: false, message: response.message || "Failed to update product" };
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, message: "An unexpected error occurred while updating the product" };
  }
}
