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

export default function YourOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const fetchCart = useCartStore((state) => state.fetchCart);
  
  // Login Panel State
  const [showLoginPanel, setShowLoginPanel] = useState(true);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{ id: string, readableId: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const cancellationReasons = [
    "Changed my mind",
    "Found a better price",
    "Ordered by mistake",
    "Expected delivery too late",
    "Other"
  ];

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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const handleCancelClick = (orderId: string, readableId: string) => {
      setSelectedOrder({ id: orderId, readableId });
      setCancelReason(cancellationReasons[0]);
      setCancelNote("");
      setShowCancelModal(true);
  };

  const submitCancellation = async () => {
      if (!selectedOrder) return;
      setIsCancelling(true);

      const finalReason = cancelReason === "Other" ? cancelNote : cancelReason;

      try {
        const response = await fetch(`/api/orders/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                orderId: selectedOrder.id,
                reason: finalReason
            }),
        });

        const data = await response.json();

        if (response.ok) {
            toast.success("Order cancelled successfully");
            // Update UI locally
            setOrders(prev => prev.map(o => 
                o._id === selectedOrder.id ? { ...o, status: "CANCELLED" } : o
            ));
            setShowCancelModal(false);
        } else {
            toast.error(data.error || "Failed to cancel order");
        }
      } catch (error) {
          toast.error("Something went wrong");
      } finally {
          setIsCancelling(false);
      }
  };


  const getOrderStatus = async (shipOrderId: string, orderId: string) => {
    // Only verify status if NOT Cancelled/Delivered
    try {
      const response = await fetch(`/api/ship/getOrderStatus?orderId=${shipOrderId}`, {
        method: "GET",
      });
      const data = await response.json();
      if (response.ok) {
        // Logic to update status if changed...
        // For now logging it. Actual update happens in background or via webhook ideally.
        console.log("Shiprocket Status:", data);
      } 
    } catch (error) {
      console.error("Error fetching order status:", error);
    }
  };


  const toggleExpandOrder = (shiprocketOrderId: string | undefined, orderId: string, status?: string) => {
    if (status !== "CANCELLED" && status !== "DELIVERED" && shiprocketOrderId) {
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
      <div className="relative flex flex-col items-center justify-center h-screen p-6 text-center bg-gray-50 rounded-lg shadow-inner overflow-hidden">
        <h2 className="text-3xl font-bold text-gray-800 mb-3 animate-fade-in">
          No Orders Found
        </h2>
        <p className="text-lg text-gray-600 mb-6 font-serif">
          It seems like you haven’t placed any orders yet.
        </p>
        <a
          href="/products"
          className="mt-4 px-8 py-3 text-lg bg-black text-white font-medium rounded-full shadow hover:bg-gray-800 transition-all"
        >
          Start Shopping
        </a>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 border-b pb-4">
      Your Orders
    </h1>
    <div className="space-y-6 max-w-5xl mx-auto">
      {orders.map((order: any, index) => (
        <div
          key={index}
          className={`bg-white rounded-xl shadow-sm border transition-all ${
            order.status === "CANCELLED" ? "border-red-100 bg-red-50/10" : "border-gray-200 hover:shadow-md"
          }`}
        >
          {/* Header Section */}
          <div
            className="p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            onClick={() => toggleExpandOrder(order.shiprocketOrderId, order._id as string, order.status)}
          >
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                   <h3 className="text-lg font-bold text-gray-900">
                       {/* Show Readable ID if available, else standard ID */}
                       {order.readableOrderId || `#${order.shiprocketOrderId || order._id.toString().substring(0,8)}`}
                   </h3>
                   <span className={`px-2 py-0.5 text-xs font-bold rounded-full uppercase tracking-wide ${
                       order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                       order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                       'bg-blue-100 text-blue-800'
                   }`}>
                       {order.status}
                   </span>
               </div>
               <div className="text-sm text-gray-500 font-medium space-x-2">
                   <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                   <span>•</span>
                   <span>₹{order.totalAmount}</span>
                   <span>•</span>
                   <span>{order.items.length} Items</span>
               </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                  {expandedOrder === order._id ? "Hide Details" : "View Details"}
                </button>
            </div>
          </div>
  
          {/* Expanded Details */}
          {expandedOrder === order._id && (
            <div className="border-t border-gray-100 p-6 bg-gray-50/50">
              
              {/* Items Grid */}
              <div className="grid gap-4 mb-6">
                {order.items.map((item: any, i: number) => (
                  <Link href={`/product/${item.productId.toString()}`} key={i}>
                    <div className="flex items-start gap-4 bg-white p-3 rounded-lg border border-gray-100 hover:border-indigo-100 transition-colors">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-16 h-20 object-cover rounded-md bg-gray-100"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Size: {item.size} <span className="mx-1">|</span> Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">₹{item.price}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

               {/* Shipping & Actions */}
               <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600">
                      <p className="font-semibold text-gray-900 mb-1">Delivering To:</p>
                      <p>{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                      <p>{order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  </div>

                  {/* Cancel Button */}
                  {(order.status === "PENDING" || order.status === "ORDER_PLACED" || order.status === "NEW") && (
                    <button
                      onClick={(e) => {
                          e.stopPropagation();
                          handleCancelClick(order._id as string, (order as any).readableOrderId || `#${order._id.toString().substring(0,6)}`);
                      }}
                      className="px-5 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
               </div>
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Cancel Modal */}
    {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                <div className="p-6">
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Cancel Order?</h3>
                    <p className="text-gray-500 mb-6">
                        Are you sure you want to cancel order <span className="font-mono font-medium text-black">{selectedOrder?.readableId}</span>? This action cannot be undone.
                    </p>

                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason for cancellation</label>
                    <select 
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg mb-4 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                    >
                        {cancellationReasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>

                    {cancelReason === "Other" && (
                        <textarea
                            value={cancelNote}
                            onChange={(e) => setCancelNote(e.target.value)}
                            placeholder="Please tell us why..."
                            className="w-full p-3 border border-gray-200 rounded-lg mb-4 text-sm h-24 resize-none focus:ring-2 focus:ring-black focus:outline-none"
                        />
                    )}
                    
                    <div className="flex gap-3 mt-6">
                        <button 
                            onClick={() => setShowCancelModal(false)}
                            className="flex-1 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Keep Order
                        </button>
                        <button 
                            onClick={submitCancellation}
                            disabled={isCancelling}
                            className="flex-1 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCancelling ? "Cancelling..." : "Confirm Cancel"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )}

   </div>
  );
}


