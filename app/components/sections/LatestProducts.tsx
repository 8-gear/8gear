"use client";

import Link from "next/link";
import ProductCard from "@/components/productcard";
import { useEffect, useState } from "react";
import { ProductSkeleton } from "@/components/Skeleton";
import type { Product } from "@/app/types/product";

export default function LatestProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?limit=4")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("API returned non-array data:", data);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  // The products API returns active products ordered newest first.
  const latestProducts = products.slice(0, 4);

  return (
    <section className="w-full overflow-hidden bg-white">
      <div
        className="
          mx-auto
          w-full
          max-w-[1920px]

          py-[48px]

          sm:px-[40px]
          sm:py-[72px]

          md:py-[88px]

          lg:px-[70px]
          lg:py-[100px]

          xl:px-[72px]
        "
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div
          className="
            mb-[26px]
            flex
            items-center
            justify-between
            gap-[20px]

            px-[20px]

            sm:mb-[38px]
            sm:px-0

            lg:mb-[42px]
          "
        >
          {/* TITLE */}
          <h2
            className="
              font-[var(--font-sf-pro)]

              text-[27px]
              font-normal
              leading-none
              tracking-[-0.7px]
              text-black

              sm:text-[36px]
              sm:tracking-[-0.9px]

              lg:text-[44px]
              lg:tracking-[-1px]
            "
          >
            Latest{" "}
            <span className="font-bold">
              Showcase
            </span>
          </h2>

          {/* EXPLORE MORE - DESKTOP */}
          <Link
            href="/category"
            className="
              group

              hidden

              h-[50px]
              w-[190px]

              items-center
              justify-center
              gap-[10px]

              rounded-full

              border
              border-black

              bg-transparent

              font-[var(--font-sf-pro)]
              text-[14px]
              font-medium
              text-black

              transition-all
              duration-300

              hover:bg-black
              hover:text-white

              sm:flex

              lg:h-[52px]
              lg:w-[205px]
              lg:gap-[12px]
            "
          >
            <span>Explore More</span>

            <span
              className="
                text-[17px]
                leading-none

                transition-transform
                duration-300

                group-hover:translate-x-[4px]
              "
            >
              →
            </span>
          </Link>
        </div>

        {/* =====================================================
            PRODUCTS
            Mobile: horizontal swipe
            Desktop: normal grid
        ====================================================== */}

        <div
          className="
            flex
            w-full

            snap-x
            snap-mandatory

            gap-[14px]

            overflow-x-auto
            overscroll-x-contain

            px-[20px]
            pb-[8px]

            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden

            sm:grid
            sm:grid-cols-2
            sm:gap-x-[22px]
            sm:gap-y-[38px]
            sm:overflow-visible
            sm:px-0
            sm:pb-0
            sm:snap-none

            lg:grid-cols-4
            lg:gap-x-[28px]
            lg:gap-y-[42px]
          "
        >
          {loading
            ? [...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="
                    w-[74vw]
                    max-w-[285px]
                    shrink-0
                    snap-start

                    sm:w-full
                    sm:max-w-none
                    sm:shrink
                  "
                >
                  <ProductSkeleton />
                </div>
              ))
            : latestProducts.map((product) => (
                <div
                  key={product._id}
                  className="
                    w-[74vw]
                    max-w-[285px]
                    shrink-0
                    snap-start

                    sm:w-full
                    sm:max-w-none
                    sm:shrink
                    sm:min-w-0
                  "
                >
                  <ProductCard product={product} />
                </div>
              ))}
        </div>

        {/* =====================================================
            MOBILE SWIPE HINT
        ====================================================== */}

        {!loading && latestProducts.length > 1 && (
          <div
            className="
              mt-[14px]
              flex
              items-center
              justify-center
              gap-[6px]

              px-[20px]

              sm:hidden
            "
          >
            <span
              className="
                font-[var(--font-sf-pro)]
                text-[10px]
                font-normal
                uppercase
                tracking-[0.12em]
                text-[#8d8d8d]
              "
            >
              Swipe to explore
            </span>

            <span className="text-[13px] text-[#8d8d8d]">
              →
            </span>
          </div>
        )}

        {/* =====================================================
            MOBILE EXPLORE BUTTON
        ====================================================== */}

        <div
          className="
            mt-[28px]
            flex
            justify-center

            px-[20px]

            sm:hidden
          "
        >
          <Link
            href="/category"
            className="
              group

              flex
              h-[46px]
              w-[180px]

              items-center
              justify-center
              gap-[9px]

              rounded-full

              border
              border-black

              bg-transparent

              font-[var(--font-sf-pro)]
              text-[13px]
              font-medium
              text-black

              transition-all
              duration-300

              active:scale-[0.98]

              hover:bg-black
              hover:text-white
            "
          >
            <span>Explore More</span>

            <span
              className="
                text-[16px]
                leading-none

                transition-transform
                duration-300

                group-hover:translate-x-[4px]
              "
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
