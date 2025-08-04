import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/auth/authSlice";
import productReducer from "./slice/product/productSlice";
import productLiveStatusReducer from "./slice/product/productLiveStatusSlice";
import orderReducer from "./slice/order/orderSlice";
import  orderByIdReducer from "./slice/order/orderByIdSlice";
import productByIdReducer from "./slice/product/productByIdSlice";
import dealerReducer from "./slice/dealer/dealer";
import contentReducer from "./slice/content/contentSlice"

const rootReducer = combineReducers({
  auth: authReducer,
  product: productReducer,
  productLiveStatus: productLiveStatusReducer,
  order: orderReducer,
  orderById: orderByIdReducer,
  productById: productByIdReducer,
  dealer: dealerReducer,
  content: contentReducer,
});

export default rootReducer;
