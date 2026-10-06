"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function SustainabilityHero() {
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
        bg-[#e9e6df]

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
          bg-[65%_center]
          bg-no-repeat

          sm:bg-center
        "
        style={{
          backgroundImage:
            'url("/assets/images/sustainabilityhero.webp")',
        }}
      />

      {/* =====================================================
          IMAGE / TEXT READABILITY OVERLAYS
      ====================================================== */}

      {/* Light gradient on left */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0

          bg-[linear-gradient(90deg,rgba(247,244,237,0.98)_0%,rgba(247,244,237,0.92)_22%,rgba(247,244,237,0.62)_39%,rgba(247,244,237,0.18)_56%,rgba(247,244,237,0)_72%)]
        "
      />

      {/* Subtle bottom cinematic fade */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-[190px]
          bg-gradient-to-t
          from-black/25
          via-black/5
          to-transparent
        "
      />

      {/* Slight top fade */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-[110px]
          bg-gradient-to-b
          from-white/10
          to-transparent
        "
      />

      {/* =====================================================
          BACK TO HOME
      ====================================================== */}
      <button
        type="button"
        onClick={() => router.push("/")}
        className="
          absolute
          left-[24px]
          top-[30px]
          z-30

          flex
          items-center
          gap-[9px]

          font-[var(--font-sf-pro)]
          text-[13px]
          font-medium
          text-black

          transition-opacity
          duration-200

          hover:opacity-55

          sm:left-[40px]
          sm:top-[40px]

          lg:left-[76px]
          lg:top-[70px]
          lg:text-[14px]
        "
      >
        <ArrowLeft size={17} strokeWidth={1.8} />
        <span>Back to Home</span>
      </button>

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
          "
        >
          <div
            className="
              max-w-[760px]
              text-black

              lg:max-w-[820px]
            "
          >
            {/* =================================================
                MAIN HEADING
            ================================================= */}
            <h1
              className="
                font-[var(--font-sf-pro)]
                text-black
              "
            >
              <span
                className="
                  block

                  text-[46px]
                  font-[800]
                  uppercase
                  leading-[0.95]
                  tracking-[1.5px]

                  sm:text-[54px]
                  md:text-[62px]
                  lg:text-[68px]
                  xl:text-[72px]
                "
              >
                Sustainability
              </span>

              <span
                className="
                  mt-[14px]
                  block

                  text-[42px]
                  font-[400]
                  leading-[1]
                  tracking-[0.3px]

                  sm:text-[50px]
                  md:text-[58px]
                  lg:text-[64px]
                  xl:text-[68px]
                "
              >
                At 8 Gear
              </span>
            </h1>

            {/* =================================================
                TAGLINE
            ================================================= */}
            <h2
              className="
                mt-[38px]

                font-[var(--font-sf-pro)]
                text-[32px]
                font-[400]
                leading-[1.06]
                tracking-[-0.5px]
                text-black

                sm:text-[38px]
                md:text-[44px]

                lg:mt-[42px]
                lg:text-[50px]

                xl:text-[54px]
              "
            >
              <strong className="font-[750]">
                Built to Ride.
              </strong>{" "}
              Built to Last.
            </h2>

            {/* =================================================
                DESCRIPTION
            ================================================= */}
            <p
              className="
                mt-[28px]
                max-w-[660px]

                font-[var(--font-sf-pro)]
                text-[17px]
                font-[400]
                leading-[1.45]
                tracking-[0.05px]
                text-black/90

                sm:text-[19px]

                md:max-w-[690px]
                md:text-[21px]

                lg:mt-[30px]
                lg:text-[22px]
              "
            >
              At 8 Gear, sustainability isn&apos;t a trend - it&apos;s a
              responsibility. We design high-performance gear that delivers
              uncompromising safety, durability, and environmental
              responsibility.
            </p>

            {/* =================================================
                CTA
            ================================================= */}
            <div className="mt-[46px] sm:mt-[52px]">
              <button
                type="button"
                onClick={() => router.push("/category")}
                className="
                  flex
                  h-[58px]
                  w-[220px]
                  items-center
                  justify-center

                  rounded-full

                  border
                  border-black/80

                  bg-black

                  px-[28px]

                  font-[var(--font-sf-pro)]
                  text-[16px]
                  font-[400]
                  text-white

                  shadow-[0_8px_25px_rgba(0,0,0,0.10)]

                  transition-all
                  duration-300

                  hover:-translate-y-[2px]
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
          RIGHT VERTICAL TEXT
      ====================================================== */}
      {/* =====================================================
    RIGHT VERTICAL TEXT
====================================================== */}
<div
  className="
    pointer-events-none
    absolute
    right-0
    top-0
    z-50
    hidden
    h-full
    w-[55px]
    items-center
    justify-center
    lg:flex
  "
>
  <p
    className="
      whitespace-nowrap
      font-[var(--font-sf-pro)]
      text-[16px]
      font-[500]
      tracking-[3.5px]
      text-white
      drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]
    "
    style={{
      writingMode: "vertical-rl",
      transform: "rotate(180deg)",
    }}
  >
    Durable · Gear · Bike · Planet
  </p>
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

          bg-[linear-gradient(90deg,rgba(247,244,237,0.96)_0%,rgba(247,244,237,0.85)_58%,rgba(247,244,237,0.2)_100%)]

          sm:hidden
        "
      />
    </section>
  );
}