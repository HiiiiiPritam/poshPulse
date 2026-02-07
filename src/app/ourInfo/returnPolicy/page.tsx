import React from "react";

const ReturnPolicy = () => {
  return (
    <div className="px-6 md:px-16 py-10 bg-gray-50">
      <h1 className="text-3xl font-bold text-[#A0214D] mb-6">Return Policy</h1>
      <p className="text-lg text-gray-700 leading-relaxed">
        We follow a strict <strong>no refund policy</strong>. However, we ensure
        quality and take responsibility for defective items. Returns are
        accepted only under the following conditions:
      </p>
      <ul className="list-disc pl-6 mt-4 text-lg text-gray-700 leading-relaxed">
        <li>
          <strong>Defective Items:</strong> If the item you received is
          defective, you can request a return. The defect must be evident in an{" "}
          <strong>opening video</strong> provided by the customer.
        </li>
        <li>
          <strong>Process for Returns:</strong> Contact our team via WhatsApp
          at{" "}
            +91-9649142770
          {" "}
          for return assistance. Returns will only be initiated if the defect
          is verified.
        </li>
        <li>
          <strong>Condition for Returns:</strong> The item must be unused,
          unwashed, and in its original packaging.
        </li>
      </ul>
    </div>
  );
};

export default ReturnPolicy;
