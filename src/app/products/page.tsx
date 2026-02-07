"use client";

import React, { Suspense, useEffect, useState } from "react";
import { IProduct } from "@/models/Products";
import dynamic from "next/dynamic";
import { FaBars, FaTimes, FaFilter } from "react-icons/fa";
import LoginPanel from "@/components/loginPanel";
import Skeleton from "@/components/Skeleton";
import { useSearchParams, useRouter } from "next/navigation";

const ProductCard = dynamic(() => import("@/components/productCard"));
// Note: filename is FilterPannel.tsx in codebase
const FilterPanel = dynamic(() => import("@/components/helpers/FilterPannel"));

const ProductPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter State
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    category: "",
    tags: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "12"); // 12 items per page for grid
      
      if (filters.category) params.append("category", filters.category);
      if (filters.priceRange[0] > 0) params.append("minPrice", filters.priceRange[0].toString());
      if (filters.priceRange[1] < 100000) params.append("maxPrice", filters.priceRange[1].toString());
      
      const allTags = [...filters.tags, ...filters.colors];
      if (allTags.length > 0) params.append("tags", allTags.join(","));
      if (filters.sizes.length > 0) params.append("sizes", filters.sizes.join(","));

      const res = await fetch(`/api/getAllProducts?${params.toString()}`);
      const data = await res.json();
      
      if (data.products) {
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
        setTotalProducts(data.pagination.total);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, filters]);

  const handleApplyFilters = (newFilters: any) => {
    setFilters({
      priceRange: newFilters.priceRange,
      category: newFilters.selectedCategory,
      tags: newFilters.selectedTags,
      sizes: newFilters.selectedSizes,
      colors: newFilters.selectedColors,
    });
    setPage(1); // Reset to page 1 on filter change
    setShowFilter(false); // Close mobile filter
  };

  return (
    <div className="bg-[#FFFAFA] min-h-screen">
      {/* Header / Banner area could go here */}
      
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <h1 className="text-2xl font-serif text-primary">Collection</h1>
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-2 bg-white border border-primary/20 text-primary px-4 py-2 rounded-full shadow-sm"
          >
            <FaFilter /> Filters
          </button>
        </div>

        {/* Sidebar Filter - Desktop Sticky / Mobile Modal */}
        <aside
          className={`
            fixed inset-0 z-50 bg-white lg:bg-transparent lg:static lg:z-auto w-full lg:w-1/4 lg:block
            transition-transform duration-300 ease-in-out
            ${showFilter ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="h-full overflow-y-auto lg:overflow-visible p-4 lg:p-0">
            <div className="lg:hidden flex justify-end mb-4">
              <button onClick={() => setShowFilter(false)} className="text-2xl text-gray-500">
                <FaTimes />
              </button>
            </div>
            
            <div className="lg:sticky lg:top-24">
              <Suspense fallback={<Skeleton type="filter" />}>
                <FilterPanel onApplyFilters={handleApplyFilters} />
              </Suspense>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="hidden lg:block mb-8 text-center relative">
             <h1 className="text-4xl font-serif text-primary mb-2">Exquisite Collection</h1>
             <p className="text-muted-foreground italic">Discover the essence of tradition</p>
             <div className="w-24 h-1 bg-primary/20 mx-auto mt-4 rounded-full"></div>
          </div>

          {showLoginPanel && (
            <Suspense fallback={<Skeleton type="panel" />}>
              <LoginPanel onClose={() => setShowLoginPanel(false)} />
            </Suspense>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} type="card" />
              ))}
            </div>
          ) : products.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center">
               <div className="text-6xl mb-4">🍂</div>
               <h2 className="text-2xl font-serif text-gray-800 mb-2">No products found</h2>
               <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
             </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 lg:gap-8">
                {products.map((product) => (
                  <ProductCard 
                    key={product._id.toString()} 
                    product={product} 
                    setShowLoginPanel={setShowLoginPanel} 
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-6 py-2 border border-primary/20 rounded-full text-primary hover:bg-primary hover:text-white transition disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-primary"
                  >
                    Previous
                  </button>
                  <span className="font-serif text-lg text-primary">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-6 py-2 border border-primary/20 rounded-full text-primary hover:bg-primary hover:text-white transition disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-primary"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductPage;
