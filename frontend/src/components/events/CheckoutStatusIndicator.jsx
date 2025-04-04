// File: frontend/src/components/events/CheckoutStatusIndicator.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

const CheckoutStatusIndicator = ({ status, onRetry, processingTime = 0, error = null }) => {
  const [elapsedTime, setElapsedTime] = useState(processingTime);
  
  useEffect(() => {
    let timer;
    if (status === 'processing') {
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status]);
  
  // Format elapsed time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Determine if processing is taking too long (over 30 seconds)
  const isLongProcessing = elapsedTime > 30;

  if (status === 'success') {
    return (
      <div className="flex items-center bg-green-50 border border-green-200 rounded-lg p-4 my-4">
        <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
        <div>
          <div className="font-medium text-green-800">Checkout Complete</div>
          <div className="text-green-700 text-sm">Your order has been successfully processed.</div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-start bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <AlertCircle className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium text-red-800">Checkout Error</div>
          <div className="text-red-700 text-sm mb-2">{error || "There was a problem processing your checkout."}</div>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Retry Checkout
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start ${isLongProcessing ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'} rounded-lg p-4 my-4`}>
      <div className="flex-shrink-0 mr-3">
        {isLongProcessing ? (
          <AlertCircle className="w-6 h-6 text-amber-500" />
        ) : (
          <div className="relative">
            <Clock className="w-6 h-6 text-blue-500" />
            <RefreshCw className="w-3 h-3 text-blue-600 absolute top-1.5 left-1.5 animate-spin" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className={`font-medium ${isLongProcessing ? 'text-amber-800' : 'text-blue-800'}`}>
          {isLongProcessing ? 'Processing Taking Longer Than Expected' : 'Processing Checkout'}
        </div>
        
        <div className={`text-sm ${isLongProcessing ? 'text-amber-700' : 'text-blue-700'}`}>
          {isLongProcessing 
            ? "Your checkout is still being processed. This may take a few moments. You can check your orders page later." 
            : "Please wait while we process your checkout..."
          }
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div className={`text-xs ${isLongProcessing ? 'text-amber-600' : 'text-blue-600'}`}>
            Processing time: {formatTime(elapsedTime)}
          </div>
          
          {isLongProcessing && onRetry && (
            <button 
              onClick={onRetry}
              className="inline-flex items-center px-3 py-1.5 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Check Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutStatusIndicator;