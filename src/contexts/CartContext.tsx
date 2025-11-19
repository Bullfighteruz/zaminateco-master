import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  id: number;
  name: string; // Translated name (for backward compatibility)
  price: string;
  image: string;
  quantity: number;
  description?: string; // Translated description (for backward compatibility)
  // Translation keys for dynamic language switching
  nameKey?: string;
  descriptionKey?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: { id: number; productName: string; price: string; image: string; description?: string; nameKey?: string; descriptionKey?: string }) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'zaminat_cart';

// Load cart from localStorage
const loadCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

// Save cart to localStorage
const saveCart = (cart: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Dispatch custom event for cross-tab synchronization
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Track processing state to prevent double-adds (especially in React StrictMode)
  const processingRef = useRef<Set<number>>(new Set());

  // Calculate cart count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Load cart on mount and listen for storage changes
  useEffect(() => {
    let isUpdating = false;
    
    const handleStorageChange = () => {
      // Prevent infinite loops - only update if we're not currently updating
      if (!isUpdating) {
        isUpdating = true;
        setCart(loadCart());
        // Reset flag after a short delay
        setTimeout(() => {
          isUpdating = false;
        }, 100);
      }
    };

    // Listen for localStorage changes (from other tabs)
    window.addEventListener('storage', handleStorageChange);
    // Listen for custom cart update events (from same tab) - but only for cross-tab sync
    // We don't need to listen to our own cartUpdated events since we're already updating state

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Add item to cart
  const addToCart = (product: { id: number; productName: string; price: string; image: string; description?: string; nameKey?: string; descriptionKey?: string }) => {
    // Prevent double-adds: check if this product is already being processed
    if (processingRef.current.has(product.id)) {
      return; // Already processing this product, ignore duplicate call
    }
    
    // Mark product as processing
    processingRef.current.add(product.id);
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      let newCart: CartItem[];
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [
          ...prevCart,
          {
            id: product.id,
            name: product.productName, // Keep for backward compatibility
            price: product.price,
            image: product.image,
            quantity: 1,
            description: product.description, // Keep for backward compatibility
            // Store translation keys for dynamic language switching
            nameKey: product.nameKey,
            descriptionKey: product.descriptionKey,
          },
        ];
      }
      
      saveCart(newCart);
      
      // Remove from processing set after a short delay
      setTimeout(() => {
        processingRef.current.delete(product.id);
      }, 500);
      
      // Don't auto-open cart - let user decide when to view it
      return newCart;
    });
  };

  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== productId);
      saveCart(newCart);
      return newCart;
    });
  };

  // Update item quantity
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      );
      saveCart(newCart);
      return newCart;
    });
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
    saveCart([]);
  };

  // Calculate cart total (simplified - assumes price is in UZS format like "219 000 UZS")
  const getCartTotal = (): number => {
    return cart.reduce((total, item) => {
      // Extract numeric value from price string (e.g., "219 000 UZS" -> 219000)
      const priceValue = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
      return total + (priceValue * item.quantity);
    }, 0);
  };

  const value: CartContextType = {
    cart,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

