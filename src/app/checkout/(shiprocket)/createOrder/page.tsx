"use client";
import { useState } from "react";
import axios from "axios";

export default function CreateOrder() {
  const [formData, setFormData] = useState({
    order_id: "224-447",
    order_date: "2024-12-17 11:11",
    pickup_location: "Home",
    channel_id: "",
    comment: "Reseller: M/s Goku",
    billing_customer_name: "Naruto",
    billing_last_name: "Uzumaki",
    billing_address: "House 221B, Leaf Village",
    billing_address_2: "Near Hokage House",
    billing_city: "New Delhi",
    billing_pincode: "110002",
    billing_state: "Delhi",
    billing_country: "India",
    billing_email: "naruto@uzumaki.com",
    billing_phone: "9876543210",
    shipping_is_billing: true,
    order_items: [
      {
        name: "Kunai",
        sku: "chakra123",
        units: 10,
        selling_price: "900",
        discount: "",
        tax: "",
        hsn: 441122,
      },
    ],
    payment_method: "Prepaid",
    shipping_charges: 100,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: 9000,
    length: 10,
    breadth: 15,
    height: 20,
    weight: 2.5,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.order_items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setFormData({ ...formData, order_items: updatedItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/ship/createOrder", formData);
      alert("Order created successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order.");
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">Create Shiprocket Order</h1>
      <form className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg" onSubmit={handleSubmit}>
        {/* General Order Details */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Order ID</label>
          <input
            type="text"
            name="order_id"
            value={formData.order_id}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Order Date</label>
          <input
            type="text"
            name="order_date"
            value={formData.order_date}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Pickup Location</label>
          <input
            type="text"
            name="pickup_location"
            value={formData.pickup_location}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded-md"
          />
        </div>

        {/* Billing Details */}
        <h2 className="text-xl font-semibold mt-4 mb-2">Billing Details</h2>
        <div className="mb-4">
          <label className="block text-sm mb-1">Customer Name</label>
          <input
            type="text"
            name="billing_customer_name"
            value={formData.billing_customer_name}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Address</label>
          <textarea
            name="billing_address"
            value={formData.billing_address}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded-md"
          />
        </div>

        {/* Order Items */}
        <h2 className="text-xl font-semibold mt-4 mb-2">Order Items</h2>
        {formData.order_items.map((item, index) => (
          <div key={index} className="mb-4">
            <label className="block text-sm mb-1">Item Name</label>
            <input
              type="text"
              name="name"
              value={item.name}
              onChange={(e) => handleItemChange(index, e)}
              className="w-full p-2 bg-gray-700 text-white rounded-md"
            />
          </div>
        ))}

        {/* Payment and Dimensions */}
        <h2 className="text-xl font-semibold mt-4 mb-2">Payment & Dimensions</h2>
        <div className="mb-4">
          <label className="block text-sm mb-1">Payment Method</label>
          <input
            type="text"
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded-md"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 mb-4">
            <label className="block text-sm mb-1">Length</label>
            <input
              type="number"
              name="length"
              value={formData.length}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 text-white rounded-md"
            />
          </div>
          <div className="flex-1 mb-4">
            <label className="block text-sm mb-1">Breadth</label>
            <input
              type="number"
              name="breadth"
              value={formData.breadth}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 text-white rounded-md"
            />
          </div>
          <div className="flex-1 mb-4">
            <label className="block text-sm mb-1">Height</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 text-white rounded-md"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Create Order
        </button>
      </form>
    </div>
  );
}
