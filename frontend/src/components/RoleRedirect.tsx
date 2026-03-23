import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function RoleRedirect() {
  const { user } = useAuthStore();

  if (user?.role === "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/my-tasks" replace />;
}
