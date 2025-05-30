// frontend/src/components/common/WishlistButton.jsx
import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';

const WishlistButton = ({ 
  productId, 
  size = 'md', 
  variant = 'outline',
  showText = false,
  className = '',
  ...props 
}) => {
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist, loading } = useWishlist();
  
  const inWishlist = isInWishlist(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Could trigger a sign-in modal or redirect
      return;
    }
    
    await toggleWishlist(productId);
  };

  // Size configurations
  const sizeClasses = {
    sm: {
      button: 'p-1.5',
      icon: 'w-4 h-4',
      text: 'text-xs'
    },
    md: {
      button: 'p-2',
      icon: 'w-5 h-5',
      text: 'text-sm'
    },
    lg: {
      button: 'p-3',
      icon: 'w-6 h-6',
      text: 'text-base'
    }
  };

  // Variant configurations
  const variantClasses = {
    outline: inWishlist 
      ? 'border border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
      : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
    filled: inWishlist
      ? 'bg-red-500 text-white hover:bg-red-600'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    minimal: inWishlist
      ? 'text-red-500 hover:text-red-600'
      : 'text-gray-400 hover:text-gray-600'
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        ${currentSize.button}
        ${currentVariant}
        ${variant !== 'minimal' ? 'rounded-lg' : ''}
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center
        ${className}
      `}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      {...props}
    >
      <Heart 
        className={`
          ${currentSize.icon} 
          transition-colors duration-200
          ${inWishlist ? 'fill-current' : ''}
        `} 
      />
      
      {showText && (
        <span className={`ml-2 ${currentSize.text} font-medium`}>
          {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </button>
  );
};

// Compact version for product cards
export const CompactWishlistButton = ({ productId, className = '' }) => (
  <WishlistButton
    productId={productId}
    size="sm"
    variant="minimal"
    className={`absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white ${className}`}
  />
);

// Full button with text
export const WishlistButtonWithText = ({ productId, className = '' }) => (
  <WishlistButton
    productId={productId}
    size="md"
    variant="outline"
    showText={true}
    className={`w-full ${className}`}
  />
);

export default WishlistButton;