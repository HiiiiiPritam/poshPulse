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

const CartPage = () => {
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
  const cart = useCartStore((state) => state.Cart);

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
    console.log("cart outOfStockItems...",outOfStockItems);
    console.log("cart inStockItems...",inStockItems);
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
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
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
    <div className="cart-page lg:max-w-screen-xl mx-auto px-2 py-10 bg-background relative min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cart Items Section */}
        <div className="cart-items col-span-2 bg-card shadow-sm border border-border rounded-xl px-4 py-6 md:p-8">
          <h1 className="text-3xl font-serif mb-8 text-primary border-b border-border pb-4">Your Cart</h1>

          {cartItems.length === 0 ? (
                <div className="relative flex flex-col items-center justify-center w-full min-h-[50vh] p-6 space-y-6 bg-secondary/30 rounded-lg overflow-hidden">
                  <div className="text-6xl z-10 opacity-80">
                    🛍️
                  </div>

                  <p className="text-foreground text-2xl md:text-3xl font-serif z-10">
                    Your bag is empty!
                  </p>

                  <p className="text-muted-foreground text-center max-w-md z-10">
                    It looks like you haven’t added anything yet. Explore our exquisite collection and find your perfect match.
                  </p>

                  <Link
                    href="/products"
                    className="mt-4 px-8 py-3 z-20 text-lg bg-primary text-primary-foreground font-medium rounded-full shadow-md hover:bg-primary/90 transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
              [...inStockItems].reverse().map((item, index) => (
              <div
                key={index}
                className="flex relative items-start justify-between p-4 mb-4 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                >
                <div className="flex items-start w-full">
                  <Link href={`/product/${item.productId}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-32 md:w-32 md:h-40 object-cover rounded-md mr-4 md:mr-6"
                    />
                  </Link>
                  <div className="flex flex-col flex-1 gap-1">
                    <Link href={`/product/${item.productId}`}>
                      <h2 className="text-lg md:text-xl font-serif text-foreground hover:text-primary transition-colors line-clamp-2">{item.name}</h2>
                    </Link>
                    <p className="text-sm font-medium text-muted-foreground">Size: <span className="text-foreground">{item.size}</span></p>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border border-border rounded-md">
                        <button
                          onClick={() => handleQuantityChange("decrement", item)}
                          className="px-3 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-l-md disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-base font-medium min-w-[2rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange("increment", item)}
                          className="px-3 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-r-md"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-lg font-medium text-primary">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteCartItem(item.productId, item.quantity, item.size)}
                    className="text-muted-foreground hover:text-destructive p-2"
                  >
                    <MdDeleteOutline size={24} />
                  </button>
                </div>
              </div>
            )))
          }

          {/* Out of Stock Items (Simplified for brevity, similar logic) */}
          {outOfStockItems.length > 0 && (
             <div className="mt-8 pt-8 border-t border-dashed border-border">
               <h3 className="text-lg font-medium text-destructive mb-4">Out of Stock Items</h3>
               {outOfStockItems.map((item, index) => (
                 <div key={index} className="flex relative items-center justify-between p-4 mb-4 border border-destructive/20 rounded-lg bg-destructive/5 opacity-70">
                   {/* ... simplified OOS item display ... */}
                   <div className="flex items-center">
                     <img src={item.image} className="w-16 h-20 object-cover rounded mr-4 grayscale" />
                     <div>
                       <h2 className="text-sm font-semibold">{item.name}</h2>
                       <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded">Sold Out</span>
                     </div>
                   </div>
                   <button onClick={() => deleteCartItem(item.productId, item.quantity, item.size)} className="text-destructive">
                     <MdDeleteOutline size={20} />
                   </button>
                 </div>
               ))}
             </div>
          )}

        </div>
  
        {/* Order Summary Section */}
        <div
          className={`cart-summary bg-card border border-border shadow-sm rounded-xl p-6 h-fit md:sticky md:top-24`}
        >
          <h2 className="text-xl font-serif font-medium mb-6 text-foreground border-b border-border pb-2">Order Summary</h2>
          <div className="mb-6 flex justify-between items-baseline">
            <span className="text-muted-foreground">
              Total ({inStockItems.length} items)
            </span>
            <span className="text-2xl font-serif text-primary">₹{calculateTotal()}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full py-4 bg-primary text-primary-foreground text-lg font-medium rounded-lg shadow-md hover:bg-primary/90 transition-all mb-3"
          >
            PROCEED TO CHECKOUT
          </button>
          <p className="text-xs text-center text-muted-foreground">
            Shipping & taxes calculated at checkout
          </p>
        </div>
      </div>
  
      <div className="h-20 md:hidden"></div>
    </div>
  );
  
};

export default CartPage;