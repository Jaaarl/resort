import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/analytics/DashboardPage";
import RoomListPage from "./pages/rooms/RoomListPage";
import ReservationListPage from "./pages/reservations/ReservationListPage";
import PoolListPage from "./pages/pool/PoolListPage";
import MaintenancePage from "./pages/maintenance/MaintenancePage";
import InventoryPage from "./pages/inventory/InventoryPage";
import FeedbackPage from "./pages/feedback/FeedbackPage";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/rooms", element: <RoomListPage /> },
      { path: "/reservations", element: <ReservationListPage /> },
      { path: "/pool", element: <PoolListPage /> },
      { path: "/maintenance", element: <MaintenancePage /> },
      { path: "/inventory", element: <InventoryPage /> },
      { path: "/feedback", element: <FeedbackPage /> },
    ],
  },
]);
