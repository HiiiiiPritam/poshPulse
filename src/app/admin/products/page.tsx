"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { IProduct } from "@/models/Products";
import useProductStore from "@/store/productState";
import Fuse, { FuseResult } from "fuse.js";

export default function AdminProductsPage() {

  // Server-side (paginated) state
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Client-side (fuzzy) state
  const [search, setSearch] = useState("");
  const allProducts = useProductStore((state) => state.products);
  const fetchAllProducts = useProductStore((state) => state.fetchProducts);

  // Fetch paginated data (Default view)
  const fetchPaginatedProducts = () => {
    setLoading(true);
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: "10",
      category: category !== "All" ? category : "",
      // We don't send search param to server anymore, we handle it client-side for fuzzy
    });

    fetch(`/api/getAllProducts?${queryParams}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
          setTotalPages(data.pagination.totalPages);
          setTotalProducts(data.pagination.total);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  // 1. Initial Load: Fetch Paginated + Fetch All for Search Index
  useEffect(() => {
    fetchPaginatedProducts();
    // Background fetch for search index
    if (allProducts.length === 0) {
        fetchAllProducts();
    }
  }, [page, category]); // Re-fetch paginated when page/category changes

  // 2. Setup Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(allProducts, {
      keys: ["title", "description", "category", "tags"],
      threshold: 0.3,
    });
  }, [allProducts]);

  // 3. Derived State: Display Products
  // If search is active, use filter results. Else use paginated server results.
  const displayProducts = useMemo(() => {
    if (!search) return products;

    const result = fuse.search(search);
    // Client-side pagination for search results could be added here, 
    // but for now we'll show all matches or top 50 to avoid lag.
    return result.map((res) => res.item).slice(0, 50); 
  }, [search, products, fuse]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // We don't reset page here because search overrides pagination view
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(1);
    // Clear search when changing category filter on server
    setSearch(""); 
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">
            {search ? `Search Results (${displayProducts.length})` : `Products (${totalProducts})`}
        </h1>
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Fuzzy Search..."
            className="border p-2 rounded w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={handleSearch}
          />
          <select
            className="border p-2 rounded"
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="All">All Categories</option>
            <option value="SAREE">Saree</option>
            <option value="LEHENGA">Lehenga</option>
            <option value="SUITS">Suits</option>
            <option value="GOWNS">Gowns</option>
            <option value="KURTI">Kurti</option>
            <option value="DUPATTA">Dupatta</option>
          </select>
          <Link
            href="/admin/products/add"
            className="bg-blue-600 text-white px-4 py-2 rounded whitespace-nowrap"
          >
            Add New
          </Link>
        </div>
      </div>

      {loading && !search ? (
        <div className="text-center py-10">Loading products...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <div
                  key={product._id.toString()}
                  className="border rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition"
                >
                  <div className="relative h-48">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold truncate">{product.title}</h3>
                    <p className="text-gray-500 text-sm mb-2">
                      {product.category}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">
                        ₹{product.discountedPrice || product.price}
                      </span>
                      <div className="flex gap-2">
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                          Stock:{" "}
                          {product.sizes.reduce(
                            (acc: any, s: any) => acc + s.stock,
                            0
                          )}
                        </span>
                        <Link
                          href={`/admin/products/edit/${product._id}`}
                          className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                No products found.
              </div>
            )}
          </div>

          {/* Pagination Controls (Only show if NOT searching) */}
          {!search && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
