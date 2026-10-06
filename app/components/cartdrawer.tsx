"use client";

import { getOptimizedCloudinaryImage } from "@/lib/cloudinaryImage";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, total, cartCount } = useCart();
  const router = useRouter();

  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    setQuantityInputs((prev) => {
      const next = { ...prev };

      cart.forEach((item) => {
        next[item.id] = String(item.quantity);
      });

      return next;
    });
  }, [cart]);

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  const handleViewCart = () => {
    onClose();
    router.push("/cart");
  };

  const getSafeQuantity = (value: string, stock?: number) => {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue) || numberValue <= 0) {
      return 1;
    }

    if (stock !== undefined && stock > 0) {
      return Math.min(numberValue, stock);
    }

    return numberValue;
  };

  const handleManualQuantityChange = (
    id: string,
    value: string,
    stock?: number
  ) => {
    const cleanValue = value.replace(/[^\d]/g, "");

    setQuantityInputs((prev) => ({
      ...prev,
      [id]: cleanValue,
    }));

    if (!cleanValue) return;

    const safeQuantity = getSafeQuantity(cleanValue, stock);
    updateQuantity(id, safeQuantity);
  };

  const handleManualQuantityBlur = (
    id: string,
    value: string,
    currentQuantity: number,
    stock?: number
  ) => {
    if (!value) {
      setQuantityInputs((prev) => ({
        ...prev,
        [id]: String(currentQuantity),
      }));
      return;
    }

    const safeQuantity = getSafeQuantity(value, stock);

    setQuantityInputs((prev) => ({
      ...prev,
      [id]: String(safeQuantity),
    }));

    updateQuantity(id, safeQuantity);
  };

  return (
    <>
      {/* Blur Overlay */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/35 backdrop-blur-[8px] transition-all duration-300 ${isOpen
          ? "opacity-100 visible"
          : "opacity-0 invisible pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[9999] h-dvh w-full max-w-[500px] bg-white text-black shadow-2xl transform transition-transform duration-300 ease-out font-[system-ui] ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {/* Header */}
        <div className="h-[86px] px-6 sm:px-7 flex items-center justify-between border-b border-black/10">
          <div className="flex items-center gap-3">
            <h2 className="text-[28px] sm:text-[30px] leading-none font-semibold tracking-[-0.8px] text-black">
              Add To Cart
            </h2>

            <div className="h-[34px] min-w-[74px] px-4 rounded-full border border-black/10 bg-white flex items-center justify-center text-[15px] leading-none font-normal text-black">
              {cartCount} Item{cartCount === 1 ? "" : "s"}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close cart"
            className="w-[34px] h-[34px] flex items-center justify-center text-black/55 text-[26px] leading-none font-light hover:text-black transition cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="h-[calc(100dvh-86px)] overflow-y-auto px-6 sm:px-7 pt-6 pb-[230px]">
          {cart.length === 0 ? (
            <div className="min-h-[55vh] flex flex-col items-center justify-center text-center">
              <div className="text-[44px] leading-none">🛍️</div>

              <h3 className="mt-5 text-[23px] font-semibold tracking-[-0.4px] text-black">
                Your cart is empty
              </h3>

              <p className="mt-2 text-[15px] text-black/55">
                Add some products to continue.
              </p>

              <button
                onClick={() => {
                  onClose();
                  router.push("/category");
                }}
                className="mt-7 h-[52px] px-8 rounded-full bg-black text-white text-[12px] tracking-[0.08em] uppercase hover:bg-white hover:text-black border border-black transition cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-7">
              {cart.map((item: any) => {
                const stock =
                  item.stock !== undefined && item.stock !== null
                    ? Number(item.stock)
                    : undefined;

                const isOutOfStock = stock === 0;
                const reachedStockLimit =
                  stock !== undefined && stock > 0 && item.quantity >= stock;

                const quantityValue =
                  quantityInputs[item.id] !== undefined
                    ? quantityInputs[item.id]
                    : String(item.quantity);

                return (
                  <li
                    key={item.id}
                    className="relative grid grid-cols-[100px_1fr_96px] gap-4 items-start min-h-[150px]"
                  >
                    {/* Product Image */}
                    <div className="w-[100px] h-[150px] bg-[#f1f1f1] overflow-hidden shrink-0">
                      <img
                        src={getOptimizedCloudinaryImage(item.image, 420)}
                        alt={item.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {/* Middle Info */}
                    <div className="min-w-0 pt-[1px] pr-2">
                      <h3 className="text-[13px] leading-[1.25] font-medium tracking-[0.08em] uppercase text-black underline underline-offset-[3px] decoration-[1px] truncate">
                        {item.name}
                      </h3>

                      <div className="mt-[12px] flex items-center gap-[8px] text-[12px] leading-none font-normal tracking-[0.08em] uppercase text-black">
                        <span
                          className="w-[17px] h-[17px] rounded-full inline-block shrink-0 border border-black/10"
                          style={{
                            backgroundColor:
                              item.colorHex ||
                              item.colorCode ||
                              item.hex ||
                              "#999999",
                          }}
                        />
                        <span className="truncate">{item.color}</span>
                        <span>/</span>
                        <span>{item.size}</span>
                      </div>

                      {isOutOfStock ? (
                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-600">
                          Out of Stock
                        </p>
                      ) : reachedStockLimit ? (
                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-600">
                          Only {stock} left in stock
                        </p>
                      ) : null}

                      {/* Quantity */}
                      <div className="mt-[15px]">
                        <div className="inline-grid h-[34px] w-[104px] grid-cols-[28px_1fr_28px] items-center overflow-hidden rounded-[10px] border border-[#d8d8d8] bg-white">
                          <button
                            onClick={() => {
                              const nextQuantity = item.quantity - 1;
                              updateQuantity(item.id, nextQuantity);
                              setQuantityInputs((prev) => ({
                                ...prev,
                                [item.id]: String(Math.max(1, nextQuantity)),
                              }));
                            }}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="h-full w-full flex items-center justify-center text-[18px] leading-none text-black disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          >
                            −
                          </button>

                          <input
                            value={quantityValue}
                            onChange={(e) =>
                              handleManualQuantityChange(
                                item.id,
                                e.target.value,
                                stock
                              )
                            }
                            onBlur={() =>
                              handleManualQuantityBlur(
                                item.id,
                                quantityValue,
                                item.quantity,
                                stock
                              )
                            }
                            inputMode="numeric"
                            pattern="[0-9]*"
                            disabled={isOutOfStock}
                            aria-label="Quantity"
                            className="h-full w-full bg-transparent text-center text-[14px] font-medium leading-none text-black outline-none disabled:opacity-40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />

                          <button
                            onClick={() => {
                              if (isOutOfStock) return;
                              if (reachedStockLimit) return;

                              const nextQuantity = item.quantity + 1;
                              updateQuantity(item.id, nextQuantity);
                              setQuantityInputs((prev) => ({
                                ...prev,
                                [item.id]: String(nextQuantity),
                              }));
                            }}
                            disabled={isOutOfStock || reachedStockLimit}
                            aria-label="Increase quantity"
                            className="h-full w-full flex items-center justify-center text-[18px] leading-none text-black disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                      className="absolute right-0 top-0 w-[20px] h-[20px] flex items-center justify-center text-[18px] leading-none text-black/60 hover:text-black transition cursor-pointer"
                    >
                      ×
                    </button>

                    {/* Price aligned with quantity */}
                    <p className="absolute right-0 top-[88px] text-[13px] leading-none font-normal tracking-[0.08em] text-black whitespace-nowrap">
                      ${Number(item.price * item.quantity).toFixed(2)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-black/20 px-6 sm:px-7 pt-5 pb-5">
            <div className="flex items-center justify-between">
              <p className="text-[18px] leading-none font-semibold tracking-[0.02em] text-black">
                Sub Total:
              </p>

              <p className="text-[24px] leading-none font-normal tracking-[-0.3px] text-black">
                ${Number(total).toFixed(2)}
              </p>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-6 w-full h-[54px] rounded-full bg-black border border-black text-white text-[12px] font-normal tracking-[0.08em] uppercase hover:bg-white hover:text-black transition cursor-pointer"
            >
              Continue To Checkout
            </button>

            <button
              onClick={handleViewCart}
              className="mt-3 w-full h-[54px] rounded-full bg-white border border-black text-black text-[12px] font-normal tracking-[0.08em] uppercase hover:bg-black hover:text-white transition cursor-pointer"
            >
              View Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}