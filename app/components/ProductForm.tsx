"use client";

import { useEffect, useRef, useState } from "react";
import {
  useFieldArray,
  useForm,
  FormProvider,
  SubmitErrorHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  Edit3,
  Eye,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ProductDetail from "./product/ProductDetail";
import MediaManager from "./admin/MediaManager";
import VariantImageGallery from "./admin/VariantImageGallery";
import { PRODUCT_IMAGE_GUIDELINES, type ProductImageGuidelineKey } from "@/lib/productImageGuidelines";
import { getOptimizedCloudinaryImage } from "@/lib/cloudinaryImage";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const variantSchema = z.object({
  color: z.string().min(1, "Color is required"),

  colorHex: z
    .string()
    .min(4, "Valid hex code required")
    .regex(/^#/, "Must start with #"),

  size: z.string().min(1, "Size is required"),

  price: z.number().min(0),

  comparePrice: z.preprocess((value) => {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return null;
    }

    const parsedValue =
      typeof value === "string"
        ? parseFloat(value)
        : Number(value);

    return Number.isNaN(parsedValue)
      ? null
      : parsedValue;
  }, z.number().nullable().optional()),

  stockQuantity: z.number().int().min(0),

  sku: z.string().min(1, "SKU is required"),

  images: z
    .array(z.string())
    .min(1, "At least one image is required"),
});

import { sectionSettingsSchema } from '@/lib/validations/product';
import { DEFAULT_PRODUCT_SECTIONS, PRODUCT_SECTIONS } from '@/lib/productSections';

const productSchema = z.object({
  sectionSettings: sectionSettingsSchema,
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters"),

  category: z
    .string()
    .min(1, "Category is required"),

  brand: z
    .string()
    .min(1, "Brand is required"),

  tags: z.string().optional(),

  variants: z
    .array(variantSchema)
    .min(1, "At least one variant is required"),

  /*
    CMS fields stay optional in Zod so the normal form stays simple.
    They are checked manually on submit and edited in Visual CMS.
  */
  baseDescription: z.string().optional(),

  fullDescription: z.string().optional(),

  materialCare: z.object({
    composition: z.string().optional(),
    careInstructions: z.string().optional(),
  }),

  advantages: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),

  logistics: z.object({
    shipping: z.string().optional(),
    returns: z.string().optional(),
  }),

  closeUpSection: z
    .array(
      z.object({
        image: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .max(3),

  engineeredSection: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
  }),

  lifestyleImage: z.string().optional(),

  stylishSection: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    mainImage: z.string().optional(),
    secondaryImage: z.string().optional(),
  }),

  bottomGallery: z.array(z.string()),

  sizeChart: z.string().optional(),
});

type ProductFormValues = z.infer<
  typeof productSchema
>;

interface ProductFormProps {
  initialData?: any;
}

function isEmpty(value: any) {
  return !value || String(value).trim() === "";
}

