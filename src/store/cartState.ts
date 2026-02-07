import { create } from "zustand";
import { QueryClient } from "@tanstack/react-query";
import mongoose from "mongoose";


// Initialize the React Query client
const queryClient = new QueryClient();

export interface CartItem {
  _id?: mongoose.Types.ObjectId | string;
  productId: mongoose.Types.ObjectId | string;
  image: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
}

export interface ICart {
  userId: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt: Date;
}

// Define the Zustand store
interface CartState {
  Cart: ICart;
  fetchCart: (userId: string) => Promise<void>;
  updateCart: (orderItem: CartItem) => void;
}

const useCartStore = create<CartState>((set) => ({
  Cart: {
    userId: "",
    items: [],
    totalAmount: 0,
    updatedAt: new Date(),
  },

  fetchCart: async (userId: string) => {
    const queryKey = ["Cart", userId];
    // Check if cart data is already cached
    try {
        // Fetch cart data if not cached
        const data = await queryClient.fetchQuery<ICart>({
            queryKey,
            queryFn: async (): Promise<ICart> => {
                const response = await fetch(`/api/showCart?userId=${userId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch cart data");
                }
          return response.json();
        },
      });

       console.log("Cart data fetched in cart store:", data);

      // Update the Zustand store with the fetched data
      set(() => ({ Cart: data }));
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  },


  updateCart: (orderItem: CartItem) => {
    set((state) => {
      // Check if the item already exists in the cart
      const existingItemIndex = state.Cart.items.findIndex(
        (item) =>
          item.productId === orderItem.productId && item.size === orderItem.size
      );

      let updatedItems = [...state.Cart.items];
      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        updatedItems[existingItemIndex].quantity += orderItem.quantity;
      } else {
        // Add new item if it doesn't exist
        updatedItems.push(orderItem);
      }

      // Recalculate total amount
      const updatedTotalAmount = updatedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      console.log("cart state",updatedItems, updatedTotalAmount);

      return {
        Cart: {
          ...state.Cart,
          items: updatedItems,
          totalAmount: updatedTotalAmount,
          updatedAt: new Date(),
        },
      };
    });
  },
}));

export default useCartStore;
