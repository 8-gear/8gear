"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const slides = [
  {
    image: "/assets/images/h1m.webp",
    title: (
      <>
        Intelligent Riding
        <br />
        Apparel
      </>
    ),
    description: (
      <>
        High-performance riding essentials crafted for comfort,
        <br className="hidden sm:block" />
        safety, and limitless adventure.
      </>
    ),
  },
  {
    image: "/assets/images/h2m.webp",
    title: (
      <>
        Ride Beyond
        <br />
        Limits
      </>
    ),
    description: (
      <>
        Premium riding gear engineered for protection,
        <br className="hidden sm:block" />
        performance, and everyday adventure.
      </>
    ),
  },
  {
    image: "/assets/images/h3m.webp",
    title: (
      <>
        Built For Every
        <br />
        Journey
      </>
    ),
    description: (
      <>
        Purpose-built apparel for riders who demand comfort,
        <br className="hidden sm:block" />
        confidence, and complete protection.
      </>
    ),
  },
];

const Hero = () => {
  const router = useRouter();

  const [activeSlide, setActiveSlide] = useState(0);
  const [contentVisible, setContentVisible] = useState(true);
  const [isChanging, setIsChanging] = useState(false);

  const transitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const changeSlide = (nextIndex: number) => {
    if (nextIndex === activeSlide || isChanging) return;

    setIsChanging(true);

    // Fade current text/buttons OUT first
    setContentVisible(false);

    if (transitionTimeout.current) {
      clearTimeout(transitionTimeout.current);
    }

    transitionTimeout.current = setTimeout(() => {
      // Replace image + text
      setActiveSlide(nextIndex);

      // Let DOM update, then fade new content IN
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setContentVisible(true);
          setIsChanging(false);
        });
      });
    }, 450);
  };

  // Auto change
  useEffect(() => {
    const timer = setTimeout(() => {
      const nextIndex = (activeSlide + 1) % slides.length;
      changeSlide(nextIndex);
    }, 5500);

    return () => clearTimeout(timer);
  }, [activeSlide]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (transitionTimeout.current) {
        clearTimeout(transitionTimeout.current);
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
        w-full
        overflow-hidden
        bg-black
        sm:h-[calc(100svh-155px)]
        md:min-h-[680px]
      "
    >
      {/* =====================================================
          BACKGROUND IMAGES
          NO SLIDING — ONLY OPACITY / CROSS FADE
      ====================================================== */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`
              absolute
              inset-0
              transition-opacity
              duration-[1000ms]
              ease-in-out
              ${
                activeSlide === index
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }
            `}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-top"
            />
          </div>
        ))}
      </div>

      {/* =====================================================
          CINEMATIC OVERLAYS
      ====================================================== */}

      {/* Overall dark overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/15" />

      {/* Left dark gradient */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[linear-gradient(90deg,rgba(8,7,6,0.78)_0%,rgba(12,10,8,0.56)_28%,rgba(15,12,10,0.22)_52%,rgba(0,0,0,0)_76%)]
        "
      />

      {/* Bottom cinematic gradient */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-[230px]
          bg-gradient-to-t
          from-black/55
          via-black/15
          to-transparent
        "
      />

      {/* Slight top gradient */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-[130px]
          bg-gradient-to-b
          from-black/20
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
            lg:px-[70px]
            xl:px-[72px]
          "
        >
          <div
            className={`
              max-w-[920px]
              text-white
              transition-all
              duration-[450ms]
              ease-out
              ${
                contentVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-[10px] opacity-0"
              }
            `}
          >
            {/* Heading */}
            <h1
              className="
                font-[var(--font-sf-pro)]
                text-[44px]
                font-semibold
                leading-[1.05]
                tracking-[0.2px]
                text-white
                sm:text-[54px]
                md:text-[62px]
                lg:text-[68px]
                xl:text-[72px]
              "
            >
              {currentSlide.title}
            </h1>

            {/* Description */}
            <p
              className="
                mt-[24px]
                max-w-[900px]
                font-[var(--font-sf-pro)]
                text-[18px]
                font-normal
                leading-[1.35]
                tracking-[0.1px]
                text-white/95
                sm:mt-[28px]
                sm:text-[21px]
                md:text-[24px]
                lg:text-[28px]
                xl:text-[31px]
              "
            >
              {currentSlide.description}
            </p>

            {/* Buttons */}
            <div
              className="
                mt-[46px]
                flex
                w-full
                flex-col
                gap-[16px]
                sm:mt-[60px]
                sm:flex-row
                sm:items-center
                sm:gap-[38px]
                lg:mt-[72px]
              "
            >
              <button
                type="button"
                onClick={() => router.push("/category")}
                className="
                  flex
                  h-[60px]
                  w-full
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
                  sm:h-[72px]
                  sm:w-[280px]
                  sm:text-[19px]
                "
              >
                Explore Collection
              </button>

              <button
                type="button"
                onClick={() => router.push("/about")}
                className="
                  flex
                  h-[60px]
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-[#858181]/85
                  px-[30px]
                  font-[var(--font-sf-pro)]
                  text-[17px]
                  font-semibold
                  text-white
                  backdrop-blur-[12px]
                  transition-all
                  duration-300
                  hover:border-white
                  hover:bg-white
                  hover:text-black
                  sm:h-[72px]
                  sm:w-[280px]
                  sm:text-[19px]
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
          MANUAL — NOT SWIPER
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
          md:bottom-[28px]
        "
      >
        {slides.map((_, index) => {
          const isActive = activeSlide === index;

          return (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={isActive ? "true" : undefined}
              onClick={() => changeSlide(index)}
              className={`
                rounded-full
                border-0
                p-0
                outline-none
                transition-all
                duration-300
                ease-out
                ${
                  isActive
                    ? "h-[9px] w-[32px] bg-white md:h-[11px] md:w-[42px]"
                    : "h-[8px] w-[8px] bg-[#332B25]/90 hover:bg-white/70 md:h-[10px] md:w-[10px]"
                }
              `}
            />
          );
        })}
      </div>
    </section>
  );
};

export default Hero;
