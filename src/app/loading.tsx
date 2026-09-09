import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#f5f5f5] flex flex-col items-center justify-center">
      <div className="capybaraloader">
        <div className="capybara">
          <div className="capyhead">
            <div className="capyear">
              <div className="capyear2"></div>
            </div>
            <div className="capyear"></div>
            <div className="capymouth">
              <div className="capylips"></div>
              <div className="capylips"></div>
            </div>
            <div className="capyeye"></div>
            <div className="capyeye"></div>
          </div>
          <div className="capyleg"></div>
          <div className="capyleg2"></div>
          <div className="capyleg2"></div>
          <div className="capy"></div>
        </div>
        <div className="loader">
          <div className="loaderline"></div>
        </div>
      </div>
      <p className="mt-8 text-black font-extrabold tracking-widest uppercase text-xs animate-pulse">Loading...</p>
    </div>
  );
}
