// src/components/common/Input.jsx
import React, { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      type = "text",
      label,
      name,
      value,
      onChange,
      onBlur,
      placeholder,
      error,
      helperText,
      icon,
      iconPosition = "left",
      disabled = false,
      required = false,
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const baseInputStyles = `
    w-full 
    border 
    rounded-lg 
    focus:outline-none 
    focus:ring-2 
    focus:ring-[#5551FF] 
    focus:border-[#5551FF] 
    transition-colors
    ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"}
    ${error ? "border-red-500" : "border-gray-300"}
    ${icon && iconPosition === "left" ? "pl-10" : "pl-4"}
    ${icon && iconPosition === "right" ? "pr-10" : "pr-4"}
    py-2
  `;

    return (
      <div className={`mb-4 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`${baseInputStyles} ${className}`}
            {...props}
          />

          {icon && iconPosition === "right" && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={`mt-1 text-sm ${
              error ? "text-red-600" : "text-gray-500"
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Specialized Input Components
export const TextArea = forwardRef(({ rows = 4, ...props }, ref) => (
  <Input ref={ref} as="textarea" rows={rows} {...props} />
));

TextArea.displayName = "TextArea";

export const Select = forwardRef(({ children, ...props }, ref) => (
  <Input ref={ref} as="select" {...props}>
    {children}
  </Input>
));

Select.displayName = "Select";

export const Checkbox = forwardRef(({ label, ...props }, ref) => (
  <div className="flex items-center">
    <input
      ref={ref}
      type="checkbox"
      className="h-4 w-4 text-[#5551FF] focus:ring-[#5551FF] border-gray-300 rounded"
      {...props}
    />
    {label && (
      <label
        htmlFor={props.id || props.name}
        className="ml-2 block text-sm text-gray-700"
      >
        {label}
      </label>
    )}
  </div>
));

Checkbox.displayName = "Checkbox";

export default Input;
