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

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSellers from "./pages/admin/AdminSellers";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminSettings from "./pages/admin/AdminSettings";

// Seller Pages
import BusinessSetup from "./pages/dashboard/seller/BusinessSetup";
import SellerDashboard from "./pages/dashboard/seller/SellerDashboard";
import ManageProducts from "./pages/dashboard/seller/ManageProducts";
import SellerOrders from "./pages/dashboard/seller/SellerOrders";
import SellerAnalytics from "./pages/dashboard/seller/SellerAnalytics";
import SellerSettings from "./pages/dashboard/seller/SellerSettings";

// Error Boundary
import ErrorBoundary from "./components/common/ErrorBoundary";

// Root component to wrap the entire app with AuthProvider
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
            {
              path: "/",
              element: <HomePage />,
            },
            {
              path: "/events",
              element: <EventsPage />,
            },
            {
              path: "/products",
              element: <ProductsPage />,
            },
            {
              path: "/auth/signin",
              element: <SignIn />,
            },
            {
              path: "/auth/signup",
              element: <SignUp />,
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
            {
              path: "setup",
              element: <BusinessSetup />,
            },
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
              path: "orders",
              element: (
                <RequireBusinessProfile>
                  <SellerOrders />
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
            {
              path: "login",
              element: <AdminLogin />,
            },
            {
              element: (
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              ),
              children: [
                {
                  path: "dashboard",
                  element: <AdminDashboard />,
                },
                {
                  path: "users",
                  element: <AdminUsers />,
                },
                {
                  path: "sellers",
                  element: <AdminSellers />,
                },
                {
                  path: "events",
                  element: <AdminEvents />,
                },
                {
                  path: "settings",
                  element: <AdminSettings />,
                },
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
