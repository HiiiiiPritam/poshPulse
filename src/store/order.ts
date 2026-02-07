import { create } from "zustand";
import zukeper from "zukeeper";

interface OrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: string;
  discount: string;
  tax: string;
  hsn: number;
}

interface AddressDetails {
  customer_name: string;
  last_name: string;
  address: string;
  address_2?: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  email: string;
  phone: string;
}

interface OrderState {
  order_id: string;
  order_date: string;
  pickup_location: string;
  channel_id: string;
  comment: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name: string;
  shipping_last_name: string;
  shipping_address: string;
  shipping_address_2: string;
  shipping_city: string;
  shipping_pincode: string;
  shipping_country: string;
  shipping_state: string;
  shipping_email: string;
  shipping_phone: string;
  order_items: OrderItem[];
  payment_method: string;
  shipping_charges: number;
  giftwrap_charges: number;
  transaction_charges: number;
  total_discount: number;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

interface OrderActions {
  addOrderItems: (items: OrderItem[], orderId: string, orderDate: string, total: number) => void;
  addAddress: (billingDetails: Partial<AddressDetails>, shippingDetails?: Partial<AddressDetails>) => void;
  updatePaymentMethod: (method: string) => void;
  updateshippingCharges: (shipping_charges: number) => void;
  updateDimensions: (length: number, breadth: number, height: number, weight: number) => void;
  resetOrder: () => void;
}

type OrderStore = OrderState & OrderActions;

const useOrderStore = create<OrderStore>(
  zukeper((set: any) => ({
    order_id: "",
    order_date: "",
    pickup_location: "Primary",
    channel_id: "5915468",
    comment: "",
    billing_customer_name: "",
    billing_last_name: "",
    billing_address: "",
    billing_address_2: "",
    billing_city: "",
    billing_pincode: "",
    billing_state: "",
    billing_country: "",
    billing_email: "",
    billing_phone: "",
    shipping_is_billing: true,
    shipping_customer_name: "",
    shipping_last_name: "",
    shipping_address: "",
    shipping_address_2: "",
    shipping_city: "",
    shipping_pincode: "",
    shipping_country: "",
    shipping_state: "",
    shipping_email: "",
    shipping_phone: "",
    order_items: [],
    payment_method: "",
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: 0,
    length: 0.9,
    breadth: 0.9,
    height: 0.9,
    weight: 0.9,

    // Actions
    addOrderItems: (items : OrderItem[] , orderId : string, orderDate: string, total: number) =>
      set((state: OrderState) => ({
        ...state,
        order_items: items,
        order_id: orderId,
        order_date: orderDate,
        sub_total: total,
      })),

    addAddress: (billingDetails: Partial<AddressDetails> ) =>
      set((state : OrderState) => ({
        ...state,
        billing_customer_name: billingDetails.customer_name,
        billing_last_name: billingDetails.last_name,
        billing_address: billingDetails.address,
        billing_city: billingDetails.city,
        billing_pincode: billingDetails.pincode,
        billing_state: billingDetails.state,
        billing_country: billingDetails.country,
        billing_email: billingDetails.email,
        billing_phone: billingDetails.phone,
      })),

    updatePaymentMethod: (method: string) =>
      set((state: OrderState) => ({
        ...state,
        payment_method: method,
      })),

    updateDimensions: (length: number, breadth: number, height: number, weight: number) =>
      set((state: OrderState) => ({
        ...state,
        length,
        breadth,
        height,
        weight,
      })),

      updateshippingCharges: (shipping_charges: number) =>
        set((state: OrderState) => ({
          ...state,
          shipping_charges: shipping_charges,
        })),


     resetOrder: () =>
        set(() => ({
          userId: '',
          items: [],
          sub_total: 0,
          shippingAddress: null,
          paymentMethod: null,
          shiprocketOrderId: null,
          status: 'pending',
        }))

  }))
);

if (typeof window !== "undefined") {
  (window as any).useOrderStore = useOrderStore;
}

export default useOrderStore;
