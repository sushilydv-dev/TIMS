import React from "react";
import { Link } from "react-router-dom";
import { LOGO_PATH } from "../constants";

const PrivacyPolicy = () => {
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
            Privacy Policy
          </h1>
          <p className="text-[#636363] text-base md:text-lg leading-relaxed">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#0c0407] mb-4">
              1. Introduction
            </h2>
            <p className="text-[#636363] leading-relaxed mb-4">
              Welcome to TIMS (Training & Internship Management System). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#0c0407] mb-4">
              2. Data We Collect
            </h2>
            <p className="text-[#636363] leading-relaxed mb-4">
              We may collect, use, store and transfer different kinds of personal data about you, which we have grouped together follows:
            </p>
            <ul className="list-disc pl-6 text-[#636363] leading-relaxed mb-4 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
              <li><strong>Profile Data:</strong> includes your profile picture, bio, and other information related to your trainer or student profile.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#0c0407] mb-4">
              3. How We Use Your Data
            </h2>
            <p className="text-[#636363] leading-relaxed mb-4">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-[#636363] leading-relaxed mb-4 space-y-2">
              <li>To register you as a new user of our platform.</li>
              <li>To process and deliver your training and internship-related requests.</li>
              <li>To manage our relationship with you which will include notifying you about changes to our terms or privacy policy.</li>
              <li>To administer and protect our business and website, including troubleshooting, data analysis, testing, system maintenance, support, reporting and hosting of data.</li>
              <li>To deliver relevant website content and advertisements to you and measure or understand the effectiveness of the advertising we serve to you.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#0c0407] mb-4">
              4. Data Security
            </h2>
            <p className="text-[#636363] leading-relaxed mb-4">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#0c0407] mb-4">
              5. Your Legal Rights
            </h2>
            <p className="text-[#636363] leading-relaxed mb-4">
              Under certain circumstances, you have rights under data protection laws in relation to your personal data including:
            </p>
            <ul className="list-disc pl-6 text-[#636363] leading-relaxed mb-4 space-y-2">
              <li><strong>Request access to your personal数据.</strong> The right to request a copy of the personal data we hold about you.</li>
              <li><strong>Request correction of your personal data.</strong> The right to have inaccurate personal data corrected.</li>
              <li><strong>Request erasure of your personal data.</strong> The right to request the deletion of your personal data.</li>
              <li><strong>Object to processing of your personal data.</strong> The right to object to our processing of your personal data.</li>
              <li><strong>Request restriction of processing.</strong> The right to request that we restrict the processing of your personal data.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#0c0407] mb-4">
              6. Contact Us
            </h2>
            <p className="text-[#636363] leading-relaxed mb-4">
              If you have any questions about this privacy policy, please contact us through our support channels or email us at support@tims.com.
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

export default PrivacyPolicy;
