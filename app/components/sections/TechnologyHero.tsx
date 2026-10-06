"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const slides = [
  {
    image: "/assets/images/techhero1.webp",
    boldTitle: "THE SCIENCE",
    lightTitle: "OF SAFETY",
    description: (
      <>
        High-performance riding essentials crafted for comfort,
        <br className="hidden sm:block" />
        safety, and limitless adventure.
      </>
    ),
  },
  {
    image: "/assets/images/techhero3.webp",
    boldTitle: "ENGINEERED",
    lightTitle: "FOR PROTECTION",
    description: (
      <>
        Advanced materials and rider-focused engineering built
        <br className="hidden sm:block" />
        to deliver confidence on every journey.
      </>
    ),
  },
  {
    image: "/assets/images/techhero2.webp",
    boldTitle: "BUILT TO",
    lightTitle: "PERFORM",
    description: (
      <>
        Technology-driven riding apparel designed around
        <br className="hidden sm:block" />
        protection, mobility, and everyday performance.
      </>
    ),
  },
];

const AUTO_SLIDE_DELAY = 5500;
const CONTENT_FADE_DURATION = 450;

export default function TechnologyHero() {
  const router = useRouter();

  const [activeSlide, setActiveSlide] = useState(0);
  const [contentVisible, setContentVisible] = useState(true);

  const isChangingRef = useRef(false);

  const transitionTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoSlideTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  /* =========================================================
     CHANGE SLIDE
  ========================================================= */
  const changeSlide = useCallback(
    (nextIndex: number) => {
      if (
        nextIndex === activeSlide ||
        isChangingRef.current
      ) {
        return;
      }

      /*
       * Prevent another transition from starting
       * while this one is running.
       */
      isChangingRef.current = true;

      /*
       * Clear existing automatic timer.
       * This also means clicking pagination resets
       * the auto-slide countdown.
       */
      if (autoSlideTimeoutRef.current) {
        clearTimeout(autoSlideTimeoutRef.current);
        autoSlideTimeoutRef.current = null;
      }

      /*
       * Clear any existing content transition.
       */
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }

      /*
       * Fade text out first.
       */
      setContentVisible(false);

      transitionTimeoutRef.current = setTimeout(() => {
        /*
         * Change background + slide data
         * after content has faded.
         */
        setActiveSlide(nextIndex);

        /*
         * Allow React/browser to paint the new content
         * before fading it back in.
         */
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setContentVisible(true);
            isChangingRef.current = false;
          });
        });
      }, CONTENT_FADE_DURATION);
    },
    [activeSlide],
  );

  /* =========================================================
     AUTO SLIDER
  ========================================================= */
  useEffect(() => {
    if (autoSlideTimeoutRef.current) {
      clearTimeout(autoSlideTimeoutRef.current);
    }

    autoSlideTimeoutRef.current = setTimeout(() => {
      const nextIndex =
        (activeSlide + 1) % slides.length;

      changeSlide(nextIndex);
    }, AUTO_SLIDE_DELAY);

    return () => {
      if (autoSlideTimeoutRef.current) {
        clearTimeout(autoSlideTimeoutRef.current);
        autoSlideTimeoutRef.current = null;
      }
    };
  }, [activeSlide, changeSlide]);

  /* =========================================================
     CLEANUP
  ========================================================= */
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      if (autoSlideTimeoutRef.current) {
        clearTimeout(autoSlideTimeoutRef.current);
      }
    };
  }, []);

  const currentSlide = slides[activeSlide];

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
          BACKGROUND SLIDES
      ====================================================== */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => {
          const isActive = activeSlide === index;

          return (
            <div
              key={slide.image}
              className={`
                absolute
                inset-0
                bg-cover
                bg-center
                bg-no-repeat
                transition-all
                duration-[1200ms]
                ease-in-out

                ${
                  isActive
                    ? "scale-100 opacity-100"
                    : "pointer-events-none scale-[1.015] opacity-0"
                }
              `}
              style={{
                backgroundImage: `url("${slide.image}")`,
              }}
            />
          );
        })}
      </div>

      {/* =====================================================
          CINEMATIC OVERLAYS
      ====================================================== */}

      {/* General dark layer */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-black/20
        "
      />

      {/* Left gradient for readable content */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[linear-gradient(90deg,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.58)_25%,rgba(0,0,0,0.25)_50%,rgba(0,0,0,0.04)_76%,rgba(0,0,0,0)_100%)]
        "
      />

      {/* Bottom cinematic fade */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-[260px]
          bg-gradient-to-t
          from-black/55
          via-black/20
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
          h-[160px]
          bg-gradient-to-b
          from-black/30
          via-black/10
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
          top-[32px]
          z-30
          flex
          items-center
          gap-[9px]
          font-[var(--font-sf-pro)]
          text-[13px]
          font-medium
          text-white
          transition-opacity
          duration-200

          hover:opacity-65

          sm:left-[40px]
          sm:top-[42px]

          lg:left-[76px]
          lg:top-[70px]
          lg:text-[14px]
        "
      >
        <ArrowLeft
          size={17}
          strokeWidth={1.7}
        />

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
            lg:px-[66px]
            xl:px-[72px]
          "
        >
          <div
            className={`
              max-w-[950px]
              text-white
              transition-all
              duration-[450ms]
              ease-out

              ${
                contentVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-[14px] opacity-0"
              }
            `}
          >
            {/* =================================================
                TITLE
            ================================================= */}
            <h1
              className="
                font-[var(--font-sf-pro)]
                uppercase
                text-white
              "
            >
              <span
                className="
                  block
                  text-[43px]
                  font-bold
                  leading-[1]
                  tracking-[2px]

                  sm:text-[52px]
                  md:text-[60px]
                  lg:text-[66px]
                  xl:text-[70px]
                "
              >
                {currentSlide.boldTitle}
              </span>

              <span
                className="
                  mt-[14px]
                  block
                  text-[42px]
                  font-light
                  leading-[1]
                  tracking-[2px]

                  sm:text-[51px]
                  md:text-[59px]
                  lg:text-[65px]
                  xl:text-[69px]
                "
              >
                {currentSlide.lightTitle}
              </span>
            </h1>

            {/* =================================================
                DESCRIPTION
            ================================================= */}
            <p
              className="
                mt-[30px]
                max-w-[950px]
                font-[var(--font-sf-pro)]
                text-[18px]
                font-normal
                leading-[1.35]
                tracking-[0.15px]
                text-white/95

                sm:text-[21px]

                md:text-[24px]

                lg:mt-[34px]
                lg:text-[27px]

                xl:text-[30px]
              "
            >
              {currentSlide.description}
            </p>

            {/* =================================================
                BUTTONS
            ================================================= */}
            <div
              className="
                mt-[46px]
                flex
                w-full
                flex-col
                gap-[15px]

                sm:mt-[58px]
                sm:flex-row
                sm:items-center
                sm:gap-[38px]

                lg:mt-[68px]
              "
            >
              {/* Explore Collection */}
              <button
                type="button"
                onClick={() =>
                  router.push("/category")
                }
                className="
                  flex
                  h-[58px]
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/40
                  bg-black/10
                  px-[28px]
                  font-[var(--font-sf-pro)]
                  text-[16px]
                  font-medium
                  text-white
                  backdrop-blur-[4px]
                  transition-all
                  duration-300

                  hover:border-white
                  hover:bg-white
                  hover:text-black

                  sm:h-[66px]
                  sm:w-[245px]
                  sm:text-[17px]
                "
              >
                Explore Collection
              </button>

              {/* About */}
              <button
                type="button"
                onClick={() =>
                  router.push("/about")
                }
                className="
                  flex
                  h-[58px]
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-white/30
                  px-[28px]
                  font-[var(--font-sf-pro)]
                  text-[16px]
                  font-medium
                  text-white
                  backdrop-blur-[12px]
                  transition-all
                  duration-300

                  hover:border-white
                  hover:bg-white
                  hover:text-black

                  sm:h-[66px]
                  sm:w-[245px]
                  sm:text-[17px]
                "
              >
                About
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          PAGINATION
      ====================================================== */}
      <div
        className="
          absolute
          bottom-[20px]
          left-1/2
          z-30
          flex
          -translate-x-1/2
          items-center
          justify-center
          gap-[7px]

          md:bottom-[26px]
        "
      >
        {slides.map((_, index) => {
          const isActive =
            activeSlide === index;

          return (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={
                isActive
                  ? "true"
                  : undefined
              }
              onClick={() =>
                changeSlide(index)
              }
              className={`
                rounded-full
                border-0
                p-0
                outline-none
                transition-all
                duration-500
                ease-out

                ${
                  isActive
                    ? `
                      h-[9px]
                      w-[34px]
                      bg-white

                      md:h-[10px]
                      md:w-[40px]
                    `
                    : `
                      h-[9px]
                      w-[9px]
                      bg-white/35

                      hover:bg-white/70

                      md:h-[10px]
                      md:w-[10px]
                    `
                }
              `}
            />
          );
        })}
      </div>
    </section>
  );
}