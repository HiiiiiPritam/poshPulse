import React from "react";

const ShippingPolicy = () => {
  return (
    <div className="px-6 md:px-16 py-10 bg-gray-50">
      <h1 className="text-3xl font-bold text-[#A0214D] mb-6">Shipping Policy</h1>
      <ul className="list-disc pl-6 mt-4 text-lg text-gray-700 leading-relaxed">
        <li>Orders are dispatched within <strong>1-3 working days</strong>.</li>
        <li>Orders can be cancelled as long as they <strong>have not been shipped.</strong></li>
        <li>Delivery takes approximately <strong>6-8 working days</strong>.</li>
        <li>
          Tracking ID will be provided via WhatsApp at{" "}
            +91-9649142770
        </li>
        <li>Any shipping charges will be shown at checkout.</li>
      </ul>
    </div>
  );
};

export default ShippingPolicy;
