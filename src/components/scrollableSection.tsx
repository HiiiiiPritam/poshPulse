import React, { useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProductCard from "@/components/productCard";
import { IProduct } from "@/models/Products";
import LoginPanel from "./loginPanel";

const ScrollableRow = ({ title, products }: { title: string; products: IProduct[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLoginPanel, setShowLoginPanel] = useState(false);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col rounded-md min-h-[250px]  px-3 pt-2 bg-[#fcf7f7]">
      <h2 className=" text-lg md:text-2xl mb-4 text-center font-light  border-b-1 border-gray-900" >{title}</h2>
      <div className="relative">
        {/* Left Arrow */}
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
          onClick={scrollLeft}
          aria-label="Scroll Left"
        >
          <FaChevronLeft />
        </button>

        {/* Login Panel */}
        {showLoginPanel && <LoginPanel onClose={() => setShowLoginPanel(false)} />}

        {/* Product List */}
        <div
          className="flex space-x-4 overflow-x-auto overflow-y-hidden no-scrollbar"
          ref={scrollRef}
          style={{ scrollBehavior: "smooth" }}
        >
          {
            products.length === 0 && (
              <div className="flex justify-center items-center w-full h-full p-4">
              <div className="text-center space-y-4">
                <p className="text-gray-800 text-xl md:text-4xl font-semibold animate-pulse">
                  More Products Coming Soon... 😉
                </p>
                <p className="text-gray-600 text-sm md:text-lg">
                  Stay tuned! 
                </p>
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <span className="w-4 h-4 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-4 h-4 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                  <span className="w-4 h-4 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            </div>
            )
          }
          {products.map((product, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-72" // Fixed width for uniform cards
            >
              <ProductCard product={product} setShowLoginPanel={setShowLoginPanel} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
          onClick={scrollRight}
          aria-label="Scroll Right"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ScrollableRow;
