// src/components/ui/card.jsx
import React from "react";

// Card component with variants
const Card = ({
  className,
  children,
  variant = "default", // default, outline, or elevated
}) => {
  const baseStyles = "rounded-lg overflow-hidden";

  const variantStyles = {
    default: "bg-white border border-gray-200",
    outline: "bg-transparent border border-gray-300",
    elevated: "bg-white shadow-md border-none",
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className || ""}`}
    >
      {children}
    </div>
  );
};

// Card header subcomponent
const CardHeader = ({ className, children }) => {
  return (
    <div className={`p-4 border-b border-gray-200 ${className || ""}`}>
      {children}
    </div>
  );
};

// Card title subcomponent
const CardTitle = ({ className, children }) => {
  return (
    <h3 className={`text-lg font-medium ${className || ""}`}>{children}</h3>
  );
};

// Card content subcomponent
const CardContent = ({ className, children }) => {
  return <div className={`p-4 ${className || ""}`}>{children}</div>;
};

// Card footer subcomponent
const CardFooter = ({ className, children }) => {
  return (
    <div className={`p-4 border-t border-gray-200 ${className || ""}`}>
      {children}
    </div>
  );
};

// Named exports for all components
export { Card, CardHeader, CardTitle, CardContent, CardFooter };

// Default export for the Card component
export default Card;
