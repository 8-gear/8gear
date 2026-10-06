"use client";
import { categoryUrl } from "@/lib/categoryLinks";

import { fetchCategories } from "@/lib/categoryRequests";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";

import { useCart } from "@/app/context/CartContext";
import { CartDrawer } from "@/components/cartdrawer";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  /*
   * Stores the current URL hash.
   *
   * Example:
   * /about#our-story
   *
   * pathname = "/about"
   * activeHash = "#our-story"
   */
  const [activeHash, setActiveHash] = useState("");

  const [categories, setCategories] = useState<
    { name: string; _id: string }[]
  >([]);

  const [mobileDropdown, setMobileDropdown] = useState<
    string | null
  >(null);

  /* =====================================================
     SCROLL STATE
  ===================================================== */
  useEffect(() => {
    const updateNavbar = () => {
      setIsScrolled(window.scrollY > 20);
    };

    updateNavbar();

    window.addEventListener("scroll", updateNavbar, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", updateNavbar);
    };
  }, []);

  /* =====================================================
     CURRENT HASH

     usePathname() does NOT contain the hash,
     so we track it separately.
  ===================================================== */
  useEffect(() => {
    const updateHash = () => {
      setActiveHash(window.location.hash);
    };

    /*
     * Read hash immediately when:
     * - page loads
     * - route changes
     */
    updateHash();

    /*
     * Update when switching between About sections.
     */
    window.addEventListener("hashchange", updateHash);

    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, [pathname]);

  /* =====================================================
     CATEGORIES
  ===================================================== */
  useEffect(() => {
    fetchCategories()
      .then((response) =>
        response.ok ? response.json() : []
      )
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  /* =====================================================
     ABOUT ITEMS
  ===================================================== */
  const aboutItems = [
    {
      name: "Who We Are",
      link: "/about#who-we-are",
    },
    {
      name: "Vision & Mission",
      link: "/about#vision-mission",
    },
    {
      name: "Our Story",
      link: "/about#our-story",
    },
    {
      name: "Sustainability",
      link: "/about#sustainability",
    },
  ];

  /* =====================================================
     COLLECTION ITEMS
  ===================================================== */
  const collectionItems = categories.map((category) => ({
    name: category.name,

    link: categoryUrl(category._id, true),
  }));

  /* =====================================================
     MAIN MENU
  ===================================================== */
  const menuItems = [
    {
      name: "Home",
      link: "/",
    },

    {
      name: "About Us",
      link: "/about",
      children: aboutItems,
    },

    {
      name: "Collection",
      link: "/category",
      children: collectionItems,
    },

    {
      name: "Technology",
      link: "/technology",
    },

    {
      name: "Sustainability",
      link: "/sustainability",
    },

    {
      name: "Contact Us",
      link: "/contact",
    },
  ];

  /* =====================================================
     ACTIVE MAIN MENU
  ===================================================== */
  const isItemActive = (
    item: (typeof menuItems)[number]
  ) => {
    if (item.name === "Home") {
      return pathname === "/";
    }

    if (item.name === "Collection") {
      return (
        pathname === "/category" ||
        pathname.startsWith("/product/")
      );
    }

    /*
     * About Us remains active for:
     *
     * /about
     * /about#who-we-are
     * /about#our-story
     * etc.
     */
    if (item.name === "About Us") {
      return pathname === "/about";
    }

    return (
      pathname === item.link ||
      pathname.startsWith(`${item.link}/`)
    );
  };

  /* =====================================================
     ACTIVE ABOUT SECTION

     Example:

     child.link:
     "/about#our-story"

     current:
     pathname = "/about"
     activeHash = "#our-story"
  ===================================================== */
  const isAboutChildActive = (link: string) => {
    if (pathname !== "/about") {
      return false;
    }

    const hashPosition = link.indexOf("#");

    if (hashPosition === -1) {
      return false;
    }

    const childHash = link.slice(hashPosition);

    return activeHash === childHash;
  };

  return (
    <>
      <nav
        className={cn(
          `
            fixed
            left-0
            top-0
            z-[100]
            w-full

            transition-all
            duration-300
          `,

          isScrolled
            ? `
                border-b
                border-white/35

                bg-white/70

                shadow-[0_8px_32px_rgba(15,23,42,0.10)]

                backdrop-blur-xl
                backdrop-saturate-150
              `
            : "bg-white"
        )}
      >
        {/* =====================================================
            NAV CONTAINER
        ====================================================== */}
        <div
          className="
            mx-auto

            h-[95px]
            w-full
            max-w-[1920px]

            px-[72px]

            max-xl:px-[42px]

            max-lg:flex
            max-lg:items-center
            max-lg:justify-between
            max-lg:px-6

            max-sm:h-[78px]
            max-sm:px-5
          "
        >
          {/* =====================================================
              DESKTOP
          ====================================================== */}
          <div
            className="
              hidden
              h-full
              w-full

              grid-cols-[150px_minmax(0,1fr)_150px]

              items-center

              lg:grid
            "
          >
            {/* =================================================
                LOGO
            ================================================= */}
            <Link
              href="/"
              draggable={false}
              onMouseDown={(event) => event.preventDefault()}
              onDragStart={(event) => event.preventDefault()}
              className="
                flex
                shrink-0
                items-center
                justify-self-start
                navbar-logo
                select-none
              "
            >
              <Image
                src="/logo.webp"
                draggable={false}
                alt="8 Gears"
                width={135}
                height={70}
                priority
                className="
                  h-auto
                  w-[135px]
                  object-contain
                  select-none
                "
              />
            </Link>

            {/* =================================================
                DESKTOP MENU
            ================================================= */}
            <div
              className="
                flex
                min-w-0
                items-center
                justify-center
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-center

                  gap-[clamp(16px,1.65vw,32px)]
                "
              >
                {menuItems.map((item) =>
                  item.children ? (
                    /* =========================================
                        DROPDOWN PARENT
                    ========================================= */
                    <div
                      key={item.name}
                      className="
                        group
                        relative
                        py-8
                      "
                    >
                      <Link
                        href={item.link}
                        aria-current={
                          isItemActive(item)
                            ? "page"
                            : undefined
                        }
                        className={cn(
                          `
                            relative

                            flex
                            items-center
                            gap-1.5

                            whitespace-nowrap

                            rounded-full

                            px-2.5
                            py-2

                            text-[14px]
                            font-normal
                            leading-none
                            tracking-[0.01em]

                            text-[#555555]

                            transition-all
                            duration-200

                            hover:bg-black/[0.045]
                            hover:text-black

                            2xl:text-[15px]
                          `,

                          isItemActive(item) &&
                            `
                              bg-black/[0.055]
                              font-semibold
                              text-black
                            `
                        )}
                      >
                        {item.name}

                        <ChevronDown
                          size={16}
                          strokeWidth={2}
                          className="
                            transition-transform
                            duration-200

                            group-hover:rotate-180
                            group-focus-within:rotate-180
                          "
                        />
                      </Link>

                      {/* =========================================
                          DROPDOWN
                      ========================================= */}
                      <div
                        className="
                          invisible

                          absolute
                          left-1/2
                          top-[calc(100%-8px)]

                          min-w-[250px]

                          -translate-x-1/2
                          translate-y-3

                          overflow-hidden

                          rounded-2xl

                          border
                          border-black/[0.08]

                          bg-white/95

                          p-2.5

                          opacity-0

                          shadow-[0_24px_70px_rgba(15,23,42,0.18)]

                          ring-1
                          ring-white/80

                          backdrop-blur-2xl

                          transition-all
                          duration-200

                          group-hover:visible
                          group-hover:translate-y-0
                          group-hover:opacity-100

                          group-focus-within:visible
                          group-focus-within:translate-y-0
                          group-focus-within:opacity-100
                        "
                      >
                        {/* =====================================
                            DROPDOWN LABEL
                        ====================================== */}
                        <div
                          className="
                            mb-1

                            px-3
                            pb-2
                            pt-1.5

                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.16em]

                            text-black/40
                          "
                        >
                          {item.name === "Collection"
                            ? "Shop by category"
                            : "Discover our brand"}
                        </div>

                        {/* =====================================
                            DROPDOWN CHILDREN
                        ====================================== */}
                        {item.children.length > 0 ? (
                          item.children.map((child) => {
                            /*
                             * ABOUT US DROPDOWN
                             *
                             * Native anchor is intentional.
                             *
                             * This guarantees:
                             * /technology
                             *      ↓
                             * /about#our-story
                             *
                             * loads AND scrolls correctly.
                             */
                            if (item.name === "About Us") {
                              const childActive =
                                isAboutChildActive(
                                  child.link
                                );

                              return (
                                <a
                                  key={child.name}
                                  href={child.link}
                                  aria-current={
                                    childActive
                                      ? "location"
                                      : undefined
                                  }
                                  className={cn(
                                    `
                                      group/item

                                      flex
                                      items-center
                                      justify-between

                                      rounded-xl

                                      px-3
                                      py-3

                                      text-[15px]
                                      font-medium

                                      text-[#555555]

                                      transition-all
                                      duration-200

                                      hover:bg-black
                                      hover:pl-4
                                      hover:text-white
                                    `,

                                    childActive &&
                                      `
                                        bg-black
                                        pl-4
                                        text-white
                                      `
                                  )}
                                >
                                  {child.name}

                                  <span
                                    className={cn(
                                      `
                                        text-lg
                                        leading-none

                                        transition-all
                                      `,

                                      childActive
                                        ? `
                                            translate-x-0
                                            opacity-100
                                          `
                                        : `
                                            translate-x-1
                                            opacity-0

                                            group-hover/item:translate-x-0
                                            group-hover/item:opacity-100
                                          `
                                    )}
                                  >
                                    ›
                                  </span>
                                </a>
                              );
                            }

                            /*
                             * COLLECTION DROPDOWN
                             */
                            return (
                              <Link
                                key={child.name}
                                href={child.link}
                                className="
                                  group/item

                                  flex
                                  items-center
                                  justify-between

                                  rounded-xl

                                  px-3
                                  py-3

                                  text-[15px]
                                  font-medium

                                  text-[#555555]

                                  transition-all

                                  hover:bg-black
                                  hover:pl-4
                                  hover:text-white
                                "
                              >
                                {child.name}

                                <span
                                  className="
                                    translate-x-1

                                    text-lg
                                    leading-none

                                    opacity-0

                                    transition-all

                                    group-hover/item:translate-x-0
                                    group-hover/item:opacity-100
                                  "
                                >
                                  ›
                                </span>
                              </Link>
                            );
                          })
                        ) : (
                          <span
                            className="
                              block

                              px-4
                              py-3

                              text-[14px]
                              text-[#888888]
                            "
                          >
                            No categories available
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* =========================================
                        NORMAL MENU ITEM
                    ========================================= */
                    <Link
                      key={item.name}
                      href={item.link}
                      aria-current={
                        isItemActive(item)
                          ? "page"
                          : undefined
                      }
                      className={cn(
                        `
                          whitespace-nowrap

                          rounded-full

                          px-2.5
                          py-2

                          text-[14px]
                          font-normal
                          leading-none
                          tracking-[0.01em]

                          text-[#555555]

                          transition-all
                          duration-200

                          hover:bg-black/[0.045]
                          hover:text-black

                          2xl:text-[15px]
                        `,

                        isItemActive(item) &&
                          `
                            bg-black/[0.055]
                            font-semibold
                            text-black
                          `
                      )}
                    >
                      {item.name}
                    </Link>
                  )
                )}
              </div>
            </div>

            {/* =================================================
                CART
            ================================================= */}
            <div
              className="
                flex
                items-center
                justify-self-end
              "
            >
              <button
                type="button"
                aria-label="Open Cart"
                onClick={() =>
                  setDrawerOpen(true)
                }
                className="
                  relative

                  flex
                  h-[44px]
                  w-[44px]

                  items-center
                  justify-center

                  rounded-full

                  text-black

                  transition-all
                  duration-200

                  hover:bg-black/[0.045]
                "
              >
                <ShoppingBag
                  size={26}
                  strokeWidth={1.8}
                />

                {cartCount > 0 && (
                  <span
                    className="
                      absolute
                      right-[1px]
                      top-[1px]

                      flex
                      h-[17px]
                      min-w-[17px]

                      items-center
                      justify-center

                      rounded-full

                      bg-black

                      px-[4px]

                      text-[9px]
                      font-bold
                      leading-none
                      text-white
                    "
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* =====================================================
              MOBILE LOGO
          ====================================================== */}
          <Link
            href="/"
              draggable={false}
              onMouseDown={(event) => event.preventDefault()}
              onDragStart={(event) => event.preventDefault()}
            className="
              flex
              shrink-0
              items-center

              lg:hidden
              navbar-logo
              select-none
            "
          >
            <Image
              src="/logo.webp"
                draggable={false}
              alt="8 Gears"
              width={105}
              height={55}
              priority
              className="
                h-auto
                w-[105px]
                object-contain
                select-none
              "
            />
          </Link>

          {/* =====================================================
              MOBILE BUTTONS
          ====================================================== */}
          <div
            className="
              flex
              items-center
              gap-5

              lg:hidden
            "
          >
            {/* CART */}
            <button
              type="button"
              aria-label="Cart"
              onClick={() =>
                setDrawerOpen(true)
              }
              className="
                relative
                text-black
              "
            >
              <ShoppingBag
                size={25}
                strokeWidth={2}
              />

              {cartCount > 0 && (
                <span
                  className="
                    absolute
                    -right-[8px]
                    -top-[8px]

                    flex
                    h-[17px]
                    min-w-[17px]

                    items-center
                    justify-center

                    rounded-full

                    bg-black

                    px-[4px]

                    text-[9px]
                    font-bold
                    leading-none
                    text-white
                  "
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* MENU */}
            <button
              type="button"
              aria-label="Toggle Menu"
              onClick={() =>
                setMobileMenu((previous) => !previous)
              }
              className="
                text-black
              "
            >
              {mobileMenu ? (
                <X size={29} />
              ) : (
                <Menu size={29} />
              )}
            </button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}
        {mobileMenu && (
          <div
            className="
              absolute
              left-0
              top-full

              w-full

              border-t
              border-black/5

              bg-white

              shadow-xl

              lg:hidden
            "
          >
            <div
              className="
                flex
                flex-col

                px-7
                py-8
              "
            >
              {menuItems.map((item) =>
                item.children ? (
                  /* =========================================
                      MOBILE DROPDOWN
                  ========================================= */
                  <div
                    key={item.name}
                    className="
                      border-b
                      border-black/5
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                      "
                    >
                      <Link
                        href={item.link}
                        onClick={() =>
                          setMobileMenu(false)
                        }
                        aria-current={
                          isItemActive(item)
                            ? "page"
                            : undefined
                        }
                        className={cn(
                          `
                            flex-1

                            py-4

                            text-[18px]
                            font-medium
                            text-[#555555]
                          `,

                          isItemActive(item) &&
                            `
                              font-bold
                              text-black
                            `
                        )}
                      >
                        {item.name}
                      </Link>

                      <button
                        type="button"
                        aria-label={`Toggle ${item.name} menu`}
                        aria-expanded={
                          mobileDropdown === item.name
                        }
                        onClick={() =>
                          setMobileDropdown(
                            (current) =>
                              current === item.name
                                ? null
                                : item.name
                          )
                        }
                        className="
                          p-4
                          text-[#555555]
                        "
                      >
                        <ChevronDown
                          size={20}
                          className={cn(
                            "transition-transform",

                            mobileDropdown ===
                              item.name &&
                              "rotate-180"
                          )}
                        />
                      </button>
                    </div>

                    {mobileDropdown === item.name && (
                      <div className="pb-3 pl-5">
                        {item.children.length > 0 ? (
                          item.children.map(
                            (child) => {
                              /*
                               * ABOUT MOBILE CHILD
                               */
                              if (
                                item.name ===
                                "About Us"
                              ) {
                                const childActive =
                                  isAboutChildActive(
                                    child.link
                                  );

                                return (
                                  <a
                                    key={
                                      child.name
                                    }
                                    href={
                                      child.link
                                    }
                                    onClick={() => {
                                      setMobileMenu(
                                        false
                                      );

                                      setMobileDropdown(
                                        null
                                      );
                                    }}
                                    aria-current={
                                      childActive
                                        ? "location"
                                        : undefined
                                    }
                                    className={cn(
                                      `
                                        block

                                        rounded-lg

                                        px-3
                                        py-2.5

                                        text-[16px]

                                        transition-colors

                                        text-[#777777]
                                      `,

                                      childActive &&
                                        `
                                          bg-black
                                          font-medium
                                          text-white
                                        `
                                    )}
                                  >
                                    {
                                      child.name
                                    }
                                  </a>
                                );
                              }

                              /*
                               * COLLECTION MOBILE CHILD
                               */
                              return (
                                <Link
                                  key={
                                    child.name
                                  }
                                  href={
                                    child.link
                                  }
                                  onClick={() => {
                                    setMobileMenu(
                                      false
                                    );

                                    setMobileDropdown(
                                      null
                                    );
                                  }}
                                  className="
                                    block

                                    py-2.5

                                    text-[16px]
                                    text-[#777777]
                                  "
                                >
                                  {
                                    child.name
                                  }
                                </Link>
                              );
                            }
                          )
                        ) : (
                          <span
                            className="
                              block

                              py-2.5

                              text-[14px]
                              text-[#999999]
                            "
                          >
                            No categories available
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* =========================================
                      NORMAL MOBILE LINK
                  ========================================= */
                  <Link
                    key={item.name}
                    href={item.link}
                    onClick={() =>
                      setMobileMenu(false)
                    }
                    aria-current={
                      isItemActive(item)
                        ? "page"
                        : undefined
                    }
                    className={cn(
                      `
                        border-b
                        border-black/5

                        py-4

                        text-[18px]
                        font-medium
                        text-[#555555]
                      `,

                      isItemActive(item) &&
                        `
                          font-bold
                          text-black
                        `
                    )}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </nav>

      {/* =====================================================
          CART DRAWER
      ====================================================== */}
      <CartDrawer
        isOpen={drawerOpen}
        onClose={() =>
          setDrawerOpen(false)
        }
      />
    </>
  );
}