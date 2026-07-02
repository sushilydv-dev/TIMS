import React from "react";
import { Link } from "react-router-dom";
import { LOGO_PATH } from "../constants";

const CancellationPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-black/[0.04] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <img
              src={LOGO_PATH}
              alt="TIMS Logo"
              className="h-[30px] w-[40px]"
            />
            <span className="text-2xl font-black tracking-tight text-[#0c0407] group-hover:text-black/80 transition-colors duration-200">
              TIMS
            </span>
          </Link>
          <Link
            to="/"
            className="text-sm font-semibold text-[#636363] hover:text-[#fc362d] transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 lg:px-16 py-16 md:py-24">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight mb-4">
            Cancellation Policy
          </h1>
          <p className="text-[#636363] text-base md:text-lg leading-relaxed">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#0c0407] mb-4">
              1. Overview
            </h2>
            <p className="text-[#636363] leading-relaxed mb-4">
              At TIMS, we understand that circumstances may change. This policy outlines the terms and conditions for cancelling course enrollments and the associated refund process. We strive to be fair and transparent while maintaining the quality of our educational programs.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#0c0407] mb-4">
              2. Cancellation Timeline
            </h2>
            <p className="text-[#636363] leading-relaxed mb-4">
              Refund eligibility is based on the timing of your cancellation request:
            </p>
            <ul className="list-disc pl-6 text-[#636363] leading-relaxed mb-4 space-y-2">
              <li><strong>30+ days before course start:</strong> 100% refund of course fees. No cancellation charges apply.</li>
              <li><strong>15-29 days before course start:</strong> 75% refund of course fees. 25% cancellation fee applies.</li>
              <li><strong>7-14 days before course start:</strong> 50% refund of course fees. 50% cancellation fee applies.</li>
              <li><strong>Less than 7 days before course start:</strong> No refund available. Course fees are non-refundable.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#0c0407] mb-4">
              3. Cancellation Process
            </h2>
            <p className="text-[#636363] leading-relaxed mb-4">
              To request a cancellation, follow these steps:
            </p>
            <ol className="list-decimal pl-6 text-[#636363] leading-relaxed mb-4 space-y-2">
              <li>Submit a cancellation request through your dashboard or email support@tims.com</li>
              <li>Our team will review your request within 2-3 business days</li>
              <li>Approved refunds will be processed within 7-10 business days</li>
              <li>You will receive confirmation via email once the refund is processed</li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#0c0407] mb-4">
              4. Exceptions & Special Cases
            </h2>
            <p className="text-[#636363] leading-relaxed mb-4">
              In certain circumstances, exceptions to the standard cancellation policy may be considered:
            </p>
            <ul className="list-disc pl-6 text-[#636363] leading-relaxed mb-4 space-y-2">
              <li>Medical emergencies with valid documentation</li>
              <li>Military deployment or transfer</li>
              <li>Course cancellation by TIMS</li>
              <li>Force majeure events</li>
            </ul>
            <p className="text-[#636363] leading-relaxed mb-4">
              For exception requests, please provide supporting documentation along with your cancellation request. Each case will be reviewed individually.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#0c0407] mb-4">
              5. Refund Method
            </h2>
            <p className="text-[#636363] leading-relaxed mb-4">
              Refunds will be processed using the same payment method used for the original purchase. If the original payment method is no longer available, we will work with you to determine an alternative refund method.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#0c0407] mb-4">
              6. Contact Us
            </h2>
            <p className="text-[#636363] leading-relaxed mb-4">
              If you have any questions about our cancellation policy or need assistance with a cancellation request, please contact our support team at support@tims.com or through your dashboard.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#fbfbfc] border-t border-black/[0.04] py-8 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs md:text-sm text-gray-400 font-semibold">
            &copy; {new Date().getFullYear()} TIMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CancellationPolicy;
