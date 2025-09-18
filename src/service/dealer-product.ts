import apiClient from "@/apiClient";
import { Product, ProductsApiResponse, PermissionCheckResponse } from "@/types/dealer-productTypes";
import { getCookie, getAuthToken } from "@/utils/auth";
import { getDealerIdFromUserId } from "@/service/dealerServices";

const API_PRODUCTS_BASE_URL = "/category/products/v1";
export const getProductsByDealerId = async (dealerId?: string): Promise<Product[]> => {
  try {
    // If dealerId is not provided, get it from dealer services using user ID
    let id = dealerId;
    if (!id) {
      try {
        console.log(`[getProductsByDealerId] Getting dealer ID from dealer services using user ID`);
        id = await getDealerIdFromUserId();
        console.log(`[getProductsByDealerId] Successfully got dealer ID from dealer services: ${id}`);
      } catch (dealerServiceError) {
        console.log(`[getProductsByDealerId] Failed to get dealer ID from dealer services, trying fallback methods`);
        
        // Fallback: try to get from cookie
        id = getCookie("dealerId");
        if (!id) {
          // Fallback: try to extract from token
          const token = getAuthToken();
          if (token) {
            try {
              const payloadBase64 = token.split(".")[1];
              if (payloadBase64) {
                const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
                const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
                const payloadJson = atob(paddedBase64);
                const payload = JSON.parse(payloadJson);
                // Try dealerId, fallback to id
                id = payload.dealerId || payload.id;
              }
            } catch (err) {
              console.error("Failed to decode token for dealerId:", err);
            }
          }
        }
      }
      
      if (!id) {
        throw new Error("Dealer ID not found in dealer services, cookie, or token");
      }
    }
    
    console.log(`[getProductsByDealerId] Fetching products for dealer ID: ${id}`);
    const response = await apiClient.get<ProductsApiResponse>(
      `${API_PRODUCTS_BASE_URL}/get-products-by-dealer/${id}`
    );
    console.log(`[getProductsByDealerId] Successfully fetched ${response.data.data?.length || 0} products`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching products by dealer ID:", error);
    throw error;
  }
};
//  check permission for dealer to access product

export const checkDealerProductPermission = async (userId: string): Promise<PermissionCheckResponse> => {
  try {
    console.log("Permission check API call - module: Products, userId:", userId);
    const response = await apiClient.get<PermissionCheckResponse>(`/users/api/permissionMatrix/check-permission`, {
      params: {
        module: "Products",
        userId: userId,
      },
    });
    console.log("Permission check API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error checking dealer product permission:", error);
    throw error;
  }
};

/**
 * Update stock for a product by dealer
 * @param productId - Product ID (path param)
 * @param dealerId - Dealer ID (in body)
 * @param quantity - New quantity (in body)
 */
export const updateStockByDealer = async (
  productId: string,
  dealerId: string,
  quantity: number
) => {
  try {
    // Use 'dealerId' as the field name in the request body
    const response = await apiClient.put(`/category/products/v1/update-stockByDealer/${productId}`, {
      dealerId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating stock by dealer:', error);
    throw error;
  }
};

/**
 * Bulk upload products by dealer
 * @param formData - FormData containing dataFile, imageZip, and dealerId
 */
export const bulkUploadByDealer = async (formData: FormData) => {
  try {
    // Get dealer ID from token if not already in formData
    if (!formData.get('dealerId')) {
      const token = getAuthToken();
      if (token) {
        try {
          const payloadBase64 = token.split(".")[1];
          if (payloadBase64) {
            const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
            const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
            const payloadJson = atob(paddedBase64);
            const payload = JSON.parse(payloadJson);
            const dealerId = payload.dealerId || payload.id;
            if (dealerId) {
              formData.append('dealerId', dealerId);
            }
          }
        } catch (err) {
          throw new Error("Failed to extract dealer ID from token");
        }
      } else {
        throw new Error("No authentication token found");
      }
    }

    const response = await apiClient.post(
      `${API_PRODUCTS_BASE_URL}/bulk-upload/byDealer`,
      formData
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error in bulk upload by dealer:', error);
    throw error;
  }
};

