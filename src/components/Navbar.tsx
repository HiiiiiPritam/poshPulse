"use client";

import { FiShoppingBag } from "react-icons/fi";
import { BsCart3 } from "react-icons/bs";
import { BsPersonCircle } from "react-icons/bs";
import { BsSearch } from "react-icons/bs";
import React, { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import HamburgerMenu from "./HamburgerMenu";
import Image from "next/image";
import { useSession } from "next-auth/react";
import SignInButton from "./authComp/signInButton";
import useProductStore from "@/store/productState";
import { IProduct } from "@/models/Products";
import useCartStore, { ICart } from "@/store/cartState";
import SignOut from "./authComp/signOutButton";
import { IoBagHandleOutline } from "react-icons/io5";
import { set } from "mongoose";
import Fuse, { FuseResult } from "fuse.js";

const playFair = Playfair_Display({ subsets: ["latin"], weight: "400" });

const Navbar = () => {
  let { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false); // Search bar visibility
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [searchResults, setSearchResults] = useState<IProduct[]>([]); // Fetched results
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const products = useProductStore((state) => state.products);
  // Fetch the cart state directly from Zustand
  const fetchCart = useCartStore((state) => state.fetchCart);
  const fetchProducts  = useProductStore((state) => state.fetchProducts);
  const cart = useCartStore((state) => state.Cart);

  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown toggle state

  useEffect(() => {
    const fetchCartData = async () => {
      if (session?.user?.id) {
        await fetchCart(session.user.id);
      }
      await fetchProducts();
    };
    fetchCartData();
  }, [session, fetchCart, fetchProducts]);



  // Handle toggle
  const handleToggle = () => setDropdownOpen(!dropdownOpen);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleDropdown = (label: string) => {
    if (openDropdown === label) {
      setOpenDropdown(null); // Close if it's already open
    } else {
      setOpenDropdown(label); // Open the selected dropdown
    }
  };

  const handleSearchIconClick = () => {
    setSearchActive((prev) => !prev);
    setSearchQuery(""); // Clear search query when opening/closing
    setSearchResults([]); // Clear results when toggling
  };

  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ["title", "description", "category", "tags"],
      threshold: 0.3, 
    });
  }, [products]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query) {
      const result = fuse.search(query);
      const filteredResults = result.map((res: FuseResult<IProduct>) => res.item);
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <header className="bg-primary w-full h-16 md:h-20 sticky top-0 flex items-center justify-between px-2 md:px-6 z-30">
      {/* <div className="flex items-center gap-3"> */}
        {/* Hamburger Icon */}
        <button
          className="text-white lg:hidden focus:outline-none"
          onClick={toggleMenu}
        >
          <HamburgerMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        </button>

        {/* Logo */}
        <div className={`sm:text-base h-full flex items-center gap-2 font-bold text-white ${playFair.className}`}>
          {/* <Image src="/logo.png" alt="logo" className="rounded-md text-lg" width={60} height={60} /> */}
          <div className="flex flex-col items-center justify-center md:gap-3 sm:gap-2  sm:mt-2 ">
            <Link href="/" className=" pl-2 justify-cente flex text-[32px] sm:text-[40px] md:text-[50px]" >PP</Link>
            <Link href="/" className="pl-2 flex text-[8px] sm:text-[12px] md:text-[12px] tracking-widest uppercase" >Posh Pulse</Link>
          </div>
        </div>

      {/* </div> */}

      {/* Navigation Links */}
      <nav
        className={`absolute lg:static top-[63px] md:top-20 left-0 w-full lg:w-auto lg:flex bg-primary text-black lg:bg-transparent flex-col lg:flex-row lg:items-center transition-all ${isMenuOpen ? "block" : "hidden"
          }`}
      >
        <ul className="flex flex-col items-center lg:flex-row gap-6 p-2">
          <li className="relative group">
            <Link href={`/products`}>
              <button className="text-white flex items-center" onClick={toggleMenu}>All</button>
            </Link>
          </li>
          {["SAREE", "LEHENGA", "SUITS", "KURTI", "DUPATTA"].map(
            (item) => (
              <li key={item} className="relative group ">
                <Link href={`/products/${item.toLowerCase()}`} >
                  <button className="text-white flex items-center" onClick={toggleMenu}>
                    {item}
                  </button>
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>

      {/* Utility Icons */}
      <div className="flex gap-4 md:gap-5 items-center justify-center relative">
        <div>
          <BsSearch
            className="text-white cursor-pointer font-light text-2xl md:text-3xl "
            onClick={handleSearchIconClick}
          />
        </div>
        {session ? (
          <>
            <BsPersonCircle
              className="text-white cursor-pointer font-light text-2xl md:text-3xl "
              onClick={handleToggle}
            />
            {dropdownOpen && (
              <div className="absolute right-0 top-8 mt-2 w-40 flex flex-col items-center gap-2 bg-white shadow-md rounded-md py-2 z-10">
                <Link onClick={() => setDropdownOpen(false)} className="block w-4/5 rounded-md px-4 py-2 text-black hover:bg-gray-200" href="/yourOrders">
                  Your Orders
                </Link>
                {session.user?.role === "admin" && (
                    <Link onClick={() => setDropdownOpen(false)} className="block w-4/5 rounded-md px-4 py-2 text-black hover:bg-gray-200" href="/admin">
                      Admin Dashboard
                    </Link>
                )}
                <hr className="w-full bg-white" />
                <button onClick={() => setDropdownOpen(false)}  className="block w-4/5 rounded-md px-4 py-2 text-white bg-red-500 hover:bg-red-600">
                  <SignOut />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="ring-1 hover:bg-white text-xs sm:text-md hover:text-gray-900 ring-white px-3 md:px-4 py-2 rounded-2xl text-white">
            <SignInButton />
          </div>
        )}
         <Link href="/cart" className="relative flex ">
                   <IoBagHandleOutline className=" text-white text-2xl md:text-3xl"/>
                    {cart?.items?.length > 0 && (
                        <div className="relative flex items-center" >
                            {/* Item count badge */}
                            <span className="absolute -bottom-2 -left-8 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {cart?.items.length}
                            </span>
                            {/* Total amount */}
                            <span className=" text-white font-thin text-sm   px-1 pt-2  rounded-md">
                                ₹{cart?.totalAmount}
                            </span>
                        </div>
                    )}
                </Link>

        {/* Search Bar */}
        {searchActive && (
          <div className="absolute top-[44px] lg:top-[50px] right-[-8%]  bg-white transition-all ease-in-out shadow-md w-[100vw] lg:w-[90vw] p-4 mt-2 rounded-md">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
            />
            {searchResults.length > 0 && (
              <ul className="mt-2 bg-white shadow-md rounded-md max-h-40 sm:max-h-96 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <li key={index} className="hover:bg-pink-100 cursor-pointer">
                    <Link href={`/product/${result._id.toString()}`} onClick={() => setSearchActive(false)}>
                      <div className="flex items-center p-2 justify-between ">
                        <Image
                          src={result.images[0]}
                          alt={result.title}
                          width={50}
                          height={50}
                        />
                        <div className="px-5 max-w-[1000px] flex flex-col items-start justify-center">
                          <span className=" font-thin text-sm lg:text-xl line-clamp-2">{result.title}</span>        
                          <p className="text-gray-600 text-xs lg:text-base line-clamp-2">{result.description}</p>  
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-2 pr-4 ">
                          {result.discountedPrice ? (
                            <>
                              <span className="line-through text-xs text-gray-500 mr-1">
                                ₹{result.price}
                              </span>
                              <span className="text-green00 font-bold md:text-xl">
                                ₹{result.discountedPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-800 font-bold">
                              ₹{result.price}
                            </span>
                          )}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
