# RJ Traditional – E-Commerce Website for Ethnic Fashion

## 🚀 Highlights 
- **Full-Stack MERN Project (Next.js + MongoDB + Node.js + TypeScript)**  
- **Real-world Freelance Build** – Developed as part of a client project, demonstrating production-level work.  
- **Key Features:** Product catalog, search/filtering, cart, checkout, Google OAuth login, Razorpay payments, order tracking with Shiprocket.  
- **Modern Tech Stack:** NextAuth, Zustand, React Query, Cloudflare R2 storage.  
- **Scalable & Maintainable Design:** Clean architecture with environment-based configuration and modular code.  
- **Responsive UI:** Optimized for mobile and desktop with Tailwind styling.  

---

**Weaving heritage into fashion.**  

RJ Traditional is a full-stack e-commerce web application built for a traditional clothing retailer. It allows customers to browse and purchase Indian ethnic wear (such as sarees, lehengas, suits, kurtis, and dupattas) through a seamless online shopping experience. The platform was developed as part of a freelance assignment to showcase a complete end-to-end e-commerce solution, from product listings and shopping cart management to secure checkout and order tracking.

## Tech Stack

- **Frontend:** Next.js (React) with Tailwind CSS for styling  
- **Backend:** Next.js API routes (Node.js/Express under the hood)  
- **Database:** MongoDB with Mongoose ODM  
- **Authentication:** NextAuth (Google OAuth 2.0 login)  
- **Payments:** Razorpay integration for payment processing (online payments)  
- **Storage:** Cloudflare R2 (S3-compatible object storage) for product images  
- **State Management:** Zustand (global state) and React Query (data fetching/caching)  
- **Language:** TypeScript (for type-safe development)

## Features

- **Product Catalog & Categories:** Browse a rich catalog of products organized by categories (Sarees, Lehengas, Suits, Kurtis, Dupattas, etc.). Users can view detailed product pages with multiple images (zoom enabled) and available size options.  

- **Search & Filtering:** Quick product search with suggestions. Filter products by categories, and price range (interactive slider) to find items easily.  

- **Shopping Cart:** Add products to a cart with selected quantities and sizes. Update item quantities or remove items. Cart persistently shows total price and updates as changes are made.  

- **Wishlist:** Save favorite products to a wishlist for future viewing or purchase. Logged-in users can add or remove items from their personal wishlist.  

- **User Authentication:** Secure user accounts with Google OAuth via NextAuth. Users can sign in with their Google account to manage their cart, wishlist, and orders.  

- **Checkout & Payment:** A step-by-step checkout process collects shipping details and allows users to place orders. Integrated **Razorpay** payment gateway for processing credit/debit card or UPI payments. Payments are verified securely before order confirmation.  

- **Order Management:** After checkout, orders are saved in the system. Users can view their order history in a "Your Orders" section, which shows order details and current status. Real-time shipping status updates are fetched via the **Shiprocket** API integration, and users can even cancel orders that haven't shipped.  

- **Admin Panel (Order Administration):** *(Planned)* Basic admin functionality to manage orders. An authorized admin can update order statuses (e.g., mark as Shipped or Delivered) to keep customers informed. (This is facilitated by a protected API endpoint for updating order status.)  

- **Responsive UI & UX:** Mobile-friendly and responsive design. Includes features like a sliding image banner on the homepage, a sticky navigation bar with dropdown menus, and toast notifications (via React-Toastify) for feedback on actions (e.g., item added to cart, order placed successfully).  

- **Inventory Tracking:** Product stock is tracked per size. The system ensures accurate availability display and can prevent ordering out-of-stock items.  

## Getting Started

Follow these steps to run the project locally on your machine:

### 1. Prerequisites
- Install **Node.js** (v18+ recommended)  
- Install **MongoDB**  
- Obtain accounts/API keys for Google OAuth, Razorpay, Shiprocket, and Cloudflare R2 (optional but required for full functionality).  

### 2. Clone the Repository
```bash
git clone https://github.com/Abhi13-02/rj.git
cd rj
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root of the project (Next.js will load this automatically). Add the following:

```env
MONGODB_URI=your_mongodb_connection_string

AUTH_GOOGLE_ID=your_google_oauth_client_id
AUTH_GOOGLE_SECRET=your_google_oauth_secret
AUTH_SECRET=your_nextauth_secret

NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_public_key
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

CLOUDFLARE_R2_ACCOUNT_ID=your_cloudflare_r2_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_cloudflare_r2_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_cloudflare_r2_secret
CLOUDFLARE_R2_BUCKET_NAME=your_r2_bucket_name

# Optional Shiprocket API credentials
SHIPROCKET_API_KEY=your_shiprocket_api_key
```

**Note:** You can skip some variables if you only want to test the UI. Features like login and payments require real keys.

### 5. Run the Development Server
```bash
npm run dev
```

The app will start on `http://localhost:3000`.

### 6. Access the Application
Open your browser at `http://localhost:3000`. You can browse products, sign in, and simulate adding items to the cart. If environment variables are set correctly, you can also test login and the checkout flow.

## Project Structure

```
rj-ecommerce/
│── package.json
│── package-lock.json
│── .scripts/
│   └── deploy.sh
│
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── (products)/
    │   │   │   └── getAllProducts/
    │   │   │       └── route.ts
    │   │   ├── (orders)/
    │   │   │   └── orders/
    │   │   │       ├── cart/
    │   │   │       │   └── route.ts
    │   │   │       └── updateStatus/
    │   │   │           └── route.ts
    │   │   ├── ship/
    │   │   │   └── createOrder/
    │   │   │       └── route.ts
    │   │   ├── upload/
    │   │   │   └── route.ts
    │   │   └── userAdress/
    │   │       └── route.ts
    │   │
    │   ├── product/
    │   │   └── [productId]/
    │   │       └── page.tsx
    │   │
    │   ├── ordering/
    │   │   └── payment/
    │   │       └── page.tsx
    │   │
    │   └── yourOrders/
    │       └── page.tsx
    │
    ├── components/
    │   └── payments/
    │       └── checkoutButton.tsx
    │
    ├── libs/
    │   └── (shiprocket)/
    │       ├── shiprocketClient.ts
    │       └── tokenManager.ts
    │
    ├── models/
    │   ├── Cart.ts
    │   ├── Orders.ts
    │   ├── Products.ts
    │   ├── User.ts
    │   └── Wishlist.ts
    │
    ├── store/
    │   └── productState.ts
    │
    └── auth.ts

```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
