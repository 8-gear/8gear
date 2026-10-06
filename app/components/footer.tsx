"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";

const exploreLinks = [
  { name: "Collection", href: "/category" },
  { name: "Technology", href: "/technology" },
  { name: "Sustainability", href: "/sustainability" },
];

const supportLinks = [
  { name: "Terms & Conditions", href: "/tncs" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "About 8Gear", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Return Policy", href: "/return-policy" },
  { name: "Shipping Policy", href: "/shipping-policy" },
  { name: "Warranty", href: "/warranty" },
];

const otherLinks = [
  { name: "Dealers", href: "/dealers" },
  // { name: "Journal", href: "/blog" },
  { name: "Catalog", href:"/assets/8GearCatalogueRetailersBooklet.pdf"},
];

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/1LRLfA46SL/",
    icon: Facebook,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/8gearofficial/?utm_source=ig_web_button_share_sheet",
    icon: Instagram,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/8-gear/",
    icon: Linkedin,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@8-gear",
    icon: Youtube,
  },
];

function FooterContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (href: string) => {
    const [hrefPath, queryString] = href.split("?");

    if (pathname !== hrefPath) {
      return false;
    }

    if (!queryString) {
      return true;
    }

    const linkParams = new URLSearchParams(queryString);

    for (const [key, value] of linkParams.entries()) {
      if (searchParams.get(key) !== value) {
        return false;
      }
    }

    return true;
  };

  const footerLinkClass = (href: string) => {
    const active = isActive(href);

    return `
      relative
      w-fit

      font-[var(--font-sf-pro)]
      text-[12px]
      font-normal
      leading-[1.25]

      transition-all
      duration-200

      sm:text-[15px]
      lg:text-[16px]
      2xl:text-[19px]

      ${
        active
          ? "font-medium text-black"
          : "text-[#68635f] hover:text-black"
      }
    `;
  };

  const renderLinks = (
    links: {
      name: string;
      href: string;
    }[]
  ) =>
    links.map((item) => {
      const active = isActive(item.href);

      return (
        <Link
          key={item.name}
          href={item.href}
          className={footerLinkClass(item.href)}
        >
          {item.name}

          <span
            className={`
              absolute
              -bottom-[4px]
              left-0

              h-[1.5px]
              rounded-full
              bg-black

              transition-all
              duration-300

              sm:-bottom-[6px]
              sm:h-[2px]

              ${
                active
                  ? "w-full opacity-100"
                  : "w-0 opacity-0"
              }
            `}
          />
        </Link>
      );
    });

  return (
    <footer className="w-full bg-[#f4f2ef]">
      <div
        className="
          mx-auto
          w-full
          max-w-[1920px]

          px-5
          py-9

          sm:px-10
          sm:py-[55px]

          lg:px-[60px]
          lg:py-[70px]

          xl:px-[100px]

          2xl:px-[135px]
          2xl:py-[82px]
        "
      >
        {/* =====================================================
            MAIN GRID
        ====================================================== */}

        <div
          className="
            grid

            grid-cols-[0.9fr_1.35fr_0.8fr]
            gap-x-4
            gap-y-8

            sm:grid-cols-3
            sm:gap-x-10
            sm:gap-y-10

            lg:grid-cols-[0.8fr_1.15fr_0.7fr_0.8fr]
            lg:gap-x-[45px]

            xl:grid-cols-[1.55fr_0.8fr_1.15fr_0.72fr_1.05fr]
            xl:gap-x-[55px]

            2xl:gap-x-[80px]
          "
        >
          {/* Shared brand statement across all screen sizes. */}
          <div className="col-span-3 mb-2 max-w-[520px] lg:col-span-4 xl:col-span-1 xl:mb-0">
            <h2
              className="mt-4 max-w-[450px] font-[var(--font-sf-pro)] text-[24px] font-semibold leading-[1.12] tracking-[-0.6px] text-black sm:mt-5 sm:text-[30px] xl:mt-[22px] xl:max-w-[330px] xl:tracking-[-0.8px] 2xl:text-[34px]"
            >
              Intelligent Riding
              <br />
              <span className="inline-flex items-start">
                Apparel<sup className="static ml-0.5 mt-[0.5em] text-[0.4em] leading-none">©</sup>
              </span>
            </h2>

            <p
              className="mt-4 max-w-[450px] font-[var(--font-sf-pro)] text-[13px] font-normal leading-[1.55] text-[#68635f] sm:mt-5 sm:text-[15px] lg:text-[16px] xl:mt-6 xl:max-w-[330px] xl:leading-[1.5] 2xl:text-[18px]"
            >
              Performance motorcycle gear designed around protection,
              comfort, and confidence on every ride.
            </p>
          </div>

          {/* =================================================
              EXPLORE
          ================================================= */}

          <div>
            <h3
              className="
                font-[var(--font-sf-pro)]

                text-[14px]
                font-semibold
                leading-none

                text-black

                sm:text-[16px]
                lg:text-[19px]
                2xl:text-[20px]
              "
            >
              Explore
            </h3>

            <div
              className="
                mt-5
                flex
                flex-col
                gap-[14px]

                sm:mt-7
                sm:gap-[17px]

                lg:mt-[34px]
                lg:gap-[20px]

                2xl:mt-[40px]
                2xl:gap-[23px]
              "
            >
              {renderLinks(exploreLinks)}
            </div>
          </div>

          {/* =================================================
              SUPPORT
          ================================================= */}

          <div>
            <h3
              className="
                font-[var(--font-sf-pro)]

                text-[14px]
                font-semibold
                leading-none

                text-black

                sm:text-[16px]
                lg:text-[19px]
                2xl:text-[20px]
              "
            >
              Support
            </h3>

            <div
              className="
                mt-5
                flex
                flex-col
                gap-[14px]

                sm:mt-7
                sm:gap-[17px]

                lg:mt-[34px]
                lg:gap-[20px]

                2xl:mt-[40px]
                2xl:gap-[23px]
              "
            >
              {renderLinks(supportLinks)}
            </div>
          </div>

          {/* =================================================
              OTHERS
          ================================================= */}

          <div>
            <h3
              className="
                font-[var(--font-sf-pro)]

                text-[14px]
                font-semibold
                leading-none

                text-black

                sm:text-[16px]
                lg:text-[19px]
                2xl:text-[20px]
              "
            >
              Others
            </h3>

            <div
              className="
                mt-5
                flex
                flex-col
                gap-[14px]

                sm:mt-7
                sm:gap-[17px]

                lg:mt-[34px]
                lg:gap-[20px]

                2xl:mt-[40px]
                2xl:gap-[23px]
              "
            >
              {renderLinks(otherLinks)}
            </div>
          </div>

          {/* =================================================
              CONNECT
          ================================================= */}

          <div
            className="
              col-span-3

              mt-1
              border-t
              border-[#dedbd7]
              pt-6

              sm:mt-2
              sm:pt-7

              lg:col-span-1
              lg:mt-0
              lg:border-t-0
              lg:pt-0

              xl:col-span-1
            "
          >
            <h3
              className="
                font-[var(--font-sf-pro)]

                text-[14px]
                font-semibold
                leading-none

                text-black

                sm:text-[16px]
                lg:text-[19px]
                2xl:text-[20px]
              "
            >
              Connect
            </h3>

            <div
              className="
                mt-4

                flex
                items-center
                gap-3

                sm:mt-6
                sm:gap-[14px]

                lg:mt-[32px]

                xl:flex-nowrap

                2xl:mt-[38px]
                2xl:gap-[16px]
              "
            >
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-label={item.name}
                    className="
                      flex
                      h-[38px]
                      w-[38px]
                      shrink-0

                      items-center
                      justify-center

                      rounded-full

                      border
                      border-[#c8c4bf]

                      text-[#77716d]

                      transition-all
                      duration-300

                      hover:border-black
                      hover:bg-black
                      hover:text-white

                      sm:h-[42px]
                      sm:w-[42px]

                      lg:h-[44px]
                      lg:w-[44px]

                      2xl:h-[48px]
                      2xl:w-[48px]
                    "
                  >
                    <Icon
                      className="
                        h-[17px]
                        w-[17px]

                        sm:h-[19px]
                        sm:w-[19px]

                        lg:h-[21px]
                        lg:w-[21px]
                      "
                      strokeWidth={1.8}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Footer() {
  return (
    <Suspense fallback={null}>
      <FooterContent />
    </Suspense>
  );
}
