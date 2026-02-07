"use client";
import { MdDeleteOutline } from "react-icons/md";
import React, { use, useEffect, useState } from "react";
import { CartItem, ICart } from "@/store/cartState";
import { useSession, signIn } from "next-auth/react";
import useOrderStore from "@/store/order";
import { useRouter } from "next/navigation";
import useDBOrderStore from "@/store/dbOrders";
import { OrderItem } from "@/models/Orders";
import Link from "next/link";
import useCartStore from "@/store/cartState";
import useProductStore from "@/store/productState";
import Loading from "@/components/loading";
import { toast } from "react-toastify";
import { set } from "mongoose";
import { IProduct } from "@/models/Products";

const AddedToCart = ({ toggleCart , isCartOpen }: { toggleCart: () => void , isCartOpen: boolean}) => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const addOrderItems = useOrderStore((state) => state.addOrderItems);
  const setItems = useDBOrderStore((state) => state.setItems);
  let orderItems: OrderItem[] = useDBOrderStore((state) => state.items);
  let totalAmount: number = useDBOrderStore((state) => state.totalAmount);
  const resetDBOrder = useDBOrderStore((state) => state.resetOrder);
  const resetOrder = useOrderStore((state) => state.resetOrder);
  const {fetchCart, Cart } = useCartStore((state) => state);
  const {products,fetchProducts} = useProductStore((state) => state);
  const [outOfStockItems, setOutOfStockItems] = useState<CartItem[]>([]);
  const [inStockItems, setInStockItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchCartt();
    } else {
      setLoading(false);
    }
  }, [session, products, Cart]);

  const fetchCartt = async () => {
    // try {
    //   const response = await fetch(`/api/showCart?userId=${session?.user?.id}`);
    //   const data = await response.json();
    //   console.log("Cart data:", data);

    //   if (!response.ok) {
    //     toast.error("Failed to fetch cart");
    //     throw new Error(data.error || "Failed to fetch cart");
    //   }
    
      setCartItems(Cart.items);

      const oosItems = Cart.items.filter((item : CartItem) => {
        const product = products.find((p) => p._id.toString() === item.productId);
        // console.log("oosItems...",product,products);
        const selectedsizeProduct = product?.sizes.find((availableSize : any) => availableSize.size === item.size);
        if(!selectedsizeProduct) return false;
        console.log("oosItems...",selectedsizeProduct.stock, item.quantity);
        return selectedsizeProduct?.stock < 1 || selectedsizeProduct?.stock < item.quantity || selectedsizeProduct === undefined;
      });

      const inItems = Cart.items.filter((item : CartItem) => {
        const product = products.find((p:IProduct) => p._id.toString() === item.productId);
        // console.log("oosItems...",product,products);
        const selectedsizeProduct = product?.sizes.find((availableSize : any) => availableSize.size === item.size);
        if(!selectedsizeProduct) return false;
        console.log("inItems...",selectedsizeProduct.stock, item.quantity);
        return !(selectedsizeProduct?.stock < 1) && !(selectedsizeProduct?.stock < item.quantity) && !(selectedsizeProduct === undefined);
      });

      setInStockItems(inItems);
      setOutOfStockItems(oosItems);
      
  };

  useEffect(() => {
    console.log("outOfStockItems...",outOfStockItems);
    console.log("inStockItems...",inStockItems);
    setLoading(false);
  }, [outOfStockItems,inStockItems]);

  const updateQuantity = async (productId: any, quantity: number, size: string) => {
    try {
      const response = await fetch("/api/showCart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          userId: session?.user?.id,
          size,
        }),
      });
      const updatedCart = await response.json();
      setCartItems(updatedCart.items);
      if(session?.user?.id)
      fetchCart(session?.user?.id);
      console.log("Updated cart:", updatedCart);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const deleteCartItem = async (productId: any, quantity: number, size: string) => {
    try {
      const response = await fetch(`/api/showCart`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          productId,
          quantity,
          size,
        }),
      });
      const updatedCart = await response.json();
      setCartItems(updatedCart.items);
      if(session?.user?.id)
        fetchCart(session?.user?.id);
      console.log("Updated cart:", updatedCart);
    } catch (error) {
      console.error("Error deleting cart item:", error);
    }
  };

  useEffect(() => {
      resetDBOrder();
      resetOrder();
    console.log(useDBOrderStore.getState());
    console.log(useOrderStore.getState());
  }, []);

  const handleQuantityChange = (operation: "increment" | "decrement", cartProduct: CartItem) => { 
    const product = products.find((p) => p._id.toString() === cartProduct.productId);
    if (operation === "increment") {
      const selectedsizeProduct = product?.sizes.find((availableSize: any) => availableSize.size === cartProduct.size);

      if (!selectedsizeProduct) {
        alert("Please select a size first.");
        return;
      }
      if(!(cartProduct.quantity >= selectedsizeProduct.stock)) {
        updateQuantity(cartProduct.productId, cartProduct.quantity + 1, cartProduct.size)
      }
    } else if (operation === "decrement" && cartProduct.quantity > 1) {
      updateQuantity(cartProduct.productId, cartProduct.quantity - 1, cartProduct.size)
    }
  };

  
  const handleCheckout = async () => {
    ///storing the shipRocketorder
    const newOrderItems = inStockItems.map((item, index) => ({
      name: item.name,
      sku: item.name.substring(0, 10)+ index.toString(),
      units: item.quantity,
      selling_price: item.price.toString(),
      discount: "0",
      tax: "0",
      hsn: 0,
    }));

    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(now)
      .replace(",", "");

    addOrderItems(
      newOrderItems,
      Date.now().toString(),
      formattedDate,
      inStockItems.reduce((total, item) => total + item.price * item.quantity, 0)
    );

    ///// storing the order in Db
    const items: OrderItem[] = orderItems;
    inStockItems.forEach((item) => {
      items.push({
        name: item.name,
        productId: item.productId.toString(),
        quantity: item.quantity,
        size: item.size,
        images: item.image as any,
        price: item.price,
      });
    });

    const total = totalAmount + inStockItems.reduce((total, item) => total + item.price * item.quantity, 0);
    setItems(items, total);
    router.push("/ordering/address");
  };

  const calculateTotal = () => {
    return inStockItems?.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (loading) return <Loading />;

  if (!session) {
    return (
      <div className={` fixed top-0 right-0 h-full w-80 md:w-96 bg-gray-50 shadow-lg z-50 transform ${
        isCartOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300`}>
        <p className="mb-4 text-lg">Please log in to view your cart.</p>
        <button
          onClick={() => signIn()}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <>
    {/* Overlay */}
    {isCartOpen && (
      <div
        onClick={toggleCart}
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
      ></div>
    )}

    {/* Cart Panel */}
    <div
      className={` fixed top-0 right-0 h-full w-80 md:w-96 bg-gray-50 shadow-lg z-50 transform ${
        isCartOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300`}
    >
      {/* Close Button */}
      <button
        onClick={toggleCart}
        className="absolute top-4 right-4 text-gray-700 text-2xl hover:text-gray-800"
      >
        x
      </button>

      {/* Cart Content */}
      <div className="p-6 flex flex-col h-full">

        <div className="h-[10%]">
          {
            cartItems.length === 0 ? (
              <div className="text-center underline underline-offset-8 text-xl md:text-2xl  text-gray-700">
                Your Cart is empty! 
              </div>
            ) : (
              
            <h2 className="flex items-center mt-4 text-xl md:text-2xl font-bold mb-4 text-gray-800 space-x-3 ">
              {/* Circle with Tick */}
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full animate-pop">
                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-green-600"
                  >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6L20.25 7.5"
                  />
                  </svg>
              </div>

              {/* Text */}
              <span className="animate-fade-in font-normal underline underline-offset-8 decoration-green-500 ">Item Added to Cart!</span>
              </h2>
            )
          }
        </div>



        {cartItems.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">
            <a
              href="/products"
              className="mt-4 block px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Shop Now
            </a>
          </div>
        ) : (
          <div className="h-[90%]">

            <div className="mt-2 flex flex-col  h-[75%] overflow-y-scroll">
              {/* In-Stock Items */}
              {[...inStockItems].reverse().map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between mb-4 border p-2 rounded-lg"
                >
                  <div className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-md mr-4"
                    />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-600 text-sm">Size: {item.size}</p>
                      <div className="flex items-center mt-1">
                        <button
                          onClick={() => handleQuantityChange("decrement", item)}
                          className="px-2 py-1 bg-gray-200 rounded-l text-gray-600"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange("increment", item)}
                          className="px-2 py-1 bg-gray-200 rounded-r text-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p>₹{item.price * item.quantity}</p>
                    <button
                      onClick={() =>
                        deleteCartItem(item.productId, item.quantity, item.size)
                      }
                      className="text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              {/* Order Summary */}
              <div className="mt-6 h-[20%] bg-white px-4">
                <h3 className="text-lg font-semibold">Order Summary</h3>
                <div className="flex justify-between mt-2">
                  <p>Total ({inStockItems.length} items)</p>
                  <p>₹{calculateTotal()}</p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="mt-4 w-full py-2 bg-gray-800 text-white rounded-md"
                >
                  Checkout
                </button>
              </div>
             </div>
            </div>
        )}
      </div>
    </div>
  </>
  );
  
};

export default AddedToCart;