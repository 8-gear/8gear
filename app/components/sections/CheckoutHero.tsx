"use client";

import Link from "next/link";

export default function CheckoutHero() {
  return (
    <section className="pt-24 pb-10 bg-[#FCF8F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 flex flex-wrap items-center justify-center gap-2">
          <Link href="/" className="hover:text-orange-600 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/category" className="hover:text-orange-600 transition">
            Shop
          </Link>
          <span>/</span>
          <span className="font-semibold text-orange-600">Checkout</span>
        </div>

        {/* Title */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="h-8 w-1.5 rounded-full bg-orange-600" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-black">
            Secure Checkout
          </h1>
        </div>

        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
          Confirm your details and place your order securely. Fast delivery and easy returns.
        </p>
      </div>
    </section>
  );
}
