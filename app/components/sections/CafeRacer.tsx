"use client";


import Link from "next/link";
import { useRouter } from "next/navigation";

const categories = [{ name: "Denim", href: "/category?categoryId=6a65dfecc52b57a1a991f914#category-listing" }, { name: "Fleece", href: "/category?categoryId=6a65dfd4c52b57a1a991f913#category-listing" }, { name: "Chino’s", href: "/category?categoryId=6a65dfc1c52b57a1a991f911#category-listing" }, { name: "Cargo’s", href: "/category?categoryId=6a65dfc9c52b57a1a991f912#category-listing" }];

export default function CafeRacer() {
  const router = useRouter();

  return (
    <section className="relative w-full overflow-hidden bg-white py-[40px] sm:py-[50px] lg:py-[70px]">
      {/* BANNER */}
      <div className="relative mx-auto h-[620px] w-[calc(100%-32px)] max-w-[1500px] overflow-hidden rounded-[28px] sm:w-[calc(100%-48px)] lg:h-[720px] lg:w-[calc(100%-80px)]">
        
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/assets/images/cafe-racer-banner.webp')",
          }}
        />

        {/* Main dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Left readability gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.56)_0%,rgba(0,0,0,0.25)_42%,rgba(0,0,0,0.06)_70%,rgba(0,0,0,0)_100%)]" />

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* CONTENT */}
        <div className="absolute bottom-[40px] left-[24px] right-[24px] z-10 text-white sm:bottom-[55px] sm:left-[42px] sm:right-auto lg:bottom-[70px] lg:left-[72px]">
          {/* Title */}
          <h2 className="font-[var(--font-sf-pro)] text-[34px] font-medium leading-[1.05] tracking-[-1px] text-white sm:text-[40px] lg:text-[48px]">
            Cafe Racer&apos;s
          </h2>

          {/* Description */}
          <p className="mt-[18px] max-w-[740px] font-[var(--font-sf-pro)] text-[15px] font-normal leading-[1.4] text-white/95 sm:text-[17px] lg:text-[20px]">
            Ride in style with our latest Collection in Certified and sustainable
            Apparel
          </p>

          {/* Categories */}
          <div className="mt-[28px] flex max-w-[700px] flex-wrap items-center gap-x-[24px] gap-y-[14px] sm:mt-[34px] sm:gap-x-[34px] lg:gap-x-[38px]">
            {categories.map((category) => {
              return (
                <Link
                  key={category.href}
                  href={category.href}
                  className="flex items-center gap-[12px] hover:opacity-85 transition-opacity"
                >
                  <span className="h-[3px] w-[24px] rounded-full bg-[#a67547]" />

                  <span className="font-[var(--font-sf-pro)] text-[16px] font-semibold text-white sm:text-[19px] lg:text-[21px]">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push("/category")}
            className="mt-[34px] flex h-[50px] w-[200px] items-center justify-center gap-[12px] rounded-full bg-white font-[var(--font-sf-pro)] text-[14px] font-medium text-black transition-colors duration-300 hover:bg-[#f1f1f1] sm:mt-[42px]"
          >
            Learn More
            <span className="text-[17px] leading-none">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}