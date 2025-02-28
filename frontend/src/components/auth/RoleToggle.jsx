// src/components/auth/RoleToggle.jsx
const RoleToggle = ({ selectedRole, onRoleChange }) => {
  return (
    <div className="rounded-full bg-gray-100 p-1">
      <div className="flex">
        <button
          onClick={() => onRoleChange("buyer")}
          className={`flex-1 rounded-full py-2 px-4 transition-colors ${
            selectedRole === "buyer"
              ? "bg-white text-[#5551FF] shadow-sm"
              : "text-gray-500"
          }`}
        >
          Customer
        </button>
        <button
          onClick={() => onRoleChange("seller")}
          className={`flex-1 rounded-full py-2 px-4 transition-colors ${
            selectedRole === "seller"
              ? "bg-white text-[#5551FF] shadow-sm"
              : "text-gray-500"
          }`}
        >
          As A Seller
        </button>
      </div>
    </div>
  );
};

export default RoleToggle;
