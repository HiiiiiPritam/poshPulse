import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="px-6 md:px-16 py-10 bg-gray-50">
      <h1 className="text-3xl font-bold text-[#A0214D] mb-6">
        Terms and Conditions
      </h1>
      <ul className="list-disc pl-6 mt-4 text-lg text-gray-700 leading-relaxed">
        <li>
          All products are handcrafted. Slight variations in color or design are
          normal.
        </li>
        <li>
          Ensure accurate details during checkout. RJ Traditional is not
          responsible for delays due to incorrect details.
        </li>
        <li>
          Returns are accepted for defective items only, with proof provided via
          an opening video.
        </li>
        <li>
          Orders can be cancelled as long as they have not been shipped. 
        </li>
        <li>Orders are delivered within 6-8 days after dispatch.</li>
        <li>
          For support, contact us via WhatsApp at{" "}
            +91-9649142770
        </li>
      </ul>
    </div>
  );
};

export default TermsAndConditions;
