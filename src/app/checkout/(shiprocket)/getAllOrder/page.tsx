"use client";
import React, { useEffect, useState } from 'react';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Fetch orders from the API
        const response = await fetch('/api/ship/getAllOrders');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch orders');
        }

        console.log('Orders fetched:', data.data[0]); 

        setOrders(data.data); // Assuming the API returns an array of orders
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      {loading && <p className="text-gray-600">Loading orders...</p>}

      {error && (
        <div className="text-red-500">
          <p>Error: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div>
          {orders.length === 0 ? (
            <p className="text-gray-600">No orders found.</p>
          ) : (
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border text-black border-gray-200 px-4 py-2 text-left">Order ID</th>
                  <th className="border text-black border-gray-200 px-4 py-2 text-left">Customer Name</th>
                  <th className="border text-black border-gray-200 px-4 py-2 text-left">Mbile number</th>
                  <th className="border text-black border-gray-200 px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border text-white border-gray-200 px-4 py-2">{order.id}</td>
                    <td className="border text-white border-gray-200 px-4 py-2">{order.customer_name}</td>
                    <td className="border text-white border-gray-200 px-4 py-2">{order.customer_phone}</td>
                    <td className="border text-white border-gray-200 px-4 py-2">{order.status}</td>  
                  </tr>     
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
