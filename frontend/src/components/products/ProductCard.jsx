import React from "react";
import { Card, CardContent, CardFooter } from "./Card";
import Button from "./Button";

const ProductCard = ({
  product = {
    id: "",
    name: "",
    price: 0,
    image: "",
    description: "",
    category: "",
  },
  onAddToWishlist,
  onAddToCart,
}) => {
  return (
    <Card className="h-full flex flex-col">
      <div className="relative pt-[75%] overflow-hidden">
        <img
          src={product.image || "/api/placeholder/300/225"}
          alt={product.name}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform hover:scale-105"
        />
        {product.discountPercentage && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discountPercentage}% OFF
          </div>
        )}
      </div>

      <CardContent className="flex-grow">
        <div className="text-sm text-gray-500 mb-1">{product.category}</div>
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="font-bold text-lg">
          {product.originalPrice ? (
            <div className="flex items-center gap-2">
              <span>KSh {product.price.toLocaleString()}</span>
              <span className="text-sm text-gray-500 line-through">
                KSh {product.originalPrice.toLocaleString()}
              </span>
            </div>
          ) : (
            <span>KSh {product.price.toLocaleString()}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-4 px-4 flex flex-col gap-2">
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={() => onAddToCart && onAddToCart(product)}
        >
          Add to Cart
        </Button>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => onAddToWishlist && onAddToWishlist(product)}
        >
          Add to Wishlist
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
