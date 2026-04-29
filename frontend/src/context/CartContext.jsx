import { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showNotification } = useNotification();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    console.log('📦 Loading cart from localStorage:', savedCart);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        console.log('✅ Parsed cart:', parsed);
        setCartItems(parsed);
      } catch (error) {
        console.error('❌ Error parsing cart:', error);
        localStorage.removeItem('cart');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes (but not on initial load)
  useEffect(() => {
    if (isLoaded) {
      console.log('💾 Saving cart to localStorage:', cartItems);
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product) => {
    console.log('🛒 Adding to cart:', product);
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      if (existingItem) {
        // If product already in cart, increase quantity
        console.log('✅ Product already in cart, increasing quantity');
        showNotification(`${product.name} is already in cart. Quantity updated!`, 'info');
        return prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new product with quantity 1
        console.log('✅ Adding new product to cart');
        const newCart = [...prevItems, { ...product, quantity: 1 }];
        console.log('📦 New cart:', newCart);
        showNotification(`${product.name} added to cart!`, 'success');
        return newCart;
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
    showNotification('Item removed from cart', 'warning');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    showNotification('Cart cleared', 'info');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.length; // Return number of unique products
  };

  const getTotalQuantity = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0); // Return total quantity
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item._id === productId);
  };

  const getCartItemQuantity = (productId) => {
    const item = cartItems.find(item => item._id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        getTotalQuantity,
        isInCart,
        getCartItemQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
