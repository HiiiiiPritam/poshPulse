import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="px-6 md:px-16 py-10 bg-gray-50">
      <h1 className="text-3xl font-bold text-[#A0214D] mb-6">Privacy Policy</h1>
      <p className="text-lg text-gray-700 leading-relaxed">
        At RJ Traditional, your privacy is of utmost importance to us. This
        policy outlines how we collect, use, and protect your personal
        information:
      </p>
      <ul className="list-disc pl-6 mt-4 text-lg text-gray-700 leading-relaxed">
        <li>
          <strong>Information Collection:</strong> We may collect personal
          details such as your name, contact information, and address during
          the order placement process.
        </li>
        <li>
          <strong>Use of Information:</strong> Your information will only be
          used to process and deliver your order, provide tracking updates, and
          offer customer support.
        </li>
        <li>
          <strong>Data Security:</strong> We implement robust security measures
          to ensure your personal data is protected.
        </li>
        <li>
          <strong>Third-Party Sharing:</strong> We do not sell or share your
          information with third parties except for delivery purposes.
        </li>
      </ul>
      <p className="text-lg text-gray-700 mt-4 leading-relaxed">
        By using our website, you agree to this privacy policy. If you have any
        questions, feel free to contact us via WhatsApp at{" "}
          +91-9649142770
      </p>
    </div>
  );
};

export default PrivacyPolicy;
