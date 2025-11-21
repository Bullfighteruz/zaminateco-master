import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/use-mobile';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

const CartSidebar: React.FC = () => {
  const { t } = useTranslation(['shop', 'translation']);
  const isMobile = useIsMobile();
  const {
    cart,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  } = useCart();

  const [removingItem, setRemovingItem] = useState<number | null>(null);
  const total = getCartTotal();

  // Format price for display
  const formatPrice = (price: string | number): string => {
    if (typeof price === 'number') {
      return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
    }
    return price;
  };

  // Calculate item total price
  const getItemTotal = (item: { price: string; quantity: number }): number => {
    const priceValue = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
    return priceValue * item.quantity;
  };

  const handleRemoveItem = (itemId: number) => {
    setRemovingItem(itemId);
    setTimeout(() => {
      removeFromCart(itemId);
      setRemovingItem(null);
      toast.success(t('itemRemoved', { defaultValue: 'Item removed from cart', ns: 'translation' }));
    }, 200);
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    clearCart();
    toast.success(t('cartCleared', { defaultValue: 'Cart cleared', ns: 'translation' }));
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent
        side="right"
        className={cn(
          "p-0 flex flex-col overflow-hidden bg-white [&>button]:hidden",
          isMobile 
            ? "w-[90vw] max-w-[380px]" 
            : "w-full sm:w-[440px] lg:w-[500px]"
        )}
      >
        {/* Header */}
        <SheetHeader className={cn(
          "relative border-b bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white flex-shrink-0",
          isMobile ? "px-3 py-2.5" : "px-4 py-3"
        )}>
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  src="/images/add-to-cart.png"
                  alt="Cart"
                  className={cn(
                    "object-contain drop-shadow-lg",
                    isMobile ? "w-8 h-8" : "w-10 h-10"
                  )}
                />
                {cartCount > 0 && (
                  <Badge
                    className={cn(
                      "absolute -top-1.5 -right-1.5 bg-red-500 text-white border-2 border-white shadow-lg font-bold",
                      isMobile ? "h-5 w-5 text-[10px] px-0" : "h-5.5 w-5.5 text-[11px] px-0"
                    )}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </Badge>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className={cn(
                  "font-bold text-white drop-shadow-sm leading-tight",
                  isMobile ? "text-sm" : "text-base"
                )}>
                  {t('cart', { defaultValue: 'Shopping Cart', ns: 'translation' })}
                </SheetTitle>
                {cartCount > 0 && (
                  <p className={cn(
                    "text-green-50/90 leading-tight",
                    isMobile ? "text-[10px] mt-0.5" : "text-xs mt-0.5"
                  )}>
                    {cartCount} {cartCount === 1 ? t('item', { defaultValue: 'item', ns: 'translation' }) : t('items', { defaultValue: 'items', ns: 'translation' })}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}
              className={cn(
                "text-white hover:bg-white/20 h-8 w-8 flex-shrink-0",
                isMobile ? "" : ""
              )}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Product List */}
        <div className={cn(
          "flex-1 overflow-y-auto overscroll-contain",
          isMobile ? "px-2.5 py-2" : "px-3 py-2.5"
        )}>
          <AnimatePresence mode="popLayout">
            {cart.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full text-center px-4"
              >
                <ShoppingBag className={cn(
                  "text-gray-300 mb-4",
                  isMobile ? "h-14 w-14" : "h-20 w-20"
                )} />
                <h3 className={cn(
                  "font-bold text-gray-700 mb-2",
                  isMobile ? "text-sm" : "text-lg"
                )}>
                  {t('cartEmpty', { defaultValue: 'Your cart is empty', ns: 'translation' })}
                </h3>
                <p className={cn(
                  "text-gray-500 mb-6",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  {t('addItemsToCart', { defaultValue: 'Add items to get started', ns: 'translation' })}
                </p>
                <Button
                  onClick={() => setIsCartOpen(false)}
                  className={cn(
                    "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white",
                    isMobile ? "h-9 text-xs px-5" : "h-10 text-sm px-6"
                  )}
                >
                  <ArrowRight className="mr-2 h-3.5 w-3.5" />
                  {t('continueShopping', { defaultValue: 'Continue Shopping', ns: 'translation' })}
                </Button>
              </motion.div>
            ) : (
              <div className={cn("space-y-2", isMobile ? "" : "space-y-2.5")}>
                {cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.2, delay: index * 0.015 }}
                    className={removingItem === item.id ? "opacity-40 pointer-events-none" : ""}
                  >
                    <Card className={cn(
                      "bg-white border border-gray-100 shadow-sm hover:shadow transition-all duration-150 overflow-hidden",
                      isMobile ? "" : "hover:border-green-200"
                    )}>
                      <CardContent className={cn(
                        isMobile ? "p-2.5" : "p-3"
                      )}>
                        <div className="flex gap-2.5">
                          {/* Product Image */}
                          <div className={cn(
                            "flex-shrink-0 rounded-md overflow-hidden",
                            "bg-gradient-to-br from-gray-50 to-white border border-gray-100",
                            isMobile ? "w-12 h-12" : "w-14 h-14"
                          )}>
                            <img
                              src={item.image || '/images/art-tiles.png'}
                              alt={item.name}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/art-tiles.png';
                              }}
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            {/* Name & Description */}
                            <div className="flex-1 min-w-0 mb-2">
                              <h4 className={cn(
                                "font-semibold text-gray-900 leading-tight mb-0.5 truncate",
                                isMobile ? "text-xs" : "text-sm"
                              )}>
                                {item.nameKey 
                                  ? t(item.nameKey, { ns: 'shop', defaultValue: item.name })
                                  : item.name
                                }
                              </h4>
                              {(item.descriptionKey || item.description) && (
                                <p className={cn(
                                  "text-gray-500 leading-tight line-clamp-1",
                                  isMobile ? "text-[10px]" : "text-[11px]"
                                )}>
                                  {item.descriptionKey
                                    ? t(item.descriptionKey, { ns: 'shop', defaultValue: item.description || '' })
                                    : item.description
                                  }
                                </p>
                              )}
                            </div>

                            {/* Price & Total */}
                            <div className="flex items-baseline justify-between gap-2 mb-2">
                              <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
                                <span className={cn(
                                  "font-bold text-green-600",
                                  isMobile ? "text-xs" : "text-sm"
                                )}>
                                  {formatPrice(item.price)}
                                </span>
                                <span className={cn(
                                  "text-gray-400",
                                  isMobile ? "text-[9px]" : "text-[10px]"
                                )}>
                                  {t('perUnit', { defaultValue: 'each', ns: 'translation' })}
                                </span>
                              </div>
                              <div className="flex items-baseline gap-1 flex-shrink-0">
                                <span className={cn(
                                  "text-gray-500",
                                  isMobile ? "text-[9px]" : "text-[10px]"
                                )}>
                                  {t('itemTotal', { defaultValue: 'Total', ns: 'translation' })}:
                                </span>
                                <span className={cn(
                                  "font-bold text-gray-900",
                                  isMobile ? "text-[10px]" : "text-xs"
                                )}>
                                  {formatPrice(getItemTotal(item))}
                                </span>
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className={cn(
                                    "h-7 w-7 rounded border border-gray-200 bg-white",
                                    "hover:border-green-400 hover:bg-green-50 hover:text-green-700",
                                    "disabled:opacity-30 disabled:cursor-not-allowed",
                                    "transition-all duration-100"
                                  )}
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <div className={cn(
                                  "h-7 min-w-[2rem] px-1.5",
                                  "font-semibold text-center",
                                  "bg-gradient-to-b from-green-50 to-emerald-50",
                                  "border border-green-200 rounded",
                                  "flex items-center justify-center text-gray-900",
                                  isMobile ? "text-[11px]" : "text-xs"
                                )}>
                                  {item.quantity}
                                </div>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className={cn(
                                    "h-7 w-7 rounded border border-gray-200 bg-white",
                                    "hover:border-green-400 hover:bg-green-50 hover:text-green-700",
                                    "transition-all duration-100"
                                  )}
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-7 w-7 rounded text-gray-400",
                                  "hover:text-red-600 hover:bg-red-50",
                                  "transition-all duration-100"
                                )}
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "border-t border-gray-100 bg-white flex-shrink-0",
              "shadow-[0_-2px_8px_rgba(0,0,0,0.04)]",
              isMobile ? "px-2.5 py-2.5 space-y-2.5" : "px-3 py-3 space-y-3"
            )}
          >
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={cn(
                  "font-medium text-gray-600",
                  isMobile ? "text-[11px]" : "text-xs"
                )}>
                  {t('subtotal', { defaultValue: 'Subtotal', ns: 'translation' })}
                </span>
                <span className={cn(
                  "font-semibold text-gray-700",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  {formatPrice(total)}
                </span>
              </div>
              
              <Separator className="bg-gray-100" />
              
              <div className={cn(
                "flex justify-between items-center",
                "bg-gradient-to-r from-green-50 via-emerald-50 to-green-50",
                "rounded-md border border-green-100",
                isMobile ? "px-2.5 py-2" : "px-3 py-2.5"
              )}>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={cn(
                    "text-green-600",
                    isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                  )} />
                  <span className={cn(
                    "font-semibold text-gray-900",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {t('total', { defaultValue: 'Total', ns: 'translation' })}
                  </span>
                </div>
                <span className={cn(
                  "font-bold text-green-600",
                  isMobile ? "text-base" : "text-lg"
                )}>
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={cn(
              "flex gap-2",
              isMobile ? "flex-col" : "flex-row"
            )}>
              <Button
                variant="outline"
                onClick={handleClearCart}
                className={cn(
                  "flex-1 h-9 rounded-md",
                  "border border-gray-200 bg-white",
                  "text-gray-700 hover:text-red-600",
                  "hover:border-red-200 hover:bg-red-50",
                  "font-medium transition-all duration-100",
                  "flex items-center justify-center gap-1.5",
                  isMobile ? "text-[11px]" : "text-xs"
                )}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t('clearCart', { defaultValue: 'Clear Cart', ns: 'translation' })}</span>
              </Button>
              <Button
                onClick={() => {
                  toast.info(t('checkoutComingSoon', { defaultValue: 'Checkout coming soon!', ns: 'translation' }));
                }}
                className={cn(
                  "flex-1 h-9 rounded-md",
                  "bg-gradient-to-r from-green-600 via-emerald-600 to-green-600",
                  "hover:from-green-700 hover:via-emerald-700 hover:to-green-700",
                  "text-white font-semibold shadow-sm hover:shadow",
                  "transition-all duration-100",
                  "flex items-center justify-center gap-1.5",
                  isMobile ? "text-[11px]" : "text-xs"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t('checkout', { defaultValue: 'Checkout', ns: 'translation' })}</span>
              </Button>
            </div>
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
