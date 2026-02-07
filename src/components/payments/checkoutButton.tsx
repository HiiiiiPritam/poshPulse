// components/CheckoutButton.tsx

"use client";
import useDBOrderStore from "@/store/dbOrders";
import useOrderStore from "@/store/order";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { use, useState } from "react";
import { toast } from "react-toastify";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutButtonProps {
  amount: number;
}

export default function CheckoutButton({ amount }: CheckoutButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  
  const setShiprocketOrderId = useDBOrderStore((state) => state.setShiprocketOrderId);
  const setUserId = useDBOrderStore((state) => state.setUserId);
  const resetDBOrder = useDBOrderStore((state: any) => state.resetOrder);
  const resetOrder = useOrderStore((state: any) => state.resetOrder); 
  const updatePaymentMethod = useOrderStore(
    (state: any) => state.updatePaymentMethod
  );
  const setDBPaymentMethod = useDBOrderStore(
    (state: any) => state.setPaymentMethod
  );

  const shippingAddress = useDBOrderStore((state: any) => state.shippingAddress);

  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (!session?.user?.id) {
        toast.error("Please login to continue");
        setLoading(false);
        return;
      }

      // Step 1: Initiate Order (Create Pending DB Order + Razorpay Order)
      const initiateResponse = await fetch("/api/orders/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: session.user.id,
          shippingAddress 
        }),
      });

      const initiateData = await initiateResponse.json();
      
      if (!initiateResponse.ok) {
        toast.error(initiateData.error || "Failed to initiate order");
        setLoading(false);
        return;
      }

      const { dbOrderId, razorpayOrder } = initiateData;

      if (!razorpayOrder || !razorpayOrder.id) {
        console.error("Failed to create Razorpay order");
        setLoading(false);
        return;
      }

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: razorpayOrder.amount, 
        currency: "INR",
        name: "RJ Traditional",
        description: "Order #" + dbOrderId,
        order_id: razorpayOrder.id, 
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        },

        handler: async function (response: any) {
          // Step 3: Finalize Order (Verify + Shiprocket + Update DB)
          try {
            const finalizeResponse = await fetch("/api/orders/finalize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                dbOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const finalizeData = await finalizeResponse.json();

            if (finalizeResponse.ok) {
              setDBPaymentMethod("Prepaid");
              updatePaymentMethod("Prepaid");

              if (finalizeData.warning) {
                toast.warn(finalizeData.warning, { autoClose: 5000 });
              } else {
                toast.success("Order placed successfully!", {
                  autoClose: 5000,
                  position: "top-center",
                });
              }

              // Update Local Stores
              setUserId(session?.user?.id as string);
              setShiprocketOrderId(finalizeData.shiprocketId);
              
              resetDBOrder();
              resetOrder();
              router.push("/yourOrders");
            } else {
              toast.error("Payment verification failed. Please contact support.");
              console.error("Finalization failed:", finalizeData);
            }
          } catch (err) {
            console.error("Error finalizing order:", err);
            toast.error("Something went wrong while confirming your order.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: session.user.name || "",
          email: session.user.email || "",
          contact: shippingAddress?.phone || "",
        },
        theme: {
          color: "#A0214D",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error during payment:", error);
      toast.error("Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`w-full text-white font-bold py-3 rounded-lg transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </button>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  );
}
