"use client";
import useCartStore from "@/store/cartState";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IOrder } from "@/models/Orders";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/loading";
import LoginPanel from "@/components/loginPanel";

const YourOrders = () => {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const [showLoginPanel, setShowLoginPanel] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchYourOrders();
      setShowLoginPanel(false);
      fetchCart(session.user.id);
    }
  }, [session?.user?.id]);

  const fetchYourOrders = async () => {
    try {
      const response = await fetch(`/api/orders/getOrders?userId=${session?.user?.id}`);
      const data = await response.json();
       // Sort orders by `createdAt` in descending order (newest first)
      const sortedOrders = data.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setOrders(sortedOrders);
      console.log("Orders sorted fetched:", sortedOrders);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const updateDataBase = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/updateStatus`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus }),
      });
      const data = await response.json();
      console.log("Order status updated:", data);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getOrderStatus = async (shipOrderId: string, orderId: string) => {
    try {
      const response = await fetch(`/api/ship/getOrderStatus?orderId=${shipOrderId}`, {
        method: "GET",
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Order status fetched:", data);
        const status = data;
        setOrders((prevOrders: any) =>
          prevOrders.map((order: IOrder) =>
            order.shiprocketOrderId === shipOrderId ? { ...order, status: status } : order
          )
        );
        updateDataBase(orderId, status);
      } else {
        console.error("Error fetching order status:", data.message);
      }
    } catch (error) {
      console.error("Error fetching order status:", error);
    }
  };

  const cancelOrder = async (shipOrderId: string | undefined, orderId: string) => {
    if (!shipOrderId) {
        toast.error("Cannot cancel order without shipping ID");
        return;
    }
    try {
      const response = await fetch(`/api/ship/cancelOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [shipOrderId] }),
      });
      const data = await response.json();
      if (response.ok) {
        setOrders((prevOrders: any) =>
          prevOrders.map((order: IOrder) =>
            order.shiprocketOrderId === shipOrderId ? { ...order, status: "CANCELED" } : order
          )
        );
        console.log("Order cancelled:", data);
        toast.success("Order cancelled successfully");
        updateDataBase(orderId, "CANCELED");
      } else {
        toast.error("Failed to cancel order");
        console.error("Error cancelling order:", data.message);
      }
    } catch (error) {
      toast.error("Failed to cancel order");
      console.error("Error cancelling order:", error);
    }
  };

  const toggleExpandOrder = (shiprocketOrderId: string | undefined, orderId: string, status?: string) => {
    if (status !== "CANCELED" && shiprocketOrderId) {
      getOrderStatus(shiprocketOrderId, orderId);
    }
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  if (showLoginPanel) {
    return <LoginPanel  onClose={() => setShowLoginPanel(false)} />;
  }

  if (loading) {
    return <Loading />;
  }

  if (orders.length === 0) {
    return (
      <div className="relative flex flex-col items-center justify-center h-screen p-6 text-center bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200 rounded-lg shadow-2xl overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-blue-300 opacity-30 rounded-full animate-bounce"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-400 opacity-20 rounded-full animate-pulse"></div>
    
        {/* Animated SVG Icon */}
        <div className="relative">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-24 h-24 text-blue-500 mb-6 animate-spin-slow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="4"
            />
            <path
              d="M12 2a10 10 0 00-7.07 2.93"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="4"
            />
          </svg>

        </div>
    
        {/* Heading */}
        <h2 className="text-3xl font-bold text-gray-800 mb-3 animate-fade-in">
          No Orders Found
        </h2>
    
        {/* Subtext */}
        <p className="text-lg text-gray-600 mb-6 animate-fade-in delay-100">
          It seems like you haven’t placed any orders yet. Start your journey with us!
        </p>
    
        {/* Call-to-Action Button */}
        <a
          href="/products"
          className="mt-4 px-10 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 hover:shadow-xl animate-fade-in delay-200"
        >
          Shop Now
        </a>
      </div>
    );
    
    
  }
  

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-gray-50 to-gray-200">
    <h1 className="text-3xl font-normal underline decoration-1 underline-offset-8 mb-8 text-gray-800 ">
      Your Orders
    </h1>
    <div className="space-y-6">
      {orders.map((order: IOrder, index) => (
        <div
          key={index}
          className={`rounded-xl overflow-hidden shadow-lg transition-transform transform  bg-white border p-6 ${
            order.status.toLocaleLowerCase() === "canceled"
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
        >
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleExpandOrder(order.shiprocketOrderId, order._id as string, order.status)}
          >
            <div>
              <p className="text-xl font-bold text-gray-800">OrderId #{order.shiprocketOrderId}</p>
              {expandedOrder === order._id && (
                <p className="text-gray-600">Status: {order.status === "NEW" ? "PENDING" : order.status}</p>
              )}
              <p className="text-gray-600">Total Amount: ₹{order.totalAmount}</p>
              <p className="text-gray-600">Payment Method: {order.paymentMethod}</p>
              <p className="text-gray-600">Ordered On: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <button className="text-blue-600 font-medium hover:underline">
              {expandedOrder === order._id ? "Collapse" : "Expand"}
            </button>
          </div>
  
          {expandedOrder === order._id && (
            <div className="mt-6 border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
              <div className="space-y-4 ">
                {order.items.map((item: any, index: number) => (
                  <Link href={`/product/${item.productId.toString()}`} key={index}>
                    <div className="flex items-center space-x-4 border-b pb-4 max-w-[500px]">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md shadow-sm"
                      />
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-2">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Size: {item.size} | Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600">Price: ₹{item.price}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mt-6">Shipping Address</h2>
              <p className="text-sm text-gray-600 mt-2">
                {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state}-
                {order.shippingAddress.pincode}, Phone: {order.shippingAddress.phone}, Email: {order.shippingAddress.email}
              </p>
              {(order.status.toLocaleLowerCase() === "pending" || order.status.toLocaleLowerCase() === "new") && (
                <button
                  onClick={() => cancelOrder(order.shiprocketOrderId, order._id as string)}
                  className="mt-6 px-5 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 shadow-lg transition-all"
                >
                  Cancel Order
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
   </div>
  
  );
};

export default YourOrders;
