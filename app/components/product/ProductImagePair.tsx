"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getCloudinarySrcSet, getOptimizedCloudinaryImage } from "@/lib/cloudinaryImage";

const IMAGE_SIZES = "(max-width: 760px) 100vw, 42vw";
const pendingImages = new Map<string, Promise<void>>();

function preloadImage(src: string): Promise<void> {
    const key = `${src}:${window.innerWidth}:${window.devicePixelRatio}`;
    const existing = pendingImages.get(key);
    if (existing) return existing;
    const promise = new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = async () => {
            try { await image.decode(); } catch { /* Loaded images can still render if decode is unsupported. */ }
            resolve();
        };
        image.onerror = () => reject(new Error("Unable to load product image"));
        image.sizes = IMAGE_SIZES;
        image.srcset = getCloudinarySrcSet(src) || "";
        image.src = getOptimizedCloudinaryImage(src, 1080);
    });
    pendingImages.set(key, promise);
    // Bound the cache and allow failed requests to be retried.
    if (pendingImages.size > 40) pendingImages.delete(pendingImages.keys().next().value!);
    void promise.catch(() => pendingImages.delete(key));
    return promise;
}

export function preloadProductPair(first?: string, second?: string) {
    return Promise.all([
        first ? preloadImage(first) : Promise.resolve(),
        second && window.matchMedia("(min-width: 761px)").matches ? preloadImage(second) : Promise.resolve(),
    ]);
}

type Pair = { first?: string; second?: string };

export default function ProductImagePair({ first, second, title }: Pair & { title: string }) {
    const [displayed, setDisplayed] = useState<Pair>({ first, second });
    const [failed, setFailed] = useState(false);
    const reducedMotion = useReducedMotion();
    const isPending = displayed.first !== first || displayed.second !== second;

    useEffect(() => {
        let active = true;
        // Keep the last pair visible until BOTH requested desktop images are decoded.
        void preloadProductPair(first, second).then(() => {
            if (active) { setDisplayed({ first, second }); setFailed(false); }
        }).catch(() => { if (active) setFailed(true); });
        return () => { active = false; };
    }, [first, second]);

    return <div className="relative" aria-busy={isPending && !failed}>
        <div className="grid overflow-hidden rounded-[20px]">
            <AnimatePresence initial={false}>
                <motion.div
                    key={JSON.stringify([displayed.first, displayed.second])}
                    className="col-start-1 row-start-1 grid grid-cols-2 gap-[12px] max-[760px]:grid-cols-1"
                    initial={{ opacity: 0, scale: reducedMotion ? 1 : 1.015 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                    {[displayed.first, displayed.second].map((src, index) => src && <div
                        key={index}
                        className={`aspect-[3/4] w-full overflow-hidden rounded-[20px] bg-[#ececec] shadow-[0_2px_7px_rgba(0,0,0,0.14)] ${index === 1 ? "max-[760px]:hidden" : ""}`}
                    >
                        <img
                            src={getOptimizedCloudinaryImage(src, 1080)}
                            srcSet={getCloudinarySrcSet(src)}
                            sizes={IMAGE_SIZES}
                            alt={`${title}${index === 1 ? " detail" : ""}`}
                            className="h-full w-full object-contain"
                            loading="eager"
                            fetchPriority="high"
                            decoding="async"
                        />
                    </div>)}
                </motion.div>
            </AnimatePresence>
        </div>
        {isPending && !failed && <span role="status" className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs text-black shadow-sm">Loading images…</span>}
        {failed && <span role="status" className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs text-black shadow-sm">Image unavailable. Select another view.</span>}
    </div>;
}
