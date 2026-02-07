import { create } from 'zustand';
import { QueryClient } from '@tanstack/react-query';
import { IProduct } from '@/models/Products';



// Initialize the React Query client
const queryClient = new QueryClient();

// Define the Zustand store
interface ProductState {
  products: IProduct[];
  fetchProducts: () => Promise<void>;
}

const useProductStore = create<ProductState>((set) => ({
  products: [],

    fetchProducts: async () => {
      const queryKey = ['products'];

      // Check if products are already cached
      const cachedData = queryClient.getQueryData<IProduct[]>(queryKey);
      if (cachedData) {
        set(() => ({ products: cachedData }));
        return;
      }

      // Fetch products if not cached
      const data = await queryClient.fetchQuery({
        queryKey,
        queryFn: async (): Promise<IProduct[]> => {
          // Fetch with a high limit to get "all" products for now, to support existing client-side filtering
          const response = await fetch('/api/getAllProducts?limit=1000');
          if (!response.ok) {
            throw new Error('Failed to fetch products');
          }
          const data = await response.json();
          // The API now returns { products: [], pagination: {} }
          return data.products || []; 
        },
      });

      const sortProductsByDate = (products: IProduct[]) => {
        const sortedProducts = products.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Sort in descending order (newest first)
        });
        return sortedProducts;
      };

      const sortedProducts = sortProductsByDate(data);

      console.log("ProductStore sorted", sortedProducts);

      // Update the Zustand store
      set(() => ({ products: sortedProducts }));
    },

  }))



export default useProductStore;
