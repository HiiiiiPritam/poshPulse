'use client';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useOrderStore from "@/store/order";
import CheckoutButton from "@/components/payments/checkoutButton";
import { useSession } from "next-auth/react";
import useDBOrderStore from "@/store/dbOrders";

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [totalAmount, setTotalAmount] = useState(useOrderStore.getState().sub_total);
  const [open, setOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  const updatePaymentMethod = useOrderStore((state) => state.updatePaymentMethod);
  const shippingAddress = useDBOrderStore((state) => state.shippingAddress);
  const setDBPaymentMethod = useDBOrderStore((state) => state.setPaymentMethod);
  const setShiprocketOrderId = useDBOrderStore((state) => state.setShiprocketOrderId);
  const setUserId = useDBOrderStore((state) => state.setUserId);
  const resetDBOrder = useDBOrderStore((state) => state.resetOrder);
  const resetOrder = useOrderStore((state) => state.resetOrder);
  const { setItems } = useDBOrderStore((state) => state);
  const { updateshippingCharges } = useOrderStore((state) => state);
  const sub_total = useOrderStore((state) => state.sub_total);
  const orderInfo = useOrderStore((state) => state);
  const { items } = useDBOrderStore((state) => state);
  const shippingCharges = 150;

  useEffect(() => {
    // Enhanced navigation guard - check both order stores and address
    const hasOrderItems = orderInfo?.order_items?.length > 0;
    const hasDBItems = items?.length > 0;
    const hasValidTotal = (orderInfo?.sub_total > 0) || (totalAmount > 0);
    const hasBillingAddress = orderInfo?.billing_address;
    const hasShippingAddress = shippingAddress;

    // Additional validation: Check if items have required properties and address completeness
    const hasValidOrderItemsStructure = orderInfo?.order_items?.every(item => 
      item.name && item.selling_price && item.units > 0
    );
    const hasValidDBItemsStructure = items?.every(item => 
      item.name && item.price > 0 && item.quantity > 0 && item.productId
    );
    const hasCompleteAddress = hasBillingAddress || (shippingAddress?.customer_name && 
      shippingAddress?.address && shippingAddress?.pincode && shippingAddress?.phone);

    if (!hasOrderItems || !hasDBItems || !hasValidTotal || 
        !hasValidOrderItemsStructure || !hasValidDBItemsStructure || !hasCompleteAddress) {
      console.log("Payment page navigation guard triggered - redirecting to products");
      console.log("Order items:", hasOrderItems);
      console.log("DB items:", hasDBItems);
      console.log("Valid total:", hasValidTotal);
      console.log("Valid order structure:", hasValidOrderItemsStructure);
      console.log("Valid DB structure:", hasValidDBItemsStructure);
      console.log("Complete address:", hasCompleteAddress);
      console.log("Billing address:", !!hasBillingAddress);
      console.log("Shipping address:", !!hasShippingAddress);
      
      if (!hasCompleteAddress) {
        toast.error("Please complete your address information first.", { 
          autoClose: 3000 
        });
        router.replace("/ordering/address");
      } else {
        toast.error("No items found in your order. Please add items to cart first.", { 
          autoClose: 3000 
        });
        router.replace("/products");
      }
      return;
    }

    // If validation passes, allow page to render
    setIsValidating(false);
  }, [orderInfo, items, totalAmount, shippingAddress, router]);

  const handleCODcharges = () => {
    if (paymentMethod !== "COD") {
      setTotalAmount(sub_total + shippingCharges);
    }
  };

  const handlePrepaid = () => {
    if (paymentMethod !== "Prepaid") {
      setTotalAmount(sub_total);
    }
  };

  const handleFinish = async () => {
    if (paymentMethod === "COD") {
      updatePaymentMethod("COD");
      updateshippingCharges(shippingCharges);
      setItems(items, sub_total + shippingCharges);

      const response = await fetch("/api/ship/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(useOrderStore.getState()),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      // Instead of toast, show a pop-up card with order details
      setShowPopup(true);

      setDBPaymentMethod(paymentMethod);
      setShiprocketOrderId(data.order_id);
      setUserId(session?.user?.id as string);

      const response2 = await fetch("/api/orders/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(useDBOrderStore.getState()),
      });

      const data2 = await response2.json();
      if (!response2.ok) {
        throw new Error("Failed to create order");
      }

      // After 3 seconds, dismiss the popup, reset orders and navigate away.
      setTimeout(() => {
        setShowPopup(false);
        resetDBOrder();
        resetOrder();
        router.push("/yourOrders");
      }, 3000);
    } else {
      toast.error("Please select a payment method!", { autoClose: 3000 });
    }
  };

  // Show loading while validating navigation
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating order and address...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-screen-xl mx-auto bg-gray-100 text-black flex flex-col lg:flex-row">
      {/* Pop-up Card for Order Confirmation */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl transform transition-all duration-500 ease-out scale-100">
            <h2 className="text-3xl font-extrabold text-green-600 mb-6 text-center">
              Order Placed Successfully!
            </h2>
            <p className="text-lg font-medium mb-4 text-center">
              Total Amount: <span className="font-bold">₹{totalAmount}</span>
            </p>
            <div className="mb-4">
              <p className="font-semibold text-lg">Shipping Address:</p>
              <p className="text-sm text-gray-600">
                {shippingAddress?.address}, {shippingAddress?.city}, {shippingAddress?.state}-{shippingAddress?.pincode} <br />
                <span className="font-medium">Phone:</span> {shippingAddress?.phone}, <span className="font-medium">Email:</span> {shippingAddress?.email}
              </p>
            </div>
            <div>
              <p className="font-semibold text-lg mb-2">Order Items:</p>
              <ul className="text-sm text-gray-600 space-y-2">
                {items?.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.name} (x{item.quantity})</span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}


      {/* Dropdown for small screens */}
      <div className="lg:hidden bg-white p-4 shadow-md mb-4">
        <button
          className="w-full bg-gray-100 text-black py-2 hover:bg-gray-200 transition"
          onClick={() => setOpen(!open)}
        >
          Order Summary (items: {items.length})
        </button>
        {open && (
          <div className="mt-4 space-y-4">
            {items?.length === 0 ? (
              <p className="text-gray-600">Your cart is empty!</p>
            ) : (
              items?.map((item, index) => (
                <div
                  key={index?.toString()}
                  className="cart-item flex items-center justify-between mb-4 border p-2 rounded flex-wrap"
                >
                  <div className="flex items-center m-2">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-20 h-24 object-cover mr-4"
                    />
                    <div className="flex flex-col justify-center items-center gap-5">
                      <h2 className="text-lg font-semibold">{item.name}</h2>
                      <p>Size: {item.size}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center m-2">
                    <span className="mr-4 font-mono text-xl">Price: ₹{item.price * item.quantity}</span>
                    <span className="font-mono text-lg">Qty: {item.quantity}</span>
                  </div>
                </div>
              ))
            )}
            <div className="flex justify-between items-center font-bold text-lg pt-4">
              <p className="font-mono text-lg">SubTotal: </p>
              <p className="font-normal text-xl">₹{totalAmount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Left Side: Order Summary */}
      <div className="hidden lg:block w-[50%] bg-white p-6 shadow-md">
        <h2 className="text-xl underline decoration-1 underline-offset-8 font-normal mb-4">Your Order</h2>
        <div className="space-y-4">
          {items?.length === 0 ? (
            <p className="text-gray-600">Your cart is empty!</p>
          ) : (
            items?.map((item, index) => (
              <div
                key={index?.toString()}
                className="cart-item flex items-center justify-between mb-4 border p-2 rounded flex-wrap"
              >
                <div className="flex items-center m-2">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-20 h-24 object-cover mr-4"
                  />
                  <div className="flex flex-col justify-center items-start gap-2">
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p>Size: {item.size}</p>
                  </div>
                </div>

                <div className="flex gap-5 items-center m-2">
                  <span className="mr-4 font-mono text-xl">Price: ₹{item.price * item.quantity}</span>
                  <span className="font-mono text-lg">Qty: {item.quantity}</span>
                </div>
              </div>
            ))
          )}
          <div className="flex justify-between items-center font-bold text-lg pt-4">
            <p className="font-mono text-2xl">sub-Total: </p>
            <p className="font-normal text-3xl">₹{totalAmount}</p>
          </div>
        </div>
      </div>

      {/* Right Side: Payment Details */}
      <div className="w-full lg:w-[50%] bg-white py-4 px-4 md:p-8 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          <span className="border-b-4 border-indigo-500 pb-1">Payment</span>
        </h1>
        <div className="space-y-4 text-gray-700">
          <div className="flex justify-between items-center">
            <p className="text-lg">Subtotal:</p>
            <p className="font-semibold text-lg">₹{sub_total}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="">Shipping Charges:</p>
            <p className="font-semibold text-lg">
              ₹{paymentMethod === "COD" ? 150 : 0}
            </p>
          </div>

          <h2 className="font-normal mt-4">Shipping Address:</h2>
          <p className="md:text-sm text-xs text-gray-600">
            {shippingAddress?.address},{" "}
            {shippingAddress?.city},{" "}
            {shippingAddress?.state}-{shippingAddress?.pincode}, Phone:{" "}
            {shippingAddress?.phone}, Email: {shippingAddress?.email}
          </p>

          {/* Payment Method Selection */}
          <div className="mt-6">
            <p className="text-lg font-medium mb-3">Select Payment Method:</p>
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* COD Option */}
              <label
                className={`flex items-center cursor-pointer border-2 rounded-lg p-3 md:p-4 transition-colors duration-300 w-full md:w-1/2 ${
                  paymentMethod === "COD"
                    ? "bg-[#A0214D] ring-1 ring-white shadow-lg"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => {
                    setPaymentMethod("COD");
                    handleCODcharges();
                  }}
                  className="hidden"
                />
                {/* Custom Radio Circle */}
                <span className="mr-2 flex items-center justify-center">
                  <span
                    className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                      paymentMethod === "COD" ? "border-white" : "border-gray-400"
                    }`}
                  >
                    {paymentMethod === "COD" && (
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    )}
                  </span>
                </span>
                <span className={`font-semibold text-center ${paymentMethod === "COD" ? "text-white" : "text-black"}`}>
                  Cash on Delivery
                </span>
              </label>
              {/* Prepaid Option */}
              <label
                className={`flex items-center cursor-pointer border-2 rounded-lg p-3 md:p-4 transition-colors duration-300 w-full md:w-1/2 ${
                  paymentMethod === "Prepaid"
                    ? "bg-black ring-1 ring-black shadow-lg"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  value="Prepaid"
                  checked={paymentMethod === "Prepaid"}
                  onChange={() => {
                    toast.info("We are not receiving online payments for now");
                    // setPaymentMethod("Prepaid");
                    // handlePrepaid();
                  }}
                  className="hidden"
                />
                {/* Custom Radio Circle */}
                <span className="mr-2 flex items-center justify-center">
                  <span
                    className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                      paymentMethod === "Prepaid" ? "border-white" : "border-gray-400"
                    }`}
                  >
                    {paymentMethod === "Prepaid" && (
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    )}
                  </span>
                </span>
                <span className={`font-semibold text-center ${paymentMethod === "Prepaid" ? "text-white" : "text-black"}`}>
                  Prepaid
                </span>
              </label>
            </div>
          </div>

          <hr className="border border-gray-400 my-4" />
          <div className="flex justify-between items-center text-xl font-semibold">
            <p>Total Amount:</p>
            <p className="text-indigo-600">₹{totalAmount}</p>
          </div>
        </div>

        {/* Finish Button */}
        <div className="mt-8">
          {paymentMethod === "COD" ? ( 
            <button
              onClick={handleFinish}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Place Order
            </button>
          ) : (
            <CheckoutButton amount={totalAmount} />
          )}
        </div>

        <div className="sm:flex mb-4 items-center justify-center gap-2 mt-3">
          <div className="mr-2 flex items-center mt-2 justify-center gap-5">
            <img src="/special/gpay.png" alt="" width={40} />
            <img src="/special/ppay.svg" alt="" width={35} />
            <img src="/special/paytm.svg" alt="" width={60} />
            <img src="/special/razorpay.svg" width={110} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
