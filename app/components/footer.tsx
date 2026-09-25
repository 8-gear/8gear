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
  { name: "Collection", href: "/category?cat=all" },
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
            MOBILE / TABLET BRAND STATEMENT
        ====================================================== */}

        <div
          className="
            mb-10
            max-w-[520px]

            lg:mb-12
            xl:hidden
          "
        >
          {/* <p
            className="
              font-[var(--font-sf-pro)]

              text-[12px]
              font-semibold
              uppercase
              leading-none
              tracking-[1.8px]

              text-black

              sm:text-[13px]
            "
          >
            8-Gear
          </p> */}

          <h2
            className="
              mt-4

              max-w-[450px]

              font-[var(--font-sf-pro)]

              text-[24px]
              font-[600]
              leading-[1.12]
              tracking-[-0.6px]

              text-black

              sm:mt-5
              sm:text-[30px]
            "
          >
            Built for the ride.
            <br />
            Made to go further.
          </h2>

          <p
            className="
              mt-4
              max-w-[450px]

              font-[var(--font-sf-pro)]

              text-[13px]
              font-normal
              leading-[1.55]

              text-[#68635f]

              sm:mt-5
              sm:text-[15px]

              lg:text-[16px]
            "
          >
            Performance motorcycle gear designed around protection,
            comfort, and confidence on every ride.
          </p>
        </div>

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
          {/* =================================================
              DESKTOP BRAND STATEMENT
          ================================================= */}

          <div className="hidden xl:block">
            {/* <p
              className="
                font-[var(--font-sf-pro)]

                text-[13px]
                font-semibold
                uppercase
                leading-none
                tracking-[2px]

                text-black

                2xl:text-[14px]
              "
            >
              8-Gear
            </p> */}

            <h2
              className="
                mt-[22px]

                max-w-[330px]

                font-[var(--font-sf-pro)]

                text-[30px]
                font-[600]
                leading-[1.12]
                tracking-[-0.8px]

                text-black

                2xl:text-[34px]
              "
            >
              Built for the ride.
              <br />
              Made to go further.
            </h2>

            <p
              className="
                mt-[24px]
                max-w-[330px]

                font-[var(--font-sf-pro)]

                text-[16px]
                font-normal
                leading-[1.5]
                tracking-[0px]

                text-[#68635f]

                2xl:text-[18px]
              "
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


// "use client";

// import Link from "next/link";
// import { Suspense, useState } from "react";
// import { usePathname, useSearchParams } from "next/navigation";
// import {
//   Facebook,
//   Instagram,
//   Linkedin,
//   Youtube,
//   Plus,
//   Minus,
// } from "lucide-react";

// /* ============================================================
//    LINKS
// ============================================================ */

// const exploreLinks = [
//   { name: "Collection", href: "/category?cat=all" },
//   { name: "Technology", href: "/technology" },
//   { name: "Sustainability", href: "/sustainability" },
// ];

// const supportLinks = [
//   { name: "Terms & Conditions", href: "/tncs" },
//   { name: "Privacy Policy", href: "/privacy-policy" },
//   { name: "About 8Gear", href: "/about" },
//   { name: "Contact", href: "/contact" },
//   { name: "Return Policy", href: "/return-policy" },
//   { name: "Shopping Policy", href: "/shopping-policy" },
//   { name: "Warranty", href: "/warranty" },
// ];

// const otherLinks = [
//   { name: "Dealers", href: "/dealers" },
//   { name: "Journal", href: "/blog" },
//   { name: "Catalog", href: "/category?cat=all" },
// ];

// const socialLinks = [
//   {
//     name: "Facebook",
//     href: "#",
//     icon: Facebook,
//   },
//   {
//     name: "Instagram",
//     href: "#",
//     icon: Instagram,
//   },
//   {
//     name: "LinkedIn",
//     href: "#",
//     icon: Linkedin,
//   },
//   {
//     name: "YouTube",
//     href: "#",
//     icon: Youtube,
//   },
// ];

// /* ============================================================
//    TYPES
// ============================================================ */

// type FooterLink = {
//   name: string;
//   href: string;
// };

// type MobileSectionProps = {
//   title: string;
//   links: FooterLink[];
//   isOpen: boolean;
//   onToggle: () => void;
//   isActive: (href: string) => boolean;
// };

// /* ============================================================
//    MOBILE ACCORDION SECTION
// ============================================================ */

// function MobileFooterSection({
//   title,
//   links,
//   isOpen,
//   onToggle,
//   isActive,
// }: MobileSectionProps) {
//   return (
//     <div className="border-b border-black/[0.11]">
//       <button
//         type="button"
//         onClick={onToggle}
//         className="
//           flex
//           w-full
//           items-center
//           justify-between
//           py-[18px]
//           text-left
//         "
//       >
//         <span
//           className="
//             font-[var(--font-sf-pro)]
//             text-[15px]
//             font-semibold
//             tracking-[-0.15px]
//             text-black
//           "
//         >
//           {title}
//         </span>

//         <span
//           className="
//             flex
//             h-[26px]
//             w-[26px]
//             items-center
//             justify-center
//             rounded-full
//             border
//             border-black/[0.10]
//             text-black
//           "
//         >
//           {isOpen ? (
//             <Minus
//               size={13}
//               strokeWidth={1.8}
//             />
//           ) : (
//             <Plus
//               size={13}
//               strokeWidth={1.8}
//             />
//           )}
//         </span>
//       </button>

//       <div
//         className={`
//           grid
//           overflow-hidden
//           transition-all
//           duration-300

//           ${
//             isOpen
//               ? "grid-rows-[1fr] opacity-100"
//               : "grid-rows-[0fr] opacity-0"
//           }
//         `}
//       >
//         <div className="min-h-0">
//           <div
//             className="
//               grid
//               grid-cols-2
//               gap-x-[24px]
//               gap-y-[13px]
//               pb-[20px]
//             "
//           >
//             {links.map((item) => {
//               const active = isActive(item.href);

//               return (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   className={`
//                     w-fit
//                     font-[var(--font-sf-pro)]
//                     text-[13px]
//                     leading-[1.35]
//                     transition-colors
//                     duration-200

//                     ${
//                       active
//                         ? "font-medium text-black"
//                         : "font-normal text-[#77726e]"
//                     }
//                   `}
//                 >
//                   {item.name}
//                 </Link>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ============================================================
//    FOOTER CONTENT
// ============================================================ */

// function FooterContent() {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const [openSection, setOpenSection] =
//     useState<string | null>("Explore");

//   /* ============================================================
//      ACTIVE LINK
//   ============================================================ */

//   const isActive = (href: string) => {
//     const [hrefPath, queryString] = href.split("?");

//     if (pathname !== hrefPath) {
//       return false;
//     }

//     if (!queryString) {
//       return true;
//     }

//     const linkParams = new URLSearchParams(queryString);

//     for (const [key, value] of linkParams.entries()) {
//       if (searchParams.get(key) !== value) {
//         return false;
//       }
//     }

//     return true;
//   };

//   const footerLinkClass = (href: string) => {
//     const active = isActive(href);

//     return `
//       relative
//       w-fit

//       font-[var(--font-sf-pro)]

//       text-[16px]
//       font-normal
//       leading-[1.2]

//       transition-colors
//       duration-200

//       2xl:text-[19px]

//       ${
//         active
//           ? "font-medium text-black"
//           : "text-[#68635f] hover:text-black"
//       }
//     `;
//   };

//   const renderDesktopLinks = (
//     links: FooterLink[]
//   ) => {
//     return links.map((item) => {
//       const active = isActive(item.href);

//       return (
//         <Link
//           key={item.name}
//           href={item.href}
//           className={footerLinkClass(item.href)}
//         >
//           {item.name}

//           <span
//             className={`
//               absolute
//               -bottom-[6px]
//               left-0

//               h-[2px]
//               rounded-full
//               bg-black

//               transition-all
//               duration-300

//               ${
//                 active
//                   ? "w-full opacity-100"
//                   : "w-0 opacity-0"
//               }
//             `}
//           />
//         </Link>
//       );
//     });
//   };

//   return (
//     <footer className="w-full bg-[#f4f2ef]">
//       {/* =====================================================
//           MOBILE FOOTER
//       ====================================================== */}

//       <div
//         className="
//           mx-auto
//           w-full

//           px-[20px]
//           pb-[30px]
//           pt-[34px]

//           sm:hidden
//         "
//       >
//         {/* BRAND */}

//         <div>
//           <Link
//             href="/"
//             aria-label="8Gear Home"
//             className="inline-flex"
//           >
//             <img
//               src="/logo.webp"
//               alt="8Gear"
//               draggable={false}
//               className="
//                 block
//                 h-auto
//                 w-[108px]
//                 object-contain
//               "
//             />
//           </Link>

//           <p
//             className="
//               mt-[17px]
//               max-w-[330px]

//               font-[var(--font-sf-pro)]

//               text-[12.5px]
//               font-normal
//               leading-[1.55]

//               text-[#6f6a66]
//             "
//           >
//             Elevate Every Ride with Premium Performance Gear
//             Designed for Protection, Comfort, and Unmatched
//             Confidence.
//           </p>
//         </div>

//         {/* ACCORDIONS */}

//         <div className="mt-[28px] border-t border-black/[0.11]">
//           <MobileFooterSection
//             title="Explore"
//             links={exploreLinks}
//             isOpen={openSection === "Explore"}
//             onToggle={() =>
//               setOpenSection((current) =>
//                 current === "Explore"
//                   ? null
//                   : "Explore"
//               )
//             }
//             isActive={isActive}
//           />

//           <MobileFooterSection
//             title="Support"
//             links={supportLinks}
//             isOpen={openSection === "Support"}
//             onToggle={() =>
//               setOpenSection((current) =>
//                 current === "Support"
//                   ? null
//                   : "Support"
//               )
//             }
//             isActive={isActive}
//           />

//           <MobileFooterSection
//             title="Others"
//             links={otherLinks}
//             isOpen={openSection === "Others"}
//             onToggle={() =>
//               setOpenSection((current) =>
//                 current === "Others"
//                   ? null
//                   : "Others"
//               )
//             }
//             isActive={isActive}
//           />
//         </div>

//         {/* SOCIAL */}

//         <div className="pt-[26px]">
//           <p
//             className="
//               font-[var(--font-sf-pro)]
//               text-[13px]
//               font-semibold
//               text-black
//             "
//           >
//             Follow 8Gear
//           </p>

//           <div className="mt-[15px] flex items-center gap-[9px]">
//             {socialLinks.map((item) => {
//               const Icon = item.icon;

//               return (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   aria-label={item.name}
//                   className="
//                     flex
//                     h-[36px]
//                     w-[36px]

//                     items-center
//                     justify-center

//                     rounded-full

//                     border
//                     border-[#cbc7c2]

//                     text-[#6e6965]

//                     transition-all
//                     duration-300

//                     active:scale-95

//                     hover:border-black
//                     hover:bg-black
//                     hover:text-white
//                   "
//                 >
//                   <Icon
//                     size={16}
//                     strokeWidth={1.8}
//                   />
//                 </Link>
//               );
//             })}
//           </div>
//         </div>

//         {/* BOTTOM */}

//         <div
//           className="
//             mt-[28px]

//             border-t
//             border-black/[0.10]

//             pt-[17px]
//           "
//         >
//           <p
//             className="
//               font-[var(--font-sf-pro)]

//               text-[10px]
//               font-normal
//               tracking-[0.02em]

//               text-[#8b8783]
//             "
//           >
//             © {new Date().getFullYear()} 8Gear. All rights reserved.
//           </p>
//         </div>
//       </div>

//       {/* =====================================================
//           TABLET / DESKTOP FOOTER
//       ====================================================== */}

//       <div
//         className="
//           mx-auto
//           hidden
//           w-full
//           max-w-[1920px]

//           px-[40px]
//           py-[70px]

//           sm:block

//           lg:px-[60px]

//           xl:px-[100px]

//           2xl:px-[135px]
//           2xl:py-[82px]
//         "
//       >
//         <div
//           className="
//             grid

//             sm:grid-cols-3
//             sm:gap-x-[40px]
//             sm:gap-y-[50px]

//             lg:grid-cols-[1.45fr_0.8fr_1.15fr_0.7fr]
//             lg:gap-x-[45px]

//             xl:grid-cols-[1.55fr_0.8fr_1.15fr_0.72fr_1.05fr]
//             xl:gap-x-[55px]

//             2xl:gap-x-[80px]
//           "
//         >
//           {/* BRAND */}

//           <div
//             className="
//               sm:col-span-3

//               lg:col-span-4

//               xl:col-span-1
//             "
//           >
//             <Link
//               href="/"
//               aria-label="8Gear Home"
//               className="inline-flex"
//             >
//               <img
//                 src="/logo.webp"
//                 alt="8Gear"
//                 draggable={false}
//                 className="
//                   block
//                   h-auto
//                   w-[145px]
//                   object-contain

//                   lg:w-[150px]
//                 "
//               />
//             </Link>

//             <p
//               className="
//                 mt-[34px]
//                 max-w-[340px]

//                 font-[var(--font-sf-pro)]

//                 text-[17px]
//                 font-normal
//                 leading-[1.45]

//                 text-[#66615d]

//                 lg:text-[18px]

//                 2xl:text-[20px]
//               "
//             >
//               Elevate Every Ride with Premium Performance Gear
//               Designed for Protection, Comfort, and Unmatched
//               Confidence.
//             </p>
//           </div>

//           {/* EXPLORE */}

//           <div>
//             <h3 className="font-[var(--font-sf-pro)] text-[18px] font-semibold text-black lg:text-[19px] 2xl:text-[20px]">
//               Explore
//             </h3>

//             <div className="mt-[30px] flex flex-col gap-[19px] 2xl:mt-[40px] 2xl:gap-[23px]">
//               {renderDesktopLinks(exploreLinks)}
//             </div>
//           </div>

//           {/* SUPPORT */}

//           <div>
//             <h3 className="font-[var(--font-sf-pro)] text-[18px] font-semibold text-black lg:text-[19px] 2xl:text-[20px]">
//               Support
//             </h3>

//             <div className="mt-[30px] flex flex-col gap-[19px] 2xl:mt-[40px] 2xl:gap-[23px]">
//               {renderDesktopLinks(supportLinks)}
//             </div>
//           </div>

//           {/* OTHERS */}

//           <div>
//             <h3 className="font-[var(--font-sf-pro)] text-[18px] font-semibold text-black lg:text-[19px] 2xl:text-[20px]">
//               Others
//             </h3>

//             <div className="mt-[30px] flex flex-col gap-[19px] 2xl:mt-[40px] 2xl:gap-[23px]">
//               {renderDesktopLinks(otherLinks)}
//             </div>
//           </div>

//           {/* CONNECT */}

//           <div>
//             <h3 className="font-[var(--font-sf-pro)] text-[18px] font-semibold text-black lg:text-[19px] 2xl:text-[20px]">
//               Connect
//             </h3>

//             <div
//               className="
//                 mt-[28px]
//                 flex
//                 flex-wrap
//                 items-center
//                 gap-[12px]

//                 2xl:mt-[38px]
//                 2xl:gap-[16px]
//               "
//             >
//               {socialLinks.map((item) => {
//                 const Icon = item.icon;

//                 return (
//                   <Link
//                     key={item.name}
//                     href={item.href}
//                     aria-label={item.name}
//                     className="
//                       flex
//                       h-[44px]
//                       w-[44px]
//                       shrink-0

//                       items-center
//                       justify-center

//                       rounded-full

//                       border
//                       border-[#c8c4bf]

//                       text-[#77716d]

//                       transition-all
//                       duration-300

//                       hover:border-black
//                       hover:bg-black
//                       hover:text-white

//                       2xl:h-[48px]
//                       2xl:w-[48px]
//                     "
//                   >
//                     <Icon
//                       size={20}
//                       strokeWidth={1.8}
//                     />
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

// /* ============================================================
//    EXPORT
// ============================================================ */

// export default function Footer() {
//   return (
//     <Suspense fallback={null}>
//       <FooterContent />
//     </Suspense>
//   );
// }
