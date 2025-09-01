"use client";
import {
  Package,
  FileText,
  CreditCard,
  Bell,
  User,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  addAddress,
  createOrders,
  getCart,
  removeProductFromCart,
} from "@/service/user/cartService";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slice/cart/cartSlice";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { getUserById } from "@/service/user/userService";
import { Cart, CartItem, CartResponse } from "@/types/User/cart-Types";
import { ApiListResponse, AppUser } from "@/types/user-types";
import OrderConfirmationDialog from "@/service/user/PopUps/OrderPlaced";
import { useCart } from "@/hooks/use-cart";
import BillingAddressForm, { AddressFormValues } from "./BillingAddressForm";
import { StepProgressBar } from "@/components/common/StepProgressBar";
import type { Step } from "@/components/common/StepProgressBar";

export default function CheckoutPage() {
  const { cartData: cart, fetchCart } = useCart();
  const { showToast } = useGlobalToast();
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const [currentStep, setCurrentStep] = useState(0); // 0: Address, 1: Review, 2: Pay

  // Define checkout steps
  const checkoutSteps: Step[] = [
    { id: "address", label: "Address", icon: Package },
    { id: "review", label: "Review", icon: FileText },
    { id: "pay", label: "Pay", icon: CreditCard },
  ];

  // Get completed steps based on current step
  const getCompletedSteps = () => {
    const completed = [];
    for (let i = 0; i < currentStep; i++) {
      completed.push(i);
    }
    return completed;
  };

  // Step navigation functions
  const goToNextStep = () => {
    if (currentStep < checkoutSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < checkoutSteps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const userId = useAppSelector((state) => state.auth.user._id);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userResponse] = await Promise.all([
          getUserById(userId),
        ]);
        console.log("userResponse", userResponse);
        setUser(userResponse.data);
        // Set the first address as selected by default if available
        if (userResponse.data?.address && userResponse.data.address.length > 0) {
          setSelectedAddress(userResponse.data.address[0]);
        }
        // Cart data is now managed by Redux, so we don't need to fetch it here
        await fetchCart();
      } catch (err) {
        console.error("Failed to fetch data:", err);
        showToast("Failed to fetch data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId, fetchCart]);
  const prepareOrderBody = (user: AppUser, cart: Cart) => {
    const address = selectedAddress || user.address?.[0] || {};

    const orderBody = {
      orderId: `ORD${Math.floor(Math.random() * 100000)}`,
      orderType: "Online",
      orderSource: "Web",
      order_Amount: cart.total_mrp_with_gst?.toFixed(2) || "0.00",
      skus: cart.items.map((item) => ({
        sku: item.sku || "",
        quantity: item.quantity,
        productId: item.productId || item._id,
        productName: item.product_name,
        mrp: item.mrp || item.selling_price || 0,
        mrp_gst_amount: item.mrp_gst_amount || 0,
        gst_percentage: item.gst_percentage || "0",
        gst_amount: item.gst_amount || 0,
        product_total: item.product_total || item.selling_price * item.quantity,
        totalPrice: item.totalPrice || item.selling_price * item.quantity,
      })),
      customerDetails: {
        userId: user._id,
        name: user.username || "",
        phone: user.phone_Number || "",
        address: `${address.street || ""}, ${address.city || ""}, ${
          address.state || ""
        }, ${address.country || ""}`.trim(),
        pincode: address.pincode || "",
        email: user.email || "",
      },
      paymentType: "COD",
      delivery_type: "standard",
      deliveryCharges: cart.deliveryCharge || 0,
      GST: cart.total_mrp_gst_amount || 0,
    };
    return orderBody;
  };

  const handleProceed = async () => {
    if (currentStep === 0) { // Address step
      if (!selectedAddress) {
        showToast("Please select an address for your order", "error");
        return;
      }
      // Move to review step
      goToNextStep();
    } else if (currentStep === 1) { // Review step
      // Move to payment step
      goToNextStep();
    } else if (currentStep === 2) { // Payment step
      // Place the order
      await handlePlaceOrder();
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !cart) {
      showToast("User or cart data is not available", "error");
      return;
    }

    if (!selectedAddress) {
      showToast("Please select an address for your order", "error");
      return;
    }

    const orderBody = prepareOrderBody(user, cart);


    
    try {
      console.log("=== MAKING API CALL ===");
      console.log("Calling createOrders with body:", orderBody);
      
      const response = await createOrders(orderBody);
      
      setOrderId(response.data.orderId || response.data._id); 
      setIsOrderConfirmed(true);
      
      // Clear cart from Redux after successful order
      dispatch(clearCart());

      showToast("Order created successfully", "success");
    } catch (error: any) {

      console.error("Full Error Object:", error);

      
      if (error.response?.status === 403) {
        showToast("Access denied. Please check your login status.", "error");
      } else {
        showToast("Failed to create order", "error");
      }
    }
  };
  const removeItem = async (productId: string) => {
    try {
      const data = {
        userId: userId,
        productId: productId,
      }
      const response = await removeProductFromCart(data);
      console.log("response", response);
  
      // Refresh cart data after successful removal
      await fetchCart();
      showToast("Item removed from cart", "success");
    } catch(error) {
      console.error("Failed to remove item:", error);
      showToast("Failed to remove item from cart", "error");
    }
  }

  const onSubmit = async (data: AddressFormValues) => {
    try {
      const addressData = {
        address: [
          {
            nick_name: "Home",
            street:
              data.addressLine1 +
              (data.addressLine2 ? `, ${data.addressLine2}` : ""),
            city: data.city,
            pincode: data.pinCode,
            state: data.state,
          },
        ],
      };

      const response = await addAddress(userId, addressData);

      showToast("Address added successfully", "success");
      
      // Refresh user data and auto-select the new address
      try {
        const userResponse = await getUserById(userId);
        setUser(userResponse.data);
        // Select the newly added address (last one in the array)
        if (userResponse.data?.address && userResponse.data.address.length > 0) {
          const newAddress = userResponse.data.address[userResponse.data.address.length - 1];
          setSelectedAddress(newAddress);
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
    } catch (error) {
      showToast("Failed to add address", "error");
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Step Progress Bar */}
      <StepProgressBar
        steps={checkoutSteps}
        currentStep={currentStep}
        completedSteps={getCompletedSteps()}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Step Content */}
          <div className="lg:col-span-2">
            {currentStep === 0 && (
              <BillingAddressForm 
                onSubmit={onSubmit}
                onAddressSelect={setSelectedAddress}
                selectedAddressId={selectedAddress?._id}
                showSelection={true}
                isLoading={isLoading}
              />
            )}
            
            {currentStep === 1 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Review Your Order
                </h2>
                
                {/* Order Summary for Review */}
                <div className="space-y-6">
                  {/* Selected Address */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Delivery Address
                    </h3>
                    {selectedAddress && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium text-gray-900">
                          {selectedAddress.nick_name || "Selected Address"}
                        </p>
                        <p className="text-gray-600">
                          {selectedAddress.street}
                        </p>
                        <p className="text-gray-600">
                          {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                        </p>
                                                 <Button
                           variant="outline"
                           size="sm"
                           className="mt-2"
                           onClick={() => goToStep(0)}
                         >
                           Change Address
                         </Button>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Order Items ({cart?.items?.length ?? 0} items)
                    </h3>
                    {cart?.items && cart.items.length > 0 && (
                      <div className="space-y-4">
                        {cart.items.map((item: any) => (
                          <div
                            key={item._id}
                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0">
                              {item.product_image && item.product_image[0] && (
                                <img
                                  src={item.product_image[0]}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {item.product_name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                SKU: {item.sku}
                              </p>
                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  ₹{(item.selling_price * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  ₹{item.selling_price} each
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() => removeItem(item.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Payment Method
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-900">Cash on Delivery (COD)</p>
                      <p className="text-sm text-gray-600">
                        Pay when your order is delivered
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Payment & Confirmation
                </h2>
                
                {/* Payment Confirmation */}
                <div className="space-y-6">
                  {/* Selected Payment Method */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Payment Method
                    </h3>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Cash on Delivery (COD)</p>
                          <p className="text-sm text-gray-600">
                            Pay ₹{cart?.total_mrp_with_gst?.toFixed(2) || "0.00"} when your order is delivered
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Order Summary
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items ({cart?.items?.length ?? 0}):</span>
                        <span className="font-medium">₹{cart?.total_mrp?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">GST & Taxes:</span>
                        <span className="font-medium">₹{cart?.total_mrp_gst_amount?.toFixed(2) || "0.00"}</span>
                      </div>
                      {cart?.deliveryCharge && cart.deliveryCharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Charges:</span>
                          <span className="font-medium">₹{cart.deliveryCharge.toFixed(2)}</span>
                        </div>
                      )}
                      <hr className="border-gray-300" />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-green-600">₹{cart?.total_mrp_with_gst?.toFixed(2) || "0.00"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Confirmation */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Delivery Address
                    </h3>
                    {selectedAddress && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="font-medium text-gray-900">
                          {selectedAddress.nick_name || "Delivery Address"}
                        </p>
                        <p className="text-gray-600">
                          {selectedAddress.street}
                        </p>
                        <p className="text-gray-600">
                          {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirmation Message */}
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800 font-medium">
                        Please confirm your order details before proceeding
                      </p>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      By clicking "Confirm & Place Order", you agree to our terms and conditions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Your Order
                </h2>

                {/* Cart Items */}
                {cart?.items && cart.items.length > 0 && (
                  <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                    {cart.items.map((item: any) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-3 p-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0">
                          {item.product_image && item.product_image[0] && (
                            <img
                              src={item.product_image[0]}
                              alt={item.product_name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product_name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{(item.selling_price * item.quantity).toFixed(2)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeItem(item._id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Subtotal ({cart?.items?.length ?? 0} items):
                    </span>
                    <span className="font-medium">
                      ₹{cart?.total_mrp?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">GST + Tax:</span>
                    <span className="font-medium">
                      ₹{cart?.total_mrp_gst_amount?.toFixed(2) || "0.00"}
                    </span>
                  </div>

                  {cart?.deliveryCharge && cart.deliveryCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium">
                        ₹{cart.deliveryCharge.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {cart?.handlingCharge && cart.handlingCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Handling:</span>
                      <span className="font-medium">
                        ₹{cart.handlingCharge.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <hr className="border-gray-200" />

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-lg">Total</div>
                      <div className="text-xs text-gray-500">
                        (includes ₹
                        {cart?.total_mrp_gst_amount?.toFixed(2) || "0.00"} GST)
                      </div>
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{cart?.total_mrp_with_gst?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="space-y-3">
                  {(currentStep === 1 || currentStep === 2) && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={goToPreviousStep}
                    >
                      {currentStep === 1 ? "Back to Address" : "Back to Review"}
                    </Button>
                  )}
                  
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 font-medium"
                    onClick={handleProceed}
                    disabled={
                      !user || !cart || !selectedAddress
                    }
                  >
                    {currentStep === 0 ? "Proceed To Review" : 
                     currentStep === 1 ? "Proceed To Payment" : 
                     "Confirm & Place Order"}
                  </Button>
                </div>
                
                {selectedAddress && currentStep === 0 && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">Selected Address:</p>
                    <p className="text-sm text-green-700">
                      {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <OrderConfirmationDialog
        open={isOrderConfirmed}
        onClose={() => setIsOrderConfirmed(false)}
        orderId={orderId ?? undefined}
      />
    </div>
  );
}
