"use client";

import { categoryUrl, resolveCategory } from "@/lib/categoryLinks";
import { fetchCategories } from "@/lib/categoryRequests";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import ProductCard from "@/components/productcard";
import { ProductSkeleton } from "@/components/Skeleton";
import { cn } from "@/lib/utils";
import type { Product } from "@/app/types/product";

type CategoryOption = { _id: string; name: string; slug?: string; aliases?: string[] };

export default function CategoryListing() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const isInternalFilterClickRef = useRef(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetchCategories().then((res) => res.json()),
    ])
      .then(([productsData, categoriesData]) => {
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        }

        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      if (isInternalFilterClickRef.current) {
        isInternalFilterClickRef.current = false;
        return;
      }

      const hash = window.location.hash;
      const currentCat = (
        searchParams.get("categoryId") || searchParams.get("slug") || searchParams.get("cat") || "all"
      ).toLowerCase();

      if (hash === "#category-listing") {
        const scrollToListing = (behavior: ScrollBehavior = "auto") => {
          const target = document.getElementById("category-listing");
          if (!target) return;

          const navbarOffset = 115;
          const targetTop =
            window.scrollY +
            target.getBoundingClientRect().top -
            navbarOffset;

          window.scrollTo({
            top: Math.max(0, targetTop),
            behavior,
          });
        };

        const timer1 = setTimeout(() => scrollToListing("auto"), 100);
        const timer2 = setTimeout(() => scrollToListing("smooth"), 400);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      } else if (currentCat === "all") {
        const forceTop = () => {
          if (window.location.hash !== "#category-listing") {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          }
        };

        forceTop();
        const rafId = requestAnimationFrame(forceTop);
        const timerId = setTimeout(forceTop, 50);

        return () => {
          cancelAnimationFrame(rafId);
          clearTimeout(timerId);
        };
      }
    };

    const cleanupScroll = handleScroll();

    const handlePopStateOrPageShow = () => {
      const hash = window.location.hash;
      const currentCat = (
        new URLSearchParams(window.location.search).get("categoryId") || new URLSearchParams(window.location.search).get("slug") || new URLSearchParams(window.location.search).get("cat") || "all"
      ).toLowerCase();

      if (hash !== "#category-listing" && currentCat === "all") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        });
      }
    };

    window.addEventListener("popstate", handlePopStateOrPageShow);
    window.addEventListener("pageshow", handlePopStateOrPageShow);

    return () => {
      if (cleanupScroll) cleanupScroll();
      window.removeEventListener("popstate", handlePopStateOrPageShow);
      window.removeEventListener("pageshow", handlePopStateOrPageShow);
    };
  }, [searchParams]);

  const selectedCategory = resolveCategory(categories, searchParams.get("categoryId"), searchParams.get("cat"), searchParams.get("slug"));
  const selectedCategoryValue = selectedCategory?._id || (searchParams.get("categoryId") || searchParams.get("slug") || searchParams.get("cat") || "all");
  const selectedCategoryName = selectedCategory?.name;

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategoryValue !== "all") {
      result = result.filter(
        (product) =>
          String(product.category || "").toLowerCase() ===
          selectedCategoryName?.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();

      result = result.filter(
        (product) =>
          product.title?.toLowerCase().includes(query) ||
          product.baseDescription?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query) ||
          String(product.category || "")
            .toLowerCase()
            .includes(query)
      );
    }

    return result;
  }, [products, searchQuery, selectedCategoryValue, selectedCategoryName]);

  const updateCategory = (categoryId: string) => {
    isInternalFilterClickRef.current = true;

    // Products are already loaded: update the filter URL without fetching a new server page.
    window.history.pushState(null, "", categoryUrl(categoryId === "all" ? undefined : categoryId));
  };

  return (
    <section className="min-h-screen bg-white px-[24px] pb-[100px] pt-[60px] sm:px-[40px] lg:px-[72px] lg:pt-[70px]">
      <div className="mx-auto w-full max-w-[1904px]">
        {/* =========================================================
            TOP TITLE AND PRODUCT COUNT
        ========================================================= */}
        <div className="flex items-start justify-between gap-6">
          <h1 className="font-[var(--font-sf-pro)] text-[34px] font-normal leading-none tracking-[-1.5px] text-black sm:text-[42px] lg:text-[46px]">
            {selectedCategoryName ? (
              <><span className="font-bold tracking-[-2px]">{selectedCategoryName}</span> Collection</>
            ) : (
              <>The Full <span className="font-bold tracking-[-2px]">Collection</span></>
            )}
          </h1>

          <p className="hidden pt-[10px] font-[var(--font-sf-pro)] text-[12px] font-normal tracking-[0.08em] text-[#8ba0bf] sm:block">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* =========================================================
            FILTER BUTTONS AND SEARCH BAR
        ========================================================= */}
        <div className="mt-[54px] flex flex-col gap-[24px] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-[18px]">
            <button
              type="button"
              onClick={() => updateCategory("all")}
              className={cn(
                "flex h-[44px] items-center justify-center rounded-full border px-[28px] font-[var(--font-sf-pro)] text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300",
                selectedCategoryValue === "all"
                  ? "border-black bg-black text-white"
                  : "border-[#9c9c9c] bg-white text-[#5c5c5c] hover:border-black hover:text-black"
              )}
            >
              All Gear
            </button>

            {categories.map((category) => {
              const isActive =
                category._id === selectedCategoryValue;

              return (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => updateCategory(category._id)}
                  className={cn(
                    "flex h-[44px] items-center justify-center rounded-full border px-[28px] font-[var(--font-sf-pro)] text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300",
                    isActive
                      ? "border-black bg-black text-white"
                      : "border-[#9c9c9c] bg-white text-[#5c5c5c] hover:border-black hover:text-black"
                  )}
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:max-w-[680px]">
            <Search
              size={20}
              strokeWidth={1.7}
              className="pointer-events-none absolute left-[27px] top-1/2 -translate-y-1/2 text-[#777777]"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by gear name, brand, or mission class..."
              className="h-[64px] w-full rounded-full border border-[#e6e6e6] bg-white pl-[60px] pr-[28px] font-[var(--font-sf-pro)] text-[14px] font-normal text-black outline-none transition-colors duration-300 placeholder:text-[#777777] focus:border-[#b5b5b5]"
            />
          </div>
        </div>

        {/* Mobile Product Counter */}
        <p className="mt-[20px] font-[var(--font-sf-pro)] text-[12px] font-normal tracking-[0.08em] text-[#8ba0bf] sm:hidden">
          Showing {filteredProducts.length} of {products.length} products
        </p>

        {/* =========================================================
            PRODUCTS GRID
        ========================================================= */}
        <div className="mt-[38px]">
          {loading ? (
            <div className="grid grid-cols-1 gap-x-[28px] gap-y-[34px] sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-[28px] gap-y-[34px] sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <div
                  key={`${selectedCategoryValue}-${searchQuery}-${product._id}`}
                  className="product-card-animation"
                  style={{
                    animationDelay: `${index * 65}ms`,
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[20px] border border-[#eeeeee] bg-[#fafafa] px-5 text-center">
              <Filter
                size={42}
                strokeWidth={1.4}
                className="mb-[18px] text-[#c4c4c4]"
              />

              <h3 className="font-[var(--font-sf-pro)] text-[22px] font-semibold tracking-[-0.4px] text-black">
                No Products Found
              </h3>

              <p className="mt-[8px] font-[var(--font-sf-pro)] text-[14px] font-normal text-[#777777]">
                Try another category or search with a different keyword.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .product-card-animation {
          opacity: 0;
          transform: translateY(20px);
          animation: productCardFadeUp 500ms ease-out forwards;
        }

        @keyframes productCardFadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
