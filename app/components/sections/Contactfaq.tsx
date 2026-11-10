"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is the average price range for 8-Gear products?",
    answer:
      "Our outdoor riding gear typically ranges from $200 to $300, depending on the type and technology featured in the gear. We pride ourselves on offering high-performance options at competitive prices.",
  },
  {
    question: "How can I track my order after purchasing?",
    answer:
      "Once your order has been shipped, you will receive tracking information that allows you to follow the delivery status of your order. You can also use our order tracking page for the latest updates.",
  },
  {
    question: "Do you offer a warranty on your riding gear?",
    answer:
      "Yes. Our riding gear is covered according to the warranty terms applicable to the specific product. If you experience a manufacturing issue, contact our support team and we will guide you through the warranty process.",
  },
  {
    question: "What materials do you use in your riding apparel?",
    answer:
      "Our riding apparel is developed using durable, performance-focused materials selected for comfort, protection, weather resistance, flexibility, and long-term use.",
  },
  {
    question: "Where can I find size charts for your clothing?",
    answer:
      "Size information is available with our products to help you choose the appropriate fit. If you are unsure about sizing, our support team can also assist you before placing your order.",
  },
  {
    question: "How do I contact customer support for further assistance?",
    answer:
      "You can contact our team using the inquiry form on this page or reach out directly through the contact information provided above. Our team will assist you with product, order, or general questions.",
  },
  {
    question: "Are Armors included in your apparels?",
    answer:
      "Armor inclusion depends on the specific product. Please check the individual product details for information about included protectors, armor compatibility, and available protection options.",
  },
  {
    question: "Do you have a sustainability policy?",
    answer:
      "Yes. Sustainability is an important part of our approach, and we continuously work toward responsible material choices, efficient production practices, and reducing environmental impact wherever possible.",
  },
];

export default function ContactFAQ() {
  // null = everything closed by default
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="w-full bg-white">
      <div
        className="
          mx-auto
          w-full
          max-w-[1180px]
          px-[24px]
          py-[70px]

          sm:px-[40px]
          sm:py-[85px]

          lg:px-[60px]
          lg:py-[115px]

          xl:px-0
        "
      >
        {/* =====================================================
            HEADING
        ====================================================== */}
        <div className="mx-auto max-w-[760px] text-center">
          <h2
            className="
              font-[var(--font-sf-pro)]
              text-[28px]
              font-semibold
              leading-[1.2]
              tracking-[-0.7px]
              text-black

              sm:text-[32px]

              lg:text-[35px]
              lg:leading-[1.18]
            "
          >
            Frequently Asked Questions About Our Outdoor
            <br className="hidden sm:block" />
            Motorcycle Apparel
          </h2>

          <p
            className="
              mt-[18px]
              font-[var(--font-sf-pro)]
              text-[15px]
              font-normal
              leading-[1.5]
              text-[#7D7D7D]

              sm:text-[16px]

              lg:mt-[20px]
              lg:text-[17px]
            "
          >
            Get the answers you need about our products and services.
          </p>
        </div>

        {/* =====================================================
            FAQ ACCORDION
        ====================================================== */}
        <div
          className="
            mx-auto
            mt-[55px]
            flex
            w-full
            max-w-[900px]
            flex-col
            gap-[16px]

            sm:mt-[65px]

            lg:mt-[70px]
            lg:gap-[18px]
          "
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className={`
                  overflow-hidden
                  rounded-[14px]
                  border
                  transition-all
                  duration-300
                  ease-out

                  ${
                    isOpen
                      ? "border-[#E2E2E2] bg-white"
                      : "border-transparent bg-[#F2F2F2]"
                  }
                `}
              >
                {/* Question */}
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  className={`
                    flex
                    min-h-[68px]
                    w-full
                    items-center
                    justify-between
                    gap-[20px]
                    px-[20px]
                    py-[18px]
                    text-left

                    transition-colors
                    duration-300

                    sm:min-h-[72px]
                    sm:px-[28px]

                    lg:min-h-[78px]
                    lg:px-[34px]

                    ${
                      isOpen
                        ? "bg-[#F2F2F2]"
                        : "bg-[#F2F2F2] hover:bg-[#ECECEC]"
                    }
                  `}
                >
                  <span
                    className="
                      pr-[10px]
                      font-[var(--font-sf-pro)]
                      text-[15px]
                      font-semibold
                      leading-[1.35]
                      text-black

                      sm:text-[16px]

                      lg:text-[17px]
                    "
                  >
                    {faq.question}
                  </span>

                  <ChevronDown
                    size={22}
                    strokeWidth={1.8}
                    className={`
                      shrink-0
                      text-black
                      transition-transform
                      duration-300
                      ease-out
                      ${isOpen ? "rotate-180" : "rotate-0"}
                    `}
                  />
                </button>

                {/* Answer */}
                <div
                  className={`
                    grid
                    transition-[grid-template-rows,opacity]
                    duration-[350ms]
                    ease-out

                    ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }
                  `}
                >
                  <div className="overflow-hidden">
                    <div
                      className="
                        bg-white
                        px-[20px]
                        py-[20px]

                        sm:px-[28px]
                        sm:py-[22px]

                        lg:px-[34px]
                        lg:py-[24px]
                      "
                    >
                      <p
                        className="
                          max-w-[820px]
                          font-[var(--font-sf-pro)]
                          text-[14px]
                          font-medium
                          leading-[1.55]
                          text-[#202020]

                          sm:text-[15px]

                          lg:text-[16px]
                        "
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}