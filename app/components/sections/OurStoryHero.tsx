"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function OurStoryHero() {
  const router = useRouter();

  return (
    <section
      className="
        relative
        z-0
        h-[calc(100svh-130px)]
        min-h-[650px]
        w-full
        overflow-hidden
        bg-black

        sm:h-[calc(100svh-155px)]
        md:min-h-[680px]
        lg:min-h-[730px]
      "
    >
      {/* =====================================================
          BACKGROUND IMAGE
      ====================================================== */}
      <div
        className="
          absolute
          inset-0

          bg-cover
          bg-[52%_center]
          bg-no-repeat

          sm:bg-[51%_center]
          md:bg-center
        "
        style={{
          backgroundImage: 'url("/assets/images/ourstoryhero.webp")',
        }}
      />

      {/* =====================================================
          IMAGE / TEXT READABILITY OVERLAYS
      ====================================================== */}

      {/* Main overall darkening */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0

          bg-black/20
        "
      />

      {/* Subtle center readability */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0

          bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.08)_45%,rgba(0,0,0,0.20)_100%)]
        "
      />

      {/* Bottom cinematic fade */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-[200px]

          bg-gradient-to-t
          from-black/30
          via-black/5
          to-transparent
        "
      />

      {/* Top cinematic fade */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-[110px]

          bg-gradient-to-b
          from-black/15
          to-transparent
        "
      />

      {/* =====================================================
          HERO CONTENT
      ====================================================== */}
      <div
        className="
          relative
          z-10

          mx-auto
          flex
          h-full
          w-full
          max-w-[1920px]
          items-center
          justify-center
        "
      >
        <div
          className="
            w-full

            px-[24px]

            sm:px-[40px]
            md:px-[52px]
            lg:px-[76px]
            xl:px-[108px]
          "
        >
          <div
            className="
              mx-auto
              flex
              max-w-[1100px]
              flex-col
              items-center

              text-center
              text-white
            "
          >
            {/* =================================================
                MAIN HEADING
            ================================================= */}
            <h1
              className="
                font-[var(--font-sf-pro)]

                text-[40px]
                font-[700]
                leading-[1.06]
                tracking-[-1.3px]
                text-white

                sm:text-[48px]
                sm:tracking-[-1.5px]

                md:text-[55px]

                lg:text-[60px]
                lg:tracking-[-1.8px]

                xl:text-[64px]
              "
            >
              Every Great Ride Begins with a Purpose.
            </h1>

            {/* =================================================
                CTA
            ================================================= */}
            <div
              className="
                mt-[48px]

                sm:mt-[52px]
                lg:mt-[55px]
              "
            >
              <button
                type="button"
                onClick={() => router.push("/category")}
                className="
                  flex
                  h-[62px]
                  w-[238px]
                  items-center
                  justify-center

                  rounded-full

                  border
                  border-white/60

                  bg-black/45
                  backdrop-blur-[2px]

                  px-[28px]

                  font-[var(--font-sf-pro)]
                  text-[16px]
                  font-[400]
                  text-white

                  shadow-[0_8px_25px_rgba(0,0,0,0.18)]

                  transition-all
                  duration-300

                  hover:-translate-y-[2px]
                  hover:border-white
                  hover:bg-white
                  hover:text-black

                  sm:h-[64px]
                  sm:w-[245px]
                  sm:text-[17px]
                "
              >
                Explore Collection
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE DARK READABILITY FALLBACK
      ====================================================== */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]

          bg-black/20

          sm:hidden
        "
      />
    </section>
  );
}