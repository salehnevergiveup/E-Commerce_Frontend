import sendRequest from '../requests/request-service';
import RequestMethod from '../../enums/request-methods';
import Routes from "../../enums/routes";
import EndPointBuilder from "../routing/routingService";

export async function addToCart(productId) {
  try {
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.CartItems)
      .build();

    const response = await sendRequest(
      RequestMethod.POST,
      endpoint,
      { productId },
      true // This request requires authentication
    );
    
    if (response.success) {
      return { success: true, message: "Item successfully added to cart" };
    } else {
      return { success: false, message: response.message || "Failed to add item to cart" };
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

