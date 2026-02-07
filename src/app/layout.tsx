import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SignIn from "@/components/authComp/signInButton";
import { SessionProvider } from "next-auth/react";
import Navbar from "../components/Navbar";
import whatsapp from "../../public/utilityIcons/whatsapp.svg";
import Footer from "@/components/Footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const playFair = localFont({
  src: "./fonts/PlayfairDisplay-Regular.ttf",
  variable: "--font-playfair-display",
  weight: "400 400",
});

export const metadata: Metadata = {
  title: "RJ Traditional",
  description: "Weaving heritage into fashion",
  icons: {
    icon: "/logo.png",
  },
  other: {
    "google-site-verification": "Y3k9jqKGmV-uMpePRE_DwS_WSs_0VLceCtAZWtxnVIQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <body
          className={`${playFair.variable} ${playFair.variable} antialiased`}
        >
          <Navbar />
          <ToastContainer />
          {children}
          <Footer/>
          <a
            href="https://wa.me/919649142770?text=Hi%20there!%20I%20want%20to%20know%20more%20about%20your%20services."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 animate-bounce right-4 bg-green-500 text-white rounded-full p-2 md:p-3 shadow-lg hover:bg-green-600"
            aria-label="Chat with us on WhatsApp"
          >
            <img src={whatsapp.src} alt="WhatsApp" className="w-7  h-7" />
          </a>
        </body>
      </SessionProvider>
    </html>
  );
}
