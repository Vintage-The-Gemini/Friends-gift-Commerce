// src/components/auth/AuthStyles.js
export const authStyles = {
    container: "min-h-screen flex flex-col items-center pt-10 px-4",
    logo: "text-[#5551FF] text-2xl font-['Inter'] mb-8",
    card: "w-full max-w-md border border-[#5551FF] rounded-lg p-6 bg-white",
    tabs: "flex border-b mb-6",
    activeTab: "flex-1 text-center border-b-2 border-[#5551FF] pb-2 text-[#5551FF] font-medium",
    inactiveTab: "flex-1 text-center pb-2 text-gray-400",
    roleToggle: "bg-gray-100 rounded-full p-1 mb-6",
    roleButton: (isActive) => `
      flex-1 py-2 px-4 rounded-full text-sm transition-colors font-medium
      ${isActive ? 'bg-white text-[#5551FF]' : 'text-gray-500'}
    `,
    input: "w-full px-4 py-2 border rounded-lg focus:border-[#5551FF] focus:ring-1 focus:ring-[#5551FF] font-['Inter']",
    label: "block text-sm mb-1 font-['Inter']",
    button: "w-full bg-[#5551FF] text-white py-3 rounded-lg hover:bg-opacity-90 transition-colors font-medium",
    link: "text-[#5551FF] hover:text-opacity-90 font-medium"
  };