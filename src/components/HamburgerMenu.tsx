"use client";

import React, { useState } from "react";

const HamburgerMenu = ( {isMenuOpen, setIsMenuOpen} : {isMenuOpen: boolean, setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>} ) => {
 
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div
      className={`relative w-6 h-3 flex flex-col justify-between items-center cursor-pointer ${
        isMenuOpen ? "open" : ""
      }`}
      onClick={toggleMenu}
    >
      <span
        className={`block w-5 h-[2px] rounded bg-white transition-all duration-300 ease-in-out transform ${
          isMenuOpen ? "rotate-45 translate-y-[1px]" : ""
        }`}
      ></span>
      <span
        className={`block w-5 h-[2px] rounded bg-white transition-all duration-300 ease-in-out ${
          isMenuOpen ? "opacity-0" : ""
        }`}
      ></span>
      <span
        className={`block w-5 h-[2px] rounded bg-white transition-all duration-300 ease-in-out transform ${
          isMenuOpen ? "-rotate-45 -translate-y-[9px]" : ""
        }`}
      ></span>
    </div>
  );
};

export default HamburgerMenu;
