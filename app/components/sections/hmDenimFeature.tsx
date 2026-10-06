"use client";


import { useRouter } from "next/navigation";

const features = [
  "AAA Certified Single layer ( Made with dyneema )",
  "AA Certified with Kevlar Lining",
  "AA Certified selvedge jeans with Kevlar Lining",
];

const DenimFeature = () => {
  const router = useRouter();

  return (
    <section className="w-full bg-white">
      <div
        className="
          mx-auto
          grid
          w-full
          max-w-[1920px]
          grid-cols-1

          gap-[28px]

          px-[20px]
          py-[52px]

          sm:gap-[40px]
          sm:px-[40px]
          sm:py-[70px]

          lg:grid-cols-2
          lg:items-stretch
          lg:gap-[76px]
          lg:px-[70px]
          lg:py-[110px]

          xl:px-[72px]
        "
      >
        {/* LEFT COLUMN */}
        <div className="flex min-w-0 flex-col">
          {/* CONTENT */}
          <div>
            <h2
              className="
                font-[var(--font-sf-pro)]

                text-[30px]
                font-medium
                leading-[1.08]
                tracking-[-0.9px]
                text-black

                sm:text-[42px]
                sm:tracking-[-1.2px]

                lg:text-[48px]
              "
            >
              Denim Engineered for Every Ride
            </h2>

            <div
              className="
                mt-[24px]
                flex
                flex-col
                gap-[11px]

                sm:mt-[30px]
                sm:gap-[13px]
              "
            >
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-[13px] sm:gap-[18px]"
                >
                  <span
                    className="
                      mt-[10px]
                      h-[2px]
                      w-[17px]
                      shrink-0
                      bg-[#aa7447]

                      sm:mt-[13px]
                      sm:w-[22px]

                      lg:mt-[15px]
                    "
                  />

                  <p
                    className="
                      font-[var(--font-sf-pro)]

                      text-[15px]
                      font-semibold
                      leading-[1.35]
                      text-[#1c1c1c]

                      sm:text-[20px]

                      lg:text-[24px]
                      lg:leading-[1.3]
                    "
                  >
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => router.push("/category?categoryId=6a65dfecc52b57a1a991f914#category-listing")}
              className="
                mt-[26px]

                flex
                h-[45px]
                w-[170px]

                items-center
                justify-center
                gap-[9px]

                rounded-full
                bg-black

                font-[var(--font-sf-pro)]
                text-[13px]
                font-medium
                text-white

                transition-colors
                duration-300

                hover:bg-[#222]

                sm:mt-[34px]
                sm:h-[50px]
                sm:w-[200px]
                sm:text-[14px]
              "
            >
              Learn More

              <span className="text-[16px] leading-none sm:text-[17px]">
                →
              </span>
            </button>
          </div>

          {/* CONTENT → IMAGE GAP */}
          <div
            className="
              h-[34px]
              shrink-0

              sm:h-[54px]

              lg:h-[64px]
            "
          />

          {/* LEFT IMAGE */}
          <div
            className="
              w-full
              overflow-hidden

              rounded-[22px]

              sm:rounded-[32px]

              lg:mt-auto
              lg:rounded-[44px]
            "
          >
            <div
              className="
                h-[300px]
                w-full

                sm:h-auto
                sm:aspect-[850/793]

                lg:aspect-[850/793]
              "
            >
              <img
                src="/assets/images/denim-feature-left.webp"
                alt="8-Gear rider wearing protective motorcycle apparel"
                draggable={false}
                loading="lazy"
                decoding="async"
                className="block h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="min-w-0 lg:h-full">
          <div
            className="
              h-[360px]
              w-full
              overflow-hidden

              rounded-[22px]

              sm:h-[520px]
              sm:rounded-[32px]

              lg:h-full
              lg:min-h-[700px]
              lg:rounded-[44px]
            "
          >
            <img
              src="/assets/images/denim-feature-right.webp"
              alt="8-Gear water-repellent protective riding hoodie"
              draggable={false}
              loading="lazy"
              decoding="async"
              className="block h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DenimFeature;
