"use client"

import Link from "next/link";
import React, { useState } from "react";
import { Playfair_Display } from "next/font/google";
import { FaFacebook } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const playFair = Playfair_Display({ subsets: ["latin"], weight: "400" });

const Footer = () => {
  const [isContactVisible, setIsContactVisible] = useState(false);

  return (
    <footer className="bg-[#A0214D] text-white px-6 md:px-16 py-10 z-30">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Business Details Section */}
        <div className="flex font-semibold flex-col">
          <div
            className={`lg:text-3xl mb-4 sm:text-2xl font-bold p-2-0 text-white ${playFair.className}`}
          >
            <Link href="/">RJ TRADITIONAL</Link>
          </div>
          <p className="text-sm leading-relaxed">
            RJ Traditional, a Jaipur-based brand, offers premium ethnic
            collections, blending tradition and style.
          </p>
          <div className="flex space-x-4 mt-4">
            <Link
              href="https://www.facebook.com/share/1EPJAkK5f2/?mibextid=qi2Omg"
              target="_blank"
            >
              <FaFacebook className="text-3xl" />
            </Link>
            <Link
              href="https://youtube.com/@rjtcollection?si=4nVSbbiJcNFG-HoE"
              target="_blank"
            >
              <FaYoutube className="text-3xl" />
            </Link>
            <Link
              href="https://www.instagram.com/rj.traditional/profilecard/?igsh=cnhzNWVyMXhubXh4"
              target="_blank"
            >
              <FaSquareInstagram className="text-3xl" />
            </Link>
          </div>
        </div>

        {/* Contact Details Section */}
        <div className="flex flex-col">
          <div
            className="flex justify-start gap-2 items-center cursor-pointer"
            onClick={() => setIsContactVisible(!isContactVisible)}
          >
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            {isContactVisible ? (
              <FaChevronUp className="text-lg relative bottom-[6px]" />
            ) : (
              <FaChevronDown className="text-lg relative bottom-[6px]" />
            )}
          </div>
          {isContactVisible && (
            <div>
              <p className="text-sm mb-1">WhatsApp: +91-9649142770</p>
              <p className="text-sm mb-1">
                Email:
                <Link
                  href="mailto:rdangani777@gmail.com"
                  className="text-blue-400"
                >
                  {" "}
                  rdangani777@gmail.com
                </Link>
              </p>
              <p className="text-sm mt-4 font-semibold">Address:</p>
              <p className="text-sm whitespace-pre-line leading-relaxed">
                Building No./Flat No.: 2134, Champawat Market
                Name Of Premises/Building: Unit No. 412, Kanta Mansion 4th Floor
                Road/Street: Dada Market
                Locality/Sub Locality: Johari Bazar
                City/Town/Village: Jaipur
                District: Jaipur
                State: Rajasthan
                PIN Code: 302003
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 my-6"></div>

      {/* Footer Bottom Section */}
      <div className="flex flex-wrap justify-between items-center">
        <p className="text-sm">© 2024 RJTraditional</p>
        <div className="flex flex-wrap space-x-4 text-sm">
          <Link href="/ourInfo/aboutUs" className="hover:text-blue-400">
            About Us
          </Link>
          <Link href="/ourInfo/privacyPolicy" className="hover:text-blue-400">
            Privacy Policy
          </Link>
          <Link href="/ourInfo/returnPolicy" className="hover:text-blue-400">
            Return Policy
          </Link>
          <Link href="/ourInfo/shippingPolicy" className="hover:text-blue-400">
            Shipping Policy
          </Link>
          <Link href="/ourInfo/termsAndConditions" className="hover:text-blue-400">
            Terms and Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
