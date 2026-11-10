"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ContactHero() {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      <div className="relative min-h-[620px] w-full sm:min-h-[680px] lg:h-[740px]">
        {/* Background decorative lines */}
        <div
          className="pointer-events-none absolute inset-0 bg-contain bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage:
              "url('/assets/images/track-order-bg-lines.webp')",
          }}
        />

  

        {/* Back To Home */}
        <Link
          href="/"
          className="
            absolute
            left-[24px]
            top-[42px]
            z-20
            flex
            items-center
            gap-[10px]
            font-[var(--font-sf-pro)]
            text-[14px]
            font-medium
            text-black
            transition-opacity
            duration-200
            hover:opacity-60

            sm:left-[40px]
            sm:top-[60px]

            lg:left-[66px]
            lg:top-[68px]
            lg:text-[15px]
          "
        >
          <ArrowLeft size={18} strokeWidth={1.7} />
          <span>Back to Home</span>
        </Link>

        {/* Heading */}
        <div
          className="
            relative
            z-10
            flex
            h-full
            min-h-[620px]
            w-full
            items-center
            justify-center
            px-[24px]

            sm:min-h-[680px]
            sm:px-[40px]

            lg:min-h-0
            lg:px-[70px]
          "
        >
          <div
            className="
              relative
              mt-[15px]
              w-full
              max-w-[1500px]
              text-center

              sm:mt-[30px]
              lg:mt-[40px]
            "
          >
            <h1
              className="
                font-[var(--font-sf-pro)]
                text-[40px]
                font-normal
                leading-[1.12]
                tracking-[-1.4px]
                text-black

                sm:text-[52px]
                sm:tracking-[-2px]

                md:text-[60px]

                lg:text-[66px]
                lg:leading-[1.2]
                lg:tracking-[-2.4px]

                xl:text-[68px]

                2xl:text-[72px]
              "
            >
              <span className="font-normal">Get in </span>

              <span className="font-bold">Touch</span>

              <span className="font-normal"> with </span>

              <span className="font-bold">8 Gear:</span>

              <span className="font-normal"> Your Source for</span>

              <br className="hidden md:block" />

              <span className="font-bold">
                {" "}
                High-Performance Outdoor Motorcycle Apparel
              </span>
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}