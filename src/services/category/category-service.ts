import sendRequest from '../requests/request-service';
import RequestMethod from '../../enums/request-methods';
import Routes from "../../enums/routes";
import EndPointBuilder from "../routing/routingService";

export interface ProductCategory {
  ProductCategoryId: number;
  ProductCategoryName: string;
  ChargeRate: number;
  RebateRate: number;
  NumberOfItems: number;
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  try {
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.PRODUCT)
      .addRoute('public')
      .addRoute('get-product-category-list')
      .build();
console.log("")
    const response = await sendRequest(
      RequestMethod.GET,
      endpoint,
      null,
      false // Assuming this is a public endpoint that doesn't require authentication
    );


    return response.data;
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return [];
  }
}



