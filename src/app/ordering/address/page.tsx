"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useOrderStore from "@/store/order";
import useDBOrderStore from "@/store/dbOrders";
import { ShippingAddress } from "@/store/dbOrders";
import { toast } from "react-toastify";

const AddressPage: React.FC = () => {
  const router = useRouter();
  const orderInfo = useOrderStore((state) => state);
  const addAddress = useOrderStore((state) => state.addAddress);
  const setShippingAddress = useDBOrderStore(
    (state) => state.setShippingAddress
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  const { items, totalAmount } = useDBOrderStore((state) => state);

  useEffect(() => {
    // Enhanced navigation guard - check both order stores
    const hasOrderItems = orderInfo?.order_items?.length > 0;
    const hasDBItems = items?.length > 0;
    const hasValidTotal = (orderInfo?.sub_total > 0) || (totalAmount > 0);

    // Additional validation: Check if items have required properties
    const hasValidOrderItemsStructure = orderInfo?.order_items?.every(item => 
      item.name && item.selling_price && item.units > 0
    );
    const hasValidDBItemsStructure = items?.every(item => 
      item.name && item.price > 0 && item.quantity > 0 && item.productId
    );

    if (!hasOrderItems || !hasDBItems || !hasValidTotal || 
        !hasValidOrderItemsStructure || !hasValidDBItemsStructure) {
      console.log("Address page navigation guard triggered - redirecting to products");
      console.log("Order items:", hasOrderItems);
      console.log("DB items:", hasDBItems); 
      console.log("Valid total:", hasValidTotal);
      console.log("Valid order structure:", hasValidOrderItemsStructure);
      console.log("Valid DB structure:", hasValidDBItemsStructure);
      
      toast.error("No items found in your order. Please add items to cart first.", { 
        autoClose: 3000 
      });
      router.replace("/products");
      return;
    }
    
    // If validation passes, allow page to render
    setIsValidating(false);
  }, [orderInfo, items, totalAmount, router]);

  const [billingDetails, setBillingDetails] = useState<ShippingAddress>({
    customer_name: "",
    last_name: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    country: "India",
    email: "",
    phone: "",
  });

  // useEffect(()=>{
  //   console.log("billingDetails",billingDetails);
  // },[billingDetails])

  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({ ...prev, [name]: value }));

    if (name === "pincode" && value.length === 6) {
      validatePincode(value);
    }
  };

  const validatePincode = async (pincode: string) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      console.log("Pincode data:", data);
      
      if (response.ok && data) {
        const info = data[0]["PostOffice"][0];
        setBillingDetails((prev) => ({
          ...prev,
          state: info["State"],
        }));
        setError(null);
      } else {
        setError("Invalid PIN code. Please check and try again.");
        setBillingDetails((prev) => ({
          ...prev,
          state: "",
        }));
      }
    } catch (error) {
      setError("Error validating PIN code.");
      console.error(error);
    }
  };

  const handleProceed = () => {
    if (
      !billingDetails.pincode ||
      !billingDetails.state 
    ) {
      setError("Please enter a valid PIN code.");
      return;
    }
    if (
      !billingDetails.customer_name ||
      !billingDetails.last_name ||
      !billingDetails.address ||
      !billingDetails.city ||
      !billingDetails.pincode ||
      !billingDetails.state ||
      !billingDetails.country ||
      !billingDetails.email ||
      !billingDetails.phone
    ) {
      toast.error("Please fill in all the required fields.", { autoClose: 5000, closeOnClick: false });
      return;
    }
    if (billingDetails.phone.length !== 10) {
      toast.error("Please enter a valid phone number.", { autoClose: 5000, closeOnClick: false });
      return;
    }
    // Added email validation check using a simple regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingDetails.email)) {
      toast.error("Please enter a valid email address.", { autoClose: 5000, closeOnClick: false });
      return;
    }
    addAddress(billingDetails);
    setShippingAddress(billingDetails);
    router.push("/ordering/payment");
  };

  // Show loading while validating navigation
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-screen-xl mx-auto bg-gray-100 text-black flex flex-col lg:flex-row">
      {/* Dropdown for smaller screens */}
      <div className="lg:hidden bg-white p-4 shadow-md mb-4">
        <button
          className="w-full bg-gray-100 text-black py-2 hover:bg-gray-200 transition"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Order Summary (items: {items.length})
        </button>
        {isDropdownOpen && (
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
                    <span className="mr-4 font-mono text-xl">
                      Price: ₹{item.price * item.quantity}
                    </span>
                    <span className="font-mono text-lg">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div className="flex justify-between items-center font-bold text-lg pt-4">
              <p className="font-mono text-2xl">sub-Total: </p>
              <p className="font-normal text-3xl">₹{totalAmount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Left Side: Order Summary for large screens */}
      <div className="hidden lg:block w-[50%] bg-white p-6 shadow-md">
        <h2 className="text-xl underline decoration-1 underline-offset-8 md:text-3xl font-normal mb-4 md:mb-8 text-gray-800">
          Your Order
        </h2>
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
                  <span className="mr-4 font-mono text-xl">
                    Price: ₹{item.price * item.quantity}
                  </span>
                  <span className="font-mono text-lg">
                    Qty: {item.quantity}
                  </span>
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

      {/* Right Side: Address Form */}
      <div className="w-full lg:w-[50%] bg-white p-8 shadow-md">
        <h1 className="text-xl text-center underline decoration-1 underline-offset-8 md:text-3xl font-normal mb-4 md:mb-8 text-gray-800">
          Enter Your Address :
        </h1>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              name="customer_name"
              placeholder="First Name"
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="last_name"
              placeholder="Last Name"
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            name="phone"
            placeholder="Phone"
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="email"
            placeholder="Email"
            type="email"
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="address"
            placeholder="Complete Address"
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="pincode"
            placeholder="Pincode"
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="city"
              onChange={handleInputChange}
              placeholder="City"
              className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="state"
              value={billingDetails.state}
              readOnly
              placeholder="State"
              className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={handleProceed}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddressPage;