function normalizeProductData(
  initialData?: any
): ProductFormValues {
  if (!initialData) {
    return {
      sectionSettings: { ...DEFAULT_PRODUCT_SECTIONS },
      title: "",
      slug: "",
      category: "",
      brand: "8 GEARS",
      baseDescription: "",
      fullDescription: "",
      tags: "",

      variants: [
        {
          color: "Black",
          colorHex: "#000000",
          size: "L",
          price: 0,
          comparePrice: null,
          stockQuantity: 10,
          sku: "",
          images: [],
        },
      ],

      materialCare: {
        composition: "",
        careInstructions: "",
      },

      advantages: [
        {
          title: "FAST DELIVERY",
          description: "Next day shipping available",
        },
        {
          title: "SECURE GEAR",
          description: "Certified safety standards",
        },
        {
          title: "AUTHENTICITY",
          description: "100% Genuine hardware",
        },
      ],

      logistics: {
        shipping: "",
        returns: "",
      },

      closeUpSection: [
        {
          image: "",
          title: "",
          description: "",
        },
        {
          image: "",
          title: "",
          description: "",
        },
        {
          image: "",
          title: "",
          description: "",
        },
      ],

      engineeredSection: {
        title: "",
        description: "",
        image: "",
      },

      lifestyleImage: "",

      stylishSection: {
        title: "",
        description: "",
        mainImage: "",
        secondaryImage: "",
      },

      bottomGallery: [],

      sizeChart: "",
    };
  }

  return {
    sectionSettings: { ...DEFAULT_PRODUCT_SECTIONS, ...initialData.sectionSettings },
    title: initialData.title || "",

    slug: initialData.slug || "",

    category:
      initialData.category?.name ||
      initialData.category ||
      "",

    brand: initialData.brand || "8 GEARS",

    baseDescription:
      initialData.baseDescription || "",

    fullDescription:
      initialData.fullDescription || "",

    tags: Array.isArray(initialData.tags)
      ? initialData.tags.join(", ")
      : initialData.tags || "",

    variants:
      Array.isArray(initialData.variants) &&
      initialData.variants.length > 0
        ? initialData.variants.map(
            (variant: any) => ({
              color:
                variant.color || "Black",

              colorHex:
                variant.colorHex ||
                "#000000",

              size:
                variant.size || "",

              price:
                Number(
                  variant.price || 0
                ),

              comparePrice:
                variant.comparePrice ===
                  undefined ||
                variant.comparePrice ===
                  null
                  ? null
                  : Number(
                      variant.comparePrice
                    ),

              stockQuantity:
                Number(
                  variant.stockQuantity ||
                    0
                ),

              sku:
                variant.sku || "",

              images:
                Array.isArray(
                  variant.images
                )
                  ? variant.images
                  : [],
            })
          )
        : [
            {
              color: "Black",
              colorHex: "#000000",
              size: "L",
              price: 0,
              comparePrice: null,
              stockQuantity: 10,
              sku: "",
              images: [],
            },
          ],

    materialCare: {
      composition:
        initialData.materialCare
          ?.composition || "",

      careInstructions:
        initialData.materialCare
          ?.careInstructions || "",
    },

    advantages:
      Array.isArray(
        initialData.advantages
      ) &&
      initialData.advantages.length > 0
        ? initialData.advantages
        : [
            {
              title: "",
              description: "",
            },
          ],

    logistics: {
      shipping:
        initialData.logistics
          ?.shipping || "",

      returns:
        initialData.logistics
          ?.returns || "",
    },

    closeUpSection:
      Array.isArray(
        initialData.closeUpSection
      ) &&
      initialData.closeUpSection
        .length > 0
        ? initialData.closeUpSection
        : [
            {
              image: "",
              title: "",
              description: "",
            },
            {
              image: "",
              title: "",
              description: "",
            },
            {
              image: "",
              title: "",
              description: "",
            },
          ],

    engineeredSection: {
      title:
        initialData.engineeredSection
          ?.title || "",

      description:
        initialData.engineeredSection
          ?.description || "",

      image:
        initialData.engineeredSection
          ?.image || "",
    },

    lifestyleImage:
      initialData.lifestyleImage || "",

    stylishSection: {
      title:
        initialData.stylishSection
          ?.title || "",

      description:
        initialData.stylishSection
          ?.description || "",

      mainImage:
        initialData.stylishSection
          ?.mainImage || "",

      secondaryImage:
        initialData.stylishSection
          ?.secondaryImage || "",
    },

    bottomGallery:
      Array.isArray(
        initialData.bottomGallery
      )
        ? initialData.bottomGallery
        : [],

    sizeChart:
      initialData.sizeChart || "",
  };
}

function validateCMSFields(
  data: ProductFormValues
) {
  const missing: string[] = [];

  if (isEmpty(data.baseDescription)) {
    missing.push("Base Description");
  }

  if (isEmpty(data.fullDescription)) {
    missing.push("Full Description");
  }

  if (
    isEmpty(
      data.materialCare?.composition
    )
  ) {
    missing.push(
      "Material Composition"
    );
  }

  if (
    isEmpty(
      data.materialCare
        ?.careInstructions
    )
  ) {
    missing.push("Care Instructions");
  }

  if (
    isEmpty(data.logistics?.shipping)
  ) {
    missing.push("Shipping Info");
  }

  if (
    isEmpty(data.logistics?.returns)
  ) {
    missing.push("Returns Info");
  }

  const validAdvantages = (
    data.advantages || []
  ).filter(
    (item) =>
      !isEmpty(item.title) &&
      !isEmpty(item.description)
  );

  if (validAdvantages.length === 0) {
    missing.push(
      "At least 1 Advantage"
    );
  }

  return missing;
}

