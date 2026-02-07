"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { IProduct } from "@/models/Products";
import { useSession } from "next-auth/react";
import useProductStore from "@/store/productState";
import useCartStore from "@/store/cartState";
import LoginPanel from "@/components/loginPanel"; // Import your Login Panel component
import useDBOrderStore from "@/store/dbOrders";
import useOrderStore from "@/store/order";
import ScrollableRow from "@/components/scrollableSection";
import { IoBagHandleOutline } from "react-icons/io5";
import { MdOutlinePayments } from "react-icons/md";
import ImageZoom from "@/components/helpers/ImageZoom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/loading";
import ErrorPage from "@/components/error";
import AddedToCart from "@/components/addedToCart";
import { set } from "mongoose";
import Image from "next/image";


const ProductPage = () => {
  const router = useRouter();
  const { productId } = useParams();
  const { data: session } = useSession();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [similarProducts, setSimilarProducts] = useState<IProduct[]>([]);
  const [bestSellers, setBestSellers] = useState<IProduct[]>([]);
  const { products } = useProductStore();
  const [selectedSize, setSelectedSize] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showLoginPanel, setShowLoginPanel] = useState(false); // State for login panel
  const fetchCart = useCartStore((state) => state.fetchCart);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const resetDBOrder = useDBOrderStore((state) => state.resetOrder);
  const resetOrder = useOrderStore((state) => state.resetOrder);
  const addOrderItems = useOrderStore((state) => state.addOrderItems);
  const setItems = useDBOrderStore((state) => state.setItems);
  const Cart = useCartStore((state) => state.Cart);

  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  useEffect(() => {
    fetchProducts();
    resetDBOrder();
    resetOrder();
  }, []);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(`/api/singleProduct/${productId}`);
          if (!response.ok) {

            throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          setProduct(data);
          setSelectedSize(data?.sizes?.filter((size : any) => size.stock > 0)[0]?.size);
          setMainImage(data.images[0]);
        } catch (err) {
          console.error("Error fetching product:", err);
        } finally {
          setLoading(false);
        }
      };
    
      fetchProduct();
    }
    
  }, [productId]);

  useEffect(() => {
    const applyFilters = ({ title }: { title: string | undefined }) => {
      const filtered = products.filter((productt: IProduct) => {
        const matchesTitle = title
          ? productt.title.toLowerCase().trim() === title.toLowerCase().trim()
          : true;
        return matchesTitle && productt.images[0] !== product?.images[0];
      });
      setSimilarProducts(filtered);

      
      const topProducts = products.filter((productt: IProduct) => {
        const isLoved = productt.tags.includes("Most Loved");
        return isLoved && productt.title !== product?.title;
      });
      setBestSellers(topProducts);
    };
    applyFilters({ title: product?.title });
  }, [product, products]);


  if (loading) {
    return <Loading />;
  }

  if (!product) {
    return <ErrorPage />;
  }

  const handleQuantityChange = (operation: "increment" | "decrement") => { 
    if (operation === "increment") {
      const selectedsizeProduct = product.sizes.find((availableSize) => availableSize.size === selectedSize);

      if (!selectedsizeProduct) {
        toast.error("Please select a size first.");
        return;
      }
    
      if(!(quantity >= selectedsizeProduct.stock)) {
        setQuantity((prevQuantity) => prevQuantity + 1); 
      }
    } else if (operation === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!session) {
      setShowLoginPanel(true); // Show login panel if not logged in
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size first.",{autoClose:2000});
      return;
    }

    const cartQuantity = Cart.items.find((item) => item.productId === product?._id.toString() && item.size === selectedSize)?.quantity || 0;
    const selectedsizeProduct = product.sizes.find((availableSize) => availableSize.size === selectedSize)?.stock;
    if(!selectedsizeProduct) return;
      if( quantity + cartQuantity > selectedsizeProduct) {
        toast.error("Quantity exceeds available stock.",{autoClose:2000});
        return;
      }
    
    const response = await fetch(`/api/addCartItems`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: session?.user?.id,
        image: product.images[0],
        productId: product?._id,
        name: product?.title,
        price: product?.discountedPrice || product?.price,
        quantity,
        size: selectedSize,
      }),
    });

    if (response.ok && session?.user?.id){
       fetchCart(session.user.id);
       setIsCartOpen(true);
    }
    else{
      toast.error("Failed to add product to cart.");
    }
  };

  const handleBuyNow = () => {
    if (!session) {
      setShowLoginPanel(true); // Show login panel if not logged in
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size first.",{autoClose:2000});
      return;
    }

    if (!product) return;
    ////////setting shiprocket order////
    const newOrderItems = [
      {
        name: product?.title,
        sku: product?.title.substring(0, 10),
        units: quantity,
        selling_price: product?.discountedPrice?.toString() || product?.price.toString(),
        discount: "0",
        tax: "0",
        hsn: 0,
      },
    ];

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
      (product?.discountedPrice || product?.price)*quantity
    );

    //////setting in DB////

    let pricefinal = product?.discountedPrice || product?.price;

    setItems(
      [
        {
          name: product?.title,
          productId: product?._id.toString(),
          quantity: quantity,
          size: selectedSize,
          images: product?.images,
          price: product?.discountedPrice || product?.price,
        },
      ],
      pricefinal*quantity
    );

    // Redirect to the buy page
    router.push("/ordering/address");
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:p-8 bg-background min-h-screen">
 
    <AddedToCart  toggleCart={toggleCart} isCartOpen={isCartOpen} />
    {/* Login Panel */}
    {showLoginPanel && <LoginPanel onClose={() => setShowLoginPanel(false)} />}
  
    {/* Product Details Section */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Product Images */}
      <div className="flex flex-col md:flex-row gap-4 lg:h-[85vh]">
        <div className="flex overflow-y-auto p-1 md:flex-col space-x-2 md:space-x-0 md:space-y-4 order-2 md:order-1 mt-4 md:mt-0 scrollbar-hide">
          {product?.images.map((img, index) => (
            <Image
              width={100}
              height={100}
              key={index}
              src={img}
              alt={`Image ${index + 1}`}
              className={`w-16 md:w-20 h-20 md:h-28 rounded-lg object-cover border-2 cursor-pointer transition-all ${mainImage === img ? "border-primary" : "border-transparent hover:border-primary/50"}`}
              onClick={() => setMainImage(img)}
            />
          ))}
        </div>
        <div className="flex-1 order-1 md:order-2 bg-white rounded-2xl overflow-hidden border border-border">
          <ImageZoom imageSrc={mainImage} altText={product?.title} />
        </div>
      </div>
  
      {/* Product Information */}
      <div className="flex flex-col h-full">
        <h1 className="text-3xl md:text-4xl font-serif font-medium mb-4 text-foreground">{product?.title}</h1>
        
        <div className="flex items-baseline gap-4 mb-6">
          {product?.discountedPrice ? (
            <>
              <span className="text-3xl font-medium text-foreground">₹{product?.discountedPrice}</span> 
              <span className="line-through text-lg text-muted-foreground decoration-primary/50">₹{product?.price}</span>
              <span className="text-primary text-lg font-medium bg-primary/10 px-2 py-0.5 rounded">
               {(((product.price - product.discountedPrice) / product.price) * 100).toFixed(0)}% OFF
              </span>
            </>
          ) : (
            <span className="text-3xl font-medium text-foreground">₹{product?.price}</span>
          )}
        </div>
  
        {/* Select Size */}
        <div className="mb-6">
          <label className="block font-medium mb-3 text-foreground/80">Select Size</label>
          <div className="flex flex-wrap gap-3">
            {product?.sizes.map((size) => (
              <button
                key={size.size}
                disabled={size.stock === 0}
                className={`
                  px-6 py-2 border rounded-full text-sm font-medium transition-all
                  ${size.stock > 0 
                    ? (selectedSize === size.size 
                        ? "bg-primary text-primary-foreground border-primary shadow-md" 
                        : "bg-background text-foreground border-input hover:border-primary hover:text-primary") 
                    : "bg-muted text-muted-foreground cursor-not-allowed decoration-slice line-through opacity-50"}
                `}
                onClick={() => {
                  if (size.stock === 0) return;
                  setSelectedSize(size.size);
                  setQuantity(1);
                }}
              >
                {size.size}
              </button>
            ))}
          </div>
        </div>
  
        {/* Select Quantity */}
        <div className="mb-8">
          <label className="block font-medium mb-3 text-foreground/80">Quantity</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-input rounded-full p-1 bg-white">
              <button
                onClick={() => handleQuantityChange("decrement")}
                className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-secondary rounded-full transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center text-lg font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange("increment")}
                className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-secondary rounded-full transition-colors"
              >
                +
              </button>
            </div>
            {product?.sizes.find(s => s.size === selectedSize)?.stock && (
                 <span className="text-sm text-muted-foreground">
                    {product.sizes.find(s => s.size === selectedSize)?.stock} items left
                 </span>
            )}
          </div>
        </div>
  
        {/* Buttons */}
        <div className="flex gap-4 mb-8 mt-auto">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex justify-center items-center gap-2 px-6 py-4 bg-primary text-primary-foreground text-lg font-medium rounded-xl shadow-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5"
          >
            Add to Bag <IoBagHandleOutline className="text-xl" />
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 flex justify-center items-center gap-2 px-6 py-4 bg-foreground text-background text-lg font-medium rounded-xl shadow-lg hover:bg-foreground/90 transition-all hover:-translate-y-0.5"
          >
            Buy Now <MdOutlinePayments className="text-xl" />
          </button>
        </div>
  
        {/* Product Description */}
        <div className="border-t border-border pt-6 mt-4">
          <h3 className="font-serif text-xl mb-4 text-foreground">Product Details</h3>
          <div className="text-muted-foreground leading-relaxed space-y-2">
            {product?.description?.split(",").map((segment, index) => {
              const parts = segment.split(":");
              return (
                <div key={index} className="flex gap-2">
                  {parts.length > 1 ? (
                    <>
                      <span className="font-medium text-foreground min-w-[120px]">{parts[0]}:</span>
                      <span>{parts.slice(1).join(":")}</span>
                    </>
                  ) : (
                    <span>{segment}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>


        <div className="flex  justify-center  text-xs md:text-md gap-14 md:gap-20">
          <div className="flex flex-col justify-center items-center space-y-2">
            <img src="/special/quality.png" alt="Fast Delivery" width={80} height={80} />
            <p className="mt-2">Superior Quality</p>
          </div>
          <div className="flex flex-col justify-center items-center space-y-2">
            <img src="/special/truck1.png" alt="Lowest Price" width={70} height={65} />
            <p>Delivery within 7 days</p>
          </div>
          <div>
            <img src="/special/cash.png" alt="Fast Delivery" width={75} height={75} />
            <p className="mt-2">Cash on Delivery</p>
          </div>
        </div>
    <div className="max-w-full mx-auto mt-12 pt-8 border-t border-border">
      <ScrollableRow title="Similar Products" products={similarProducts} />
      <br/>
      <ScrollableRow title="Best Sellers" products={bestSellers} />
    </div>
  </div>
  );
};

export default ProductPage;
