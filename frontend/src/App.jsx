// frontend/src/App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./middleware/ProtectedRoute";
import RequireBusinessProfile from "./middleware/RequireBusinessProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import RootLayout from "./layouts/RootLayout";
import AdminLayout from "./layouts/AdminLayout";
import SellerLayout from "./layouts/SellerLayout";

// Public Pages
import HomePage from "./pages/public/HomePage";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ResendVerification from "./pages/auth/ResendVerification";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import EventsPage from "./pages/public/EventsPage";
import ProductsPage from "./pages/public/ProductsPage";
import ProductDetailsPage from "./pages/public/ProductDetailsPage";

// Event Pages
import CreateEvent from "./pages/events/CreateEvent";
import EditEvent from "./pages/events/EditEvent";
import EventDetails from "./pages/events/EventDetails";
import MyEventsPage from "./pages/events/MyEventsPage";
import CompletedEventsPage from "./pages/events/CompletedEventsPage";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSellers from "./pages/admin/AdminSellers";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminApprovalsList from "./pages/admin/AdminApprovalsList";
import AdminProductReview from "./pages/admin/AdminProductReview";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";

// Seller Pages
import BusinessSetup from "./pages/dashboard/seller/BusinessSetup";
import SellerDashboard from "./pages/dashboard/seller/SellerDashboard";
import ManageProducts from "./pages/dashboard/seller/ManageProducts";
import AddProduct from "./pages/dashboard/seller/AddProduct";
import EditProduct from "./pages/dashboard/seller/EditProduct";
import SellerOrders from "./pages/dashboard/seller/SellerOrders";
import SellerAnalytics from "./pages/dashboard/seller/SellerAnalytics";
import SellerSettings from "./pages/dashboard/seller/SellerSettings";
import BusinessProfilePage from "./pages/dashboard/seller/BusinessProfilePage";
import SellerEvents from "./pages/dashboard/seller/SellerEvents";

// Error Boundary
import ErrorBoundary from "./components/common/ErrorBoundary";

const Root = () => {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={5000} />
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

            // Auth Routes
            { path: "/auth/signin", element: <SignIn /> },
            { path: "/auth/signup", element: <SignUp /> },
            { path: "/auth/verify-email/:token", element: <VerifyEmail /> },
            {
              path: "/auth/resend-verification",
              element: <ResendVerification />,
            },
            { path: "/auth/forgot-password", element: <ForgotPassword /> },
            { path: "/auth/reset-password/:token", element: <ResetPassword /> },

            // Product Routes
            { path: "/products", element: <ProductsPage /> },
            { path: "/products/:id", element: <ProductDetailsPage /> },

            // Event Routes
            { path: "/events", element: <EventsPage /> },
            { path: "/events/:id", element: <EventDetails /> },

            // Consolidated My Events Page (protected)
            {
              path: "/events/my-events",
              element: (
                <ProtectedRoute allowedRoles={["buyer", "seller"]}>
                  <MyEventsPage />
                </ProtectedRoute>
              ),
            },

            // Completed Events Page (new)
            {
              path: "/events/completed",
              element: (
                <ProtectedRoute allowedRoles={["buyer", "seller"]}>
                  <CompletedEventsPage />
                </ProtectedRoute>
              ),
            },

            // Create/Edit Event (protected)
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
            {
              path: "profile",
              element: (
                <RequireBusinessProfile>
                  <BusinessProfilePage />
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
                { path: "approvals", element: <AdminApprovalsList /> },
                { path: "product-review/:id", element: <AdminProductReview /> },
                { path: "orders", element: <AdminOrders /> },
                { path: "orders/:id", element: <AdminOrderDetail /> },
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