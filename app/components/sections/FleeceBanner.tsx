"use client";


import Image from "next/image";
import Link from "next/link";

const FleeceBanner = () => {
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="relative min-h-[620px] w-full lg:aspect-[1920/1078] lg:min-h-0">
        {/* Background Image */}
        <Image
          src="/assets/images/fleece-banner.webp"
          alt="Motorcycle rider wearing the 8-Gear fleece collection"
          fill
          sizes="100vw"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Main Dark Overlay */}
        {/* <div className="absolute inset-0 bg-black/55" /> */}

        {/* Slight bottom cinematic depth */}
        <div className="absolute inset-x-0 bottom-0 h-[260px] bg-gradient-to-t from-black/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex h-full min-h-[620px] w-full items-center justify-center px-[24px] text-center lg:min-h-0">
          <div className="flex flex-col items-center">
            <h2 className="max-w-[1500px] font-[var(--font-sf-pro)] text-[38px] font-medium leading-[1.08] tracking-[0.5px] text-white sm:text-[48px] md:text-[56px] lg:text-[64px] xl:text-[68px]">
              Explore Certified Fleece Collection
            </h2>

            <Link
              href={"/category?categoryId=6a65dfd4c52b57a1a991f913#category-listing"}
              className="mt-[58px] flex h-[70px] w-[255px] items-center justify-center rounded-full border border-white/25 bg-black/55 font-[var(--font-sf-pro)] text-[17px] font-medium text-white backdrop-blur-[5px] transition-all duration-300 hover:bg-white hover:text-black sm:w-[265px] sm:text-[18px]"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FleeceBanner;
