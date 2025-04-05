import React from "react";
import { Check } from "lucide-react";

const CheckoutProgressBar = ({ currentStep, steps = ["Eligibility", "Shipping", "Confirmation", "Processing", "Complete"] }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step Circle */}
            <div className="relative flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                  ${index < currentStep 
                    ? "bg-green-500 border-green-500 text-white" 
                    : index === currentStep 
                      ? "border-blue-600 text-blue-600" 
                      : "border-gray-300 text-gray-300"
                  }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="text-xs mt-1 text-center">
                <span 
                  className={
                    index < currentStep 
                      ? "text-green-600" 
                      : index === currentStep 
                        ? "text-blue-600 font-medium" 
                        : "text-gray-500"
                  }
                >
                  {step}
                </span>
              </div>
            </div>
            
            {/* Connector Line (except after the last step) */}
            {index < steps.length - 1 && (
              <div 
                className={`flex-1 h-0.5 mx-2 
                  ${index < currentStep 
                    ? "bg-green-500" 
                    : "bg-gray-300"
                  }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CheckoutProgressBar;