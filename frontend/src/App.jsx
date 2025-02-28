// src/App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./middleware/ProtectedRoute";
import RequireBusinessProfile from "./middleware/RequireBusinessProfile";

// Layouts
import RootLayout from "./layouts/RootLayout";
import AdminLayout from "./layouts/AdminLayout";
import SellerLayout from "./layouts/SellerLayout";

// Public Pages
import HomePage from "./pages/public/HomePage";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import EventsPage from "./pages/public/EventPage";
import ProductsPage from "./pages/public/ProductsPage";
import ProductDetails from "./components/products/ProductDetails";

// Event Pages
import CreateEvent from "./pages/events/CreateEvent";
import EditEvent from "./pages/events/EditEvent";
import EventDetails from "./pages/events/EventDetails";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSellers from "./pages/admin/AdminSellers";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";

// Seller Pages
import BusinessSetup from "./pages/dashboard/seller/BusinessSetup";
import SellerDashboard from "./pages/dashboard/seller/SellerDashboard";
import ManageProducts from "./pages/dashboard/seller/ManageProducts";
import AddProduct from "./pages/dashboard/seller/AddProduct";
import EditProduct from "./pages/dashboard/seller/EditProduct";
import SellerOrders from "./pages/dashboard/seller/SellerOrders";
import SellerEvents from "./pages/dashboard/seller/SellerEvents"; // Import the new component
import SellerAnalytics from "./pages/dashboard/seller/SellerAnalytics";
import SellerSettings from "./pages/dashboard/seller/SellerSettings";

// Buyer Pages
import BuyerDashboard from "./pages/dashboard/buyer/BuyerDashboard";
import ManageEvents from "./pages/dashboard/buyer/ManageEvents";

// Error Boundary
import ErrorBoundary from "./components/common/ErrorBoundary";

const Root = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

const router = createBrowserRouter(
  [
    {
      element: <Root />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          element: <RootLayout />,
          children: [
            // Public Routes
            { path: "/", element: <HomePage /> },
            { path: "/auth/signin", element: <SignIn /> },
            { path: "/auth/signup", element: <SignUp /> },

            // Product Routes
            { path: "/products", element: <ProductsPage /> },
            { path: "/products/:id", element: <ProductDetails /> },

            // Event Routes
            { path: "/events", element: <EventsPage /> },
            { path: "/events/:id", element: <EventDetails /> },
            {
              path: "/events/create",
              element: (
                <ProtectedRoute allowedRoles={["buyer", "seller"]}>
                  <CreateEvent />
                </ProtectedRoute>
              ),
            },
            {
              path: "/events/edit/:id",
              element: (
                <ProtectedRoute allowedRoles={["buyer", "seller"]}>
                  <EditEvent />
                </ProtectedRoute>
              ),
            },
          ],
        },

        // Buyer Routes
        {
          path: "/buyer",
          element: (
            <ProtectedRoute allowedRoles={["buyer"]}>
              <RootLayout />
            </ProtectedRoute>
          ),
          children: [
            { path: "dashboard", element: <BuyerDashboard /> },
            { path: "events", element: <ManageEvents /> },
            {
              path: "events/edit/:id",
              element: <EditEvent />,
            },
          ],
        },

        // Seller Routes
        {
          path: "/seller",
          element: (
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerLayout />
            </ProtectedRoute>
          ),
          children: [
            { path: "setup", element: <BusinessSetup /> },
            {
              path: "dashboard",
              element: (
                <RequireBusinessProfile>
                  <SellerDashboard />
                </RequireBusinessProfile>
              ),
            },
            {
              path: "products",
              element: (
                <RequireBusinessProfile>
                  <ManageProducts />
                </RequireBusinessProfile>
              ),
            },
            {
              path: "products/add",
              element: (
                <RequireBusinessProfile>
                  <AddProduct />
                </RequireBusinessProfile>
              ),
            },
            {
              path: "products/edit/:id",
              element: (
                <RequireBusinessProfile>
                  <EditProduct />
                </RequireBusinessProfile>
              ),
            },
            {
              path: "orders",
              element: (
                <RequireBusinessProfile>
                  <SellerOrders />
                </RequireBusinessProfile>
              ),
            },
            {
              path: "events",
              element: (
                <RequireBusinessProfile>
                  <SellerEvents />
                </RequireBusinessProfile>
              ),
            },
            {
              path: "analytics",
              element: (
                <RequireBusinessProfile>
                  <SellerAnalytics />
                </RequireBusinessProfile>
              ),
            },
            {
              path: "settings",
              element: (
                <RequireBusinessProfile>
                  <SellerSettings />
                </RequireBusinessProfile>
              ),
            },
          ],
        },

        // Admin Routes
        {
          path: "/admin",
          children: [
            { path: "login", element: <AdminLogin /> },
            {
              element: (
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              ),
              children: [
                { path: "dashboard", element: <AdminDashboard /> },
                { path: "users", element: <AdminUsers /> },
                { path: "sellers", element: <AdminSellers /> },
                { path: "events", element: <AdminEvents /> },
                { path: "products", element: <AdminProducts /> },
                { path: "categories", element: <AdminCategories /> },
                { path: "settings", element: <AdminSettings /> },
              ],
            },
          ],
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
