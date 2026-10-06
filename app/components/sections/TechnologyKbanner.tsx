"use client";

import { useRouter } from "next/navigation";

export default function TechnologyKevlarSection() {
  const router = useRouter();

  return (
    <section
      className="
        relative
        flex
        min-h-[560px]
        w-full
        items-center
        justify-center
        overflow-hidden
        bg-black

        sm:min-h-[620px]
        md:min-h-[680px]
        lg:min-h-[720px]
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
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage: "url('/assets/images/tkbbg.webp')",
        }}
      />

      {/* =====================================================
          CINEMATIC OVERLAYS
      ====================================================== */}

      {/* Overall darkness */}
      {/* <div className="pointer-events-none absolute inset-0 bg-black/35" /> */}

      {/* Side shading */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[linear-gradient(90deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.12)_30%,rgba(0,0,0,0.10)_70%,rgba(0,0,0,0.42)_100%)]
        "
      />

      {/* Top fade */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-[180px]
          bg-gradient-to-b
          from-black/30
          to-transparent
        "
      />

      {/* Bottom fade */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-[220px]
          bg-gradient-to-t
          from-black/40
          to-transparent
        "
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div
        className="
          relative
          z-10
          mx-auto
          flex
          w-full
          max-w-[1500px]
          flex-col
          items-center
          justify-center
          px-[24px]
          text-center

          sm:px-[40px]
          lg:px-[70px]
        "
      >
        {/* Title */}
        <h2
          className="
            font-[var(--font-sf-pro)]
            text-[44px]
            font-medium
            leading-none
            tracking-[1px]
            text-white

            sm:text-[54px]

            md:text-[62px]

            lg:text-[68px]
          "
        >
          Kevlar®
        </h2>

        {/* Description */}
        <p
          className="
            mx-auto
            mt-[30px]
            max-w-[1150px]
            font-[var(--font-sf-pro)]
            text-[16px]
            font-normal
            leading-[1.55]
            tracking-[0.2px]
            text-white/90

            sm:text-[18px]

            md:text-[20px]

            lg:text-[21px]
          "
        >
          DuPont™ Kevlar® is a lightweight, heat-resistant aramid fiber known
          for exceptional durability and abrasion protection. Five times
          stronger than steel by weight, it is widely used in body armor and
          protective motorcycle clothing.
        </p>

        {/* =====================================================
            HOME HERO STYLE BUTTON
        ====================================================== */}
        <button
          type="button"
          onClick={() => router.push("/category")}
          className="
            mt-[42px]
            flex
            h-[60px]
            w-[230px]
            items-center
            justify-center
            rounded-full
            border
            border-white/45
            bg-black/20
            px-[30px]
            font-[var(--font-sf-pro)]
            text-[17px]
            font-semibold
            text-white
            backdrop-blur-[5px]
            transition-all
            duration-300

            hover:border-white
            hover:bg-white
            hover:text-black

            sm:mt-[48px]
            sm:h-[68px]
            sm:w-[255px]
            sm:text-[18px]
          "
        >
          Explore Collection
        </button>
      </div>
    </section>
  );
}