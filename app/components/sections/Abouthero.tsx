"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function AboutUsHero() {
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
          bg-[62%_center]
          bg-no-repeat

          sm:bg-[58%_center]
          md:bg-center
        "
        style={{
          backgroundImage: 'url("/assets/images/aboutushero.webp")',
        }}
      />

      {/* =====================================================
          IMAGE / TEXT READABILITY OVERLAYS
      ====================================================== */}

      {/* Main dark fade from left */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0

          bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.65)_18%,rgba(0,0,0,0.30)_36%,rgba(0,0,0,0.08)_53%,rgba(0,0,0,0)_68%)]
        "
      />

      {/* Subtle bottom cinematic fade */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-[180px]

          bg-gradient-to-t
          from-black/25
          via-black/5
          to-transparent
        "
      />

      {/* Slight top cinematic fade */}
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
              max-w-[580px]
              text-white

              lg:max-w-[620px]
            "
          >
            {/* =================================================
                MAIN HEADING
            ================================================= */}
            <h1
              className="
                font-[var(--font-sf-pro)]

                text-[45px]
                font-[750]
                leading-[1.08]
                tracking-[-1.2px]
                text-white

                sm:text-[50px]
                md:text-[55px]
                lg:text-[60px]
                xl:text-[64px]
              "
            >
              <span className="block">
                Beyond Gear.
              </span>

              <span
                className="
                  mt-[16px]
                  block

                  sm:mt-[18px]
                  lg:mt-[20px]
                "
              >
                A Way of Life.
              </span>
            </h1>

            {/* =================================================
                DESCRIPTION
            ================================================= */}
            <p
              className="
                mt-[27px]

                font-[var(--font-sf-pro)]
                text-[17px]
                font-[400]
                leading-[1.45]
                tracking-[0.1px]
                text-white/80

                sm:text-[18px]
                md:text-[19px]
                lg:text-[20px]
              "
            >
              We equip your journey. You live the ride.
            </p>

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

          bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.50)_60%,rgba(0,0,0,0.08)_100%)]

          sm:hidden
        "
      />
    </section>
  );
}