export default function ProductForm({
  initialData,
}: ProductFormProps) {
  const router = useRouter();

  const allowNavigationRef =
    useRef(false);

  const [loading, setLoading] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState<"basic" | "variants">(
      "basic"
    );

  const [viewMode, setViewMode] =
    useState<"edit" | "preview">(
      "edit"
    );

  const [
    mediaManager,
    setMediaManager,
  ] = useState<{
    isOpen: boolean;
    path: string;
    multiple: boolean;
  }>({
    isOpen: false,
    path: "",
    multiple: false,
  });

  const mediaGuidelineKey: ProductImageGuidelineKey | undefined =
    mediaManager.path === "sizeChart"
      ? "sizeChart"
      : mediaManager.path.startsWith("variants.")
        ? "variant"
        : undefined;

  const methods =
    useForm<ProductFormValues>({
      resolver:
        zodResolver(
          productSchema
        ) as any,

      defaultValues:
        normalizeProductData(
          initialData
        ),
    });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,

    formState: {
      errors,
      isDirty,
    },
  } = methods;

  /*
    Protect against browser refresh, tab closing,
    or browser-level navigation while changes are unsaved.
  */
  useEffect(() => {
    const handleBeforeUnload = (
      event: BeforeUnloadEvent
    ) => {
      if (
        !isDirty ||
        allowNavigationRef.current
      ) {
        return;
      }

      event.preventDefault();

      event.returnValue = "";
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [isDirty]);

  /*
    Back button protection.
    The confirmation appears only when changes exist.
  */
  const handleBack = () => {
    if (loading) return;

    if (!isDirty) {
      router.back();
      return;
    }

    const shouldLeave =
      window.confirm(
        "You have unsaved changes. If you go back now, your changes will be lost. Leave without saving?"
      );

    if (!shouldLeave) return;

    allowNavigationRef.current =
      true;

    router.back();
  };

  /*
    Hidden input registration ensures sizeChart stays synced.
  */
  register("sizeChart");

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const [
    categories,
    setCategories,
  ] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((response) =>
        response.json()
      )
      .then((data) =>
        setCategories(data)
      );
  }, []);

  const onSubmit = async (
    data: ProductFormValues
  ) => {
    /*
      Ensure slug exists.
    */
    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          "-"
        )
        .replace(
          /(^-|-$)+/g,
          ""
        );
    }

    const missingCMSFields =
      validateCMSFields(data);

    if (
      missingCMSFields.length >
      0
    ) {
      alert(
        `Please fill these required CMS fields before uploading:\n\n${missingCMSFields
          .map(
            (field) =>
              `- ${field}`
          )
          .join("\n")}`
      );

      setViewMode("preview");

      return;
    }

    setLoading(true);

    try {
      const formattedData = {
        ...data,

        tags: data.tags
          ? data.tags
              .split(",")
              .map((tag) =>
                tag.trim()
              )
              .filter(
                (tag) => tag
              )
          : [],

        advantages:
          data.advantages.filter(
            (item) =>
              item.title &&
              item.description
          ),

        closeUpSection:
          data.closeUpSection
            .filter(
              (item) =>
                !isEmpty(item.image) ||
                !isEmpty(item.title) ||
                !isEmpty(item.description)
            )
            .slice(0, 3),

        /*
          Keep gallery limited to four real images.
          Empty CMS placeholders never get saved.
        */
        bottomGallery:
          data.bottomGallery
            .filter(
              (image) =>
                typeof image ===
                  "string" &&
                image.trim()
                  .length > 0
            )
            .slice(0, 4),

        variants:
          data.variants.map(
            (variant) => ({
              ...variant,

              price: Number(
                variant.price ||
                  0
              ),

              stockQuantity:
                Number(
                  variant.stockQuantity ||
                    0
                ),

              comparePrice:
                variant.comparePrice ||
                undefined,
            })
          ),

        sizeChart:
          data.sizeChart || "",
      };

      const url = initialData
        ? `/api/products/${initialData._id}`
        : "/api/products";

      const method = initialData
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            formattedData
          ),
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json();

        throw new Error(
          errorData.error ||
            "Something went wrong"
        );
      }

      /*
        Disable the unsaved-change warning before redirecting.
      */
      allowNavigationRef.current =
        true;

      router.push("/admin/products");

      router.refresh();
    } catch (error: any) {
      console.error(error);

      alert(
        error.message ||
          "Failed to save product"
      );
    } finally {
      setLoading(false);
    }
  };

  const generateSKU = (
    color: string
  ) => {
    const title =
      watch("title") || "PROD";

    const cleanTitle = title
      .substring(0, 3)
      .toUpperCase()
      .replace(
        /[^A-Z0-9]/g,
        ""
      );

    const cleanColor = color
      .substring(0, 3)
      .toUpperCase()
      .replace(
        /[^A-Z0-9]/g,
        ""
      );

    const timestamp = Date.now()
      .toString()
      .slice(-4);

    return `${cleanTitle}-${cleanColor}-${timestamp}`;
  };

  const onInvalid: SubmitErrorHandler<
    ProductFormValues
  > = (validationErrors) => {
    const messages: string[] = [];

    /*
      Recursive error finder.
    */
    const findErrors = (
      object: any,
      prefix = ""
    ) => {
      if (!object) return;

      if (object.message) {
        messages.push(
          `${prefix}${object.message}`
        );

        return;
      }

      Object.entries(
        object
      ).forEach(
        ([key, value]) => {
          const newPrefix =
            Number.isNaN(
              Number(key)
            )
              ? `${prefix}${key}: `
              : `${prefix}Item ${
                  Number(key) + 1
                }: `;

          findErrors(
            value,
            newPrefix
          );
        }
      );
    };

    findErrors(
      validationErrors
    );

    if (messages.length > 0) {
      console.warn("Product validation:", messages.join(" | "));
    }

    if (
      messages.length === 0
    ) {
      alert(
        "Validation failed, but no specific messages were found. Please check that all variant fields (Size, Price, SKU, Images) are correctly filled."
      );

      return;
    }

    alert(
      `Please fix the following validation errors:\n\n${messages
        .slice(0, 8)
        .join("\n")}${
        messages.length > 8
          ? "\n...and more"
          : ""
      }`
    );
  };

  const generateSlug = () => {
    const title =
      watch("title");

    if (!title) return;

    const slug = title
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /(^-|-$)+/g,
        ""
      );

    setValue(
      "slug",
      slug,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  const watchedValues =
    watch();

  const watchedVariants =
    watch("variants") || [];

  useEffect(() => {
    const colorSkuMap: Record<string, string> = {};
    watchedVariants.forEach((variant: any) => {
      const color = variant?.color || "Black";
      if (variant?.sku && !colorSkuMap[color]) {
        colorSkuMap[color] = variant.sku;
      }
    });

    watchedVariants.forEach((variant: any, index: number) => {
      const color = variant?.color || "Black";
      const colorSku = colorSkuMap[color] || generateSKU(color);
      colorSkuMap[color] = colorSku;

      if (variant?.sku !== colorSku) {
        setValue(
          `variants.${index}.sku`,
          colorSku,
          { shouldDirty: false, shouldValidate: false }
        );
      }
    });
  }, [watchedVariants, setValue]);

  return (
    <FormProvider {...methods}>
      <div className="mx-auto w-full max-w-[1900px] space-y-8 px-4 pb-20 sm:px-6 lg:px-8">
        {/* VISUAL CMS HEADER */}
        <div className="sticky top-0 z-[100] -mx-4 flex flex-col gap-4 border-b border-gray-100 bg-white/85 px-4 py-4 shadow-sm backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-4 lg:gap-7">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 shadow-sm transition-all duration-300 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={15} />

              Back
            </button>

            <div className="hidden h-10 w-px bg-gray-200 sm:block" />

            <div className="relative">
              <h2 className="text-3xl font-black uppercase italic leading-none tracking-tighter text-slate-900">
                8{" "}
                <span className="text-orange-500">
                  Gears
                </span>
              </h2>

              <div className="absolute -bottom-2 left-0 h-1 w-12 rounded-full bg-orange-500" />
            </div>

            <div className="hidden h-10 w-px bg-gray-200 lg:block" />

            <div className="flex rounded-2xl border border-gray-200/50 bg-gray-100/50 p-1">
              <button
                type="button"
                onClick={() =>
                  setViewMode("edit")
                }
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.16em] transition-all duration-300 sm:px-6 sm:text-[10px] sm:tracking-[0.2em]",

                  viewMode === "edit"
                    ? "bg-white text-slate-900 shadow-xl"
                    : "text-gray-400 hover:text-slate-900"
                )}
              >
                <Edit3
                  size={14}
                  className={
                    viewMode === "edit"
                      ? "text-orange-500"
                      : ""
                  }
                />

                Data Matrix
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewMode(
                    "preview"
                  )
                }
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.16em] transition-all duration-300 sm:px-6 sm:text-[10px] sm:tracking-[0.2em]",

                  viewMode ===
                    "preview"
                    ? "bg-white text-slate-900 shadow-xl"
                    : "text-gray-400 hover:text-slate-900"
                )}
              >
                <Eye
                  size={14}
                  className={
                    viewMode ===
                    "preview"
                      ? "text-orange-500"
                      : ""
                  }
                />

                Visual CMS
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            {isDirty && (
              <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-amber-700">
                Unsaved Changes
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit(
                onSubmit,
                onInvalid
              )}
              disabled={loading}
              className="group relative inline-flex overflow-hidden rounded-2xl border border-transparent bg-slate-900 px-6 py-3.5 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-500 hover:bg-slate-800 focus:outline-none disabled:opacity-50 sm:px-10 sm:py-4 sm:text-[10px] sm:tracking-[0.3em]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex items-center">
                {loading ? (
                  <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-3 h-4 w-4 text-orange-500" />
                )}

                {initialData
                  ? "Update Product"
                  : "Deploy Hardware"}
              </div>
            </button>
          </div>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Optional product sections</h2>
          <p className="mt-1 text-sm text-gray-500">Optional sections appear in Visual CMS. Turn a section on to edit it and enable it on the storefront; off sections are blurred and locked. Empty sections stay hidden from customers. Turning a section off keeps its content.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_SECTIONS.map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200 p-3 text-sm">
                <span>{label}</span>
                <input
                  type="checkbox"
                  role="switch"
                  aria-label={`Enable ${label}`}
                  {...register(`sectionSettings.${key}`)}
                  className="h-5 w-5 accent-orange-500"
                />
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">You Might Also Like and Reviews are always enabled. Related products appear automatically when available.</p>
        </section>

        {viewMode === "preview" ? (
          <div className="fixed inset-0 z-[1000] animate-in overflow-hidden bg-slate-900 fade-in duration-300">
            {/* PROFESSIONAL PREVIEW FRAME */}
            <div className="flex h-dvh w-full flex-col overflow-hidden bg-white">
              <div className="flex h-12 items-center justify-between border-b border-white/5 bg-slate-900 px-5 sm:px-10">
                <button type="button" onClick={() => setViewMode("edit")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white/75 hover:bg-white/10 hover:text-white">
                  <X size={15} /> Exit Preview
                </button>

                <div className="hidden gap-2 sm:flex">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />

                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />

                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                </div>

                <div className="hidden rounded-full bg-white/10 px-6 py-1 text-[9px] font-black uppercase tracking-[0.3em] text-white/60 sm:block">
                  8GEARS.PREVIEW
                </div>

                <div className="flex items-center gap-3 text-orange-500">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />

                  <span className="text-[8px] font-black uppercase tracking-[0.16em] sm:text-[9px] sm:tracking-[0.2em]">
                    Editing Active
                  </span>

                  <button type="button" onClick={handleSubmit(onSubmit, onInvalid)} disabled={loading} className="ml-2 rounded-lg bg-orange-500 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-orange-600 disabled:opacity-50">
                    {loading ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>

              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
                <ProductDetail
                  product={
                    watchedValues
                  }
                  isCMS={true}
                />
              </div>
            </div>

          </div>
        ) : (
          <div className="animate-in space-y-8 fade-in slide-in-from-bottom-4 duration-500">
            {/* TABS NAVIGATION */}
            <div className="flex w-fit max-w-full flex-wrap gap-2 rounded-2xl bg-gray-100 p-1">
              {[
                {
                  id: "basic",
                  label: "Identity",
                },
                {
                  id: "variants",
                  label: "Inventory",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.id as any
                    )
                  }
                  className={cn(
                    "rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all",

                    activeTab === tab.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  )}
                >
                  {tab.label}
                </button>
              ))}

              <div className="mx-2 h-6 w-px self-center bg-gray-200" />

              <button
                type="button"
                onClick={() =>
                  setViewMode(
                    "preview"
                  )
                }
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-wider text-orange-600 transition-all hover:bg-orange-50"
              >
                Edit Visuals

                <Eye size={14} />
              </button>
            </div>

            {activeTab === "basic" && (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                  <section className="space-y-8 rounded-[3rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
                    <div className="border-l-4 border-orange-500 pl-6">
                      <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-900">
                        Core Identity
                      </h3>

                      <p className="text-sm font-medium text-slate-400">
                        Fundamental
                        product metadata.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Product Title
                        </label>

                        <input
                          {...register(
                            "title"
                          )}
                          onBlur={
                            generateSlug
                          }
                          className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-6 py-5 text-xl font-black tracking-tight outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                          placeholder="e.g. TITAN M1 GLOVES"
                        />

                        {errors.title && (
                          <p className="mt-2 text-[10px] font-bold uppercase text-red-500">
                            {
                              errors
                                .title
                                .message
                            }
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Category
                        </label>

                        <select
                          key={
                            categories.length
                          }
                          {...register(
                            "category"
                          )}
                          className="w-full cursor-pointer appearance-none rounded-2xl border border-gray-100 bg-white px-6 py-5 font-bold outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                        >
                          <option value="">
                            Select Gear
                            Class
                          </option>

                          {categories.map(
                            (
                              category
                            ) => (
                              <option
                                key={
                                  category._id
                                }
                                value={
                                  category.name
                                }
                              >
                                {
                                  category.name
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Search Tags
                        </label>

                        <input
                          {...register(
                            "tags"
                          )}
                          className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-6 py-5 font-medium outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                          placeholder="racing, protective, carbon"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Slug
                          (Auto-generated)
                        </label>

                        <input
                          {...register(
                            "slug"
                          )}
                          className="w-full cursor-not-allowed rounded-xl border border-gray-100 bg-gray-100 px-6 py-4 font-mono text-xs text-gray-400"
                          readOnly
                        />
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-xl font-black italic shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                        8
                      </div>

                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest">
                          8 GEARS
                          Verified
                        </h4>

                        <p className="text-[10px] font-medium uppercase text-slate-400">
                          Authentic
                          Hardware
                        </p>
                      </div>
                    </div>

                    <p className="text-xs font-medium leading-relaxed text-slate-300">
                      All products are
                      automatically
                      listed under the{" "}
                      <span className="font-black italic text-orange-500">
                        8 GEARS
                      </span>{" "}
                      brand.
                    </p>
                  </div>

                  <div
                    className="group cursor-pointer rounded-[2.5rem] bg-orange-500 p-8 text-white shadow-xl"
                    onClick={() =>
                      setViewMode(
                        "preview"
                      )
                    }
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em]">
                        Visual CMS
                      </h4>

                      <Eye
                        size={20}
                        className="transition-transform duration-500 group-hover:scale-125"
                      />
                    </div>

                    <p className="text-xs font-medium leading-relaxed text-white/90">
                      Narratives,
                      cinematic shots,
                      and technical focus
                      points are now
                      managed directly on
                      the product
                      preview.
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                      Open Visual Editor

                      <Plus size={12} />
                    </div>
                  </div>

                  {/* SIZE CHART IMAGE OPTIONAL */}
                  <div className="space-y-6 rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
                    <div className="border-l-4 border-slate-900 pl-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
                        Size Chart Image
                      </h4>

                      <p className="text-[10px] font-medium uppercase text-slate-400">
                        Optional
                      </p>
                      <ImageRequirement guidelineKey="sizeChart" />
                    </div>

                    {watch(
                      "sizeChart"
                    ) ? (
                      <div className="space-y-4">
                        <div className="group/chart relative aspect-video overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                          <img
                            src={getOptimizedCloudinaryImage(watch("sizeChart"), 1080)}
                            alt="Size Chart"
                            className="h-full w-full object-contain"
                            loading="lazy"
                            decoding="async"
                          />

                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/40 opacity-0 transition-opacity group-hover/chart:opacity-100">
                            <button
                              type="button"
                              onClick={() =>
                                setMediaManager(
                                  {
                                    isOpen:
                                      true,

                                    path:
                                      "sizeChart",

                                    multiple:
                                      false,
                                  }
                                )
                              }
                              className="cursor-pointer rounded-lg bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-900 transition-all hover:bg-orange-500 hover:text-white"
                            >
                              Replace
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setValue(
                                  "sizeChart",
                                  "",
                                  {
                                    shouldDirty:
                                      true,

                                    shouldValidate:
                                      true,
                                  }
                                )
                              }
                              className="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white transition-all hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setMediaManager(
                            {
                              isOpen: true,

                              path:
                                "sizeChart",

                              multiple:
                                false,
                            }
                          )
                        }
                        className="group flex aspect-[2/1] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/30 text-gray-300 transition-all hover:border-orange-500 hover:text-orange-500"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110">
                          <Plus
                            size={20}
                          />
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Upload Size Chart
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab ===
              "variants" && (
              <div className="space-y-8">
                <section className="space-y-10 rounded-[3rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="border-l-4 border-orange-500 pl-6">
                      <h3 className="text-2xl font-black uppercase italic tracking-tight text-slate-900">
                        Inventory Command
                      </h3>

                      <p className="text-sm font-medium text-slate-400">
                        Manage sizes,
                        colors, and stock
                        levels.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const existingColors =
                          Array.from(
                            new Set(
                              watchedVariants.map(
                                (
                                  variant: any
                                ) =>
                                  variant.color ||
                                  "Black"
                              )
                            )
                          );

                        let newColor =
                          "New Color";

                        let counter = 1;

                        while (
                          existingColors.includes(
                            newColor
                          )
                        ) {
                          newColor = `New Color ${counter++}`;
                        }

                        const newSize =
                          "L";

                        appendVariant({
                          color:
                            newColor,

                          colorHex:
                            "#000000",

                          size:
                            newSize,

                          price: 0,

                          stockQuantity: 10,

                          sku: generateSKU(
                            newColor
                          ),

                          images: [],
                        });
                      }}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-orange-600"
                    >
                      <Plus size={18} />

                      Add New Variant
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-12">
                    {Array.from(
                      new Set(
                        watchedVariants.map(
                          (
                            variant: any
                          ) =>
                            variant.color ||
                            "Black"
                        )
                      )
                    ).map(
                      (
                        colorName,
                        groupIndex
                      ) => {
                        const firstIndex =
                          watchedVariants.findIndex(
                            (
                              variant: any
                            ) =>
                              (variant.color ||
                                "Black") ===
                              colorName
                          );

                        const sameColorIndices =
                          watchedVariants
                            .map(
                              (
                                variant: any,
                                index: number
                              ) =>
                                (variant.color ||
                                  "Black") ===
                                colorName
                                  ? index
                                  : -1
                            )
                            .filter(
                              (
                                index: number
                              ) =>
                                index !== -1
                            );

                        return (
                          <div
                            key={
                              groupIndex
                            }
                            className="animate-in space-y-8 rounded-[3rem] border border-gray-100 bg-gray-50/30 p-6 fade-in duration-500 sm:p-10"
                          >
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-6">
                                <div
                                  className="h-16 w-16 rounded-2xl border-4 border-white shadow-xl"
                                  style={{
                                    backgroundColor:
                                      watch(
                                        `variants.${firstIndex}.colorHex`
                                      ),
                                  }}
                                />

                                <div>
                                  <input
                                    value={
                                      watch(
                                        `variants.${firstIndex}.color`
                                      ) || ""
                                    }
                                    onChange={(
                                      event
                                    ) => {
                                      const color =
                                        event
                                          .target
                                          .value;

                                      sameColorIndices.forEach(
                                        (
                                          index
                                        ) =>
                                          setValue(
                                            `variants.${index}.color`,
                                            color,
                                            {
                                              shouldDirty:
                                                true,

                                              shouldValidate:
                                                true,
                                            }
                                          )
                                      );
                                    }}
                                    className="-m-1 w-full rounded-lg border-none bg-transparent p-1 text-xl font-black uppercase italic leading-none text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                    placeholder="Color Name"
                                  />

                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                      SKU:
                                    </span>
                                    <input
                                      value={
                                        watch(`variants.${firstIndex}.sku`) || ""
                                      }
                                      onChange={(event) => {
                                        const newSku = event.target.value;
                                        sameColorIndices.forEach((index) =>
                                          setValue(`variants.${index}.sku`, newSku, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          })
                                        );
                                      }}
                                      className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 font-mono text-xs font-bold text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                                      placeholder="Color SKU"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const first =
                                      watch(
                                        `variants.${firstIndex}`
                                      );

                                    const newSize =
                                      "XL";

                                    appendVariant(
                                      {
                                        ...first,

                                        size:
                                          newSize,

                                        sku:
                                          first?.sku ||
                                          generateSKU(
                                            first?.color || "Black"
                                          ),

                                        stockQuantity: 10,
                                      }
                                    );
                                  }}
                                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-sm transition-all hover:border-orange-500 hover:text-orange-500"
                                >
                                  <Plus
                                    size={14}
                                  />

                                  Add Size
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Remove entire ${colorName} color group?`
                                      )
                                    ) {
                                      [
                                        ...sameColorIndices,
                                      ]
                                        .reverse()
                                        .forEach(
                                          (
                                            index
                                          ) =>
                                            removeVariant(
                                              index
                                            )
                                        );
                                    }
                                  }}
                                  className="rounded-xl bg-red-50 p-3 text-red-500 shadow-sm transition-all hover:bg-red-500 hover:text-white"
                                  title="Remove Color Group"
                                >
                                  <Trash2
                                    size={16}
                                  />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
                              {/* COLOR VISUALS */}
                              <div className="space-y-6 lg:col-span-1">
                                <div className="space-y-4">
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Visual Matrix
                                  </label>
                                  <ImageRequirement guidelineKey="variant" />

                                  <VariantImageGallery
                                    images={watch(`variants.${firstIndex}.images`) || []}
                                    onChange={(images) => {
                                      sameColorIndices.forEach((index) =>
                                        setValue(`variants.${index}.images`, images, {
                                          shouldDirty: true,
                                          shouldValidate: true,
                                        })
                                      );
                                    }}
                                    onAdd={() => setMediaManager({
                                      isOpen: true,
                                      path: `variants.${firstIndex}.images`,
                                      multiple: true,
                                    })}
                                  />
                                </div>

                                <div className="space-y-4">
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Color Sync
                                  </label>

                                  <div className="flex gap-3">
                                    <input
                                      type="color"
                                      value={watch(
                                        `variants.${firstIndex}.colorHex`
                                      )}
                                      onChange={(
                                        event
                                      ) => {
                                        const hex =
                                          event
                                            .target
                                            .value;

                                        sameColorIndices.forEach(
                                          (
                                            index
                                          ) =>
                                            setValue(
                                              `variants.${index}.colorHex`,
                                              hex,
                                              {
                                                shouldDirty:
                                                  true,

                                                shouldValidate:
                                                  true,
                                              }
                                            )
                                        );
                                      }}
                                      className="h-12 w-12 cursor-pointer rounded-xl border-none bg-transparent"
                                    />

                                    <input
                                      {...register(
                                        `variants.${firstIndex}.colorHex`
                                      )}
                                      onChange={(
                                        event
                                      ) => {
                                        const hex =
                                          event
                                            .target
                                            .value;

                                        sameColorIndices.forEach(
                                          (
                                            index
                                          ) =>
                                            setValue(
                                              `variants.${index}.colorHex`,
                                              hex,
                                              {
                                                shouldDirty:
                                                  true,

                                                shouldValidate:
                                                  true,
                                              }
                                            )
                                        );
                                      }}
                                      className="flex-1 rounded-xl border border-gray-100 px-4 py-3 font-mono text-xs outline-none focus:ring-2 focus:ring-orange-500"
                                      placeholder="#000000"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* SIZES TABLE */}
                              <div className="overflow-x-auto lg:col-span-3">
                                <div className="min-w-[760px] overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
                                  <table className="w-full text-left">
                                    <thead className="border-b border-gray-100 bg-gray-50">
                                      <tr>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                          Size
                                        </th>

                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                          Price
                                        </th>

                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                          Compare
                                          at
                                        </th>

                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                          Stock
                                        </th>

                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                          SKU
                                        </th>

                                        <th className="px-6 py-4" />
                                      </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-50">
                                      {sameColorIndices.map(
                                        (
                                          fieldIndex
                                        ) => (
                                          <tr
                                            key={
                                              variantFields[
                                                fieldIndex
                                              ].id
                                            }
                                            className="group/row transition-colors hover:bg-gray-50/50"
                                          >
                                            <td className="px-6 py-4">
                                              <input
                                                {...register(
                                                  `variants.${fieldIndex}.size`
                                                )}
                                                onChange={(
                                                  event
                                                ) => {
                                                  const size =
                                                    event
                                                      .target
                                                      .value;

                                                  setValue(
                                                    `variants.${fieldIndex}.size`,
                                                    size,
                                                    {
                                                      shouldDirty:
                                                        true,

                                                      shouldValidate:
                                                        true,
                                                    }
                                                  );
                                                }}
                                                className="w-16 bg-transparent font-black uppercase text-slate-900 focus:outline-none"
                                              />
                                            </td>

                                            <td className="px-6 py-4">
                                              <div className="flex items-center gap-1">
                                                <span className="text-[10px] font-bold text-gray-400">
                                                  $
                                                </span>

                                                <input
                                                  type="number"
                                                  {...register(
                                                    `variants.${fieldIndex}.price`,
                                                    {
                                                      valueAsNumber:
                                                        true,
                                                    }
                                                  )}
                                                  className="w-20 bg-transparent font-black text-slate-900 focus:outline-none"
                                                />
                                              </div>
                                            </td>

                                            <td className="px-6 py-4">
                                              <div className="flex items-center gap-1">
                                                <span className="text-[10px] font-bold text-gray-400">
                                                  $
                                                </span>

                                                <input
                                                  type="number"
                                                  {...register(
                                                    `variants.${fieldIndex}.comparePrice`,
                                                    {
                                                      valueAsNumber:
                                                        true,
                                                    }
                                                  )}
                                                  className="w-20 bg-transparent font-medium text-gray-400 focus:outline-none"
                                                  placeholder="None"
                                                />
                                              </div>
                                            </td>

                                            <td className="px-6 py-4">
                                              <input
                                                type="number"
                                                {...register(
                                                  `variants.${fieldIndex}.stockQuantity`,
                                                  {
                                                    valueAsNumber:
                                                      true,
                                                  }
                                                )}
                                                className="w-16 bg-transparent font-bold text-slate-900 focus:outline-none"
                                              />
                                            </td>

                                            <td className="px-6 py-4">
                                              <span className="inline-block rounded-md bg-gray-100 px-2.5 py-1 font-mono text-[10px] font-bold text-slate-600">
                                                {watch(`variants.${fieldIndex}.sku`) || watch(`variants.${firstIndex}.sku`) || "No SKU"}
                                              </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeVariant(
                                                    fieldIndex
                                                  )
                                                }
                                                className="p-2 text-gray-200 opacity-0 transition-all hover:text-red-500 group-hover/row:opacity-100"
                                              >
                                                <Trash2
                                                  size={
                                                    16
                                                  }
                                                />
                                              </button>
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </section>
              </div>
            )}

            <MediaManager
              isOpen={
                mediaManager.isOpen
              }
              allowMultiple={
                mediaManager.multiple
              }
              onClose={() =>
                setMediaManager(
                  (previous) => ({
                    ...previous,

                    isOpen: false,
                  })
                )
              }
              onSelect={(selected) => {
                const urls = Array.isArray(selected) ? selected : [selected];
                if (
                  mediaManager.multiple
                ) {
                  const path =
                    mediaManager.path;

                  const match =
                    path.match(
                      /variants\.(\d+)/
                    );

                  if (match) {
                    const index =
                      parseInt(
                        match[1]
                      );

                    const colorName =
                      watch(
                        `variants.${index}.color`
                      );

                    const sameColorIndices =
                      (
                        watchedVariants ||
                        []
                      )
                        .map(
                          (
                            variant: any,
                            variantIndex: number
                          ) =>
                            (variant.color ||
                              "Black") ===
                            colorName
                              ? variantIndex
                              : -1
                        )
                        .filter(
                          (
                            variantIndex: number
                          ) =>
                            variantIndex !==
                            -1
                        );

                    sameColorIndices.forEach(
                      (
                        variantIndex
                      ) => {
                        const current =
                          watch(
                            `variants.${variantIndex}.images`
                          ) || [];

                        const newUrls = urls.filter((url) => !current.includes(url));

                        if (
                          newUrls.length > 0
                        ) {
                          setValue(
                            `variants.${variantIndex}.images`,
                            [
                              ...current,
                              ...newUrls,
                            ],
                            {
                              shouldDirty:
                                true,

                              shouldValidate:
                                true,
                            }
                          );
                        }
                      }
                    );
                  } else {
                    const current =
                      watch(
                        path as any
                      ) || [];

                    const newUrls = urls.filter((url) => !current.includes(url));

                    if (
                      newUrls.length > 0
                    ) {
                      setValue(
                        path as any,
                        [...current, ...newUrls],
                        {
                          shouldDirty:
                            true,

                          shouldValidate:
                            true,
                        }
                      );
                    }
                  }
                } else {
                  setValue(
                    mediaManager.path as any,
                    urls[0] || "",
                    {
                      shouldDirty:
                        true,

                      shouldValidate:
                        true,
                    }
                  );
                }

                setMediaManager(
                  (previous) => ({
                    ...previous,

                    isOpen: false,
                  })
                );
              }}
              guidelineKey={mediaGuidelineKey}
            />
          </div>
        )}
      </div>
    </FormProvider>
  );
}

function ImageRequirement({ guidelineKey }: { guidelineKey: ProductImageGuidelineKey }) {
  const guideline = PRODUCT_IMAGE_GUIDELINES[guidelineKey];
  return (
    <p className="mt-2 text-[10px] font-medium normal-case leading-4 tracking-normal text-slate-500">
      Recommended: {guideline.width} × {guideline.height}px · {guideline.aspectRatio}
      <br />
      {guideline.guidance}
    </p>
  );
}